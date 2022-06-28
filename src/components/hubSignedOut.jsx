import React from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import ContentBox from './ContentBox';

import Bauhaus from '../assets/img/bauhaus__raw.png';
import StarMaskOnboarding from '@starcoin/starmask-onboarding';

const HubSignedOut = () => {
  const { requestWallet } = useInjectedProvider();

  const initialClick = async () => {
    const initialStarCoin = () => {
      const currentUrl = new URL(window.location.href);
      const forwarderOrigin =
        currentUrl.hostname === 'localhost'
          ? 'http://localhost:9032'
          : undefined;

      const isStarMaskInstalled = StarMaskOnboarding.isStarMaskInstalled();
      const isStarMaskConnected = false;
      const accounts = [];

      let onboarding;
      try {
        onboarding = new StarMaskOnboarding({ forwarderOrigin });
      } catch (error) {
        console.error(error);
      }

      let chainInfo = {
        chain: '',
        network: '',
        accounts: '',
      };

      return {
        isStarMaskInstalled,
        isStarMaskConnected,
        accounts,
        onboarding,
        chainInfo,
      };
    };

    const initialData = initialStarCoin();
    const status = () => {
      if (!initialData.isStarMaskInstalled) {
        return 0;
      } else if (initialData.isStarMaskConnected) {
        initialData.onboarding?.stopOnboarding();
        return 2;
      } else {
        return 1;
      }
    };

    const _status = status();
    if (_status === 0) {
      initialData.onboarding.startOnboarding();
    } else if (_status === 1) {
      try {
        const newAccounts = await window.starcoin.request({
          method: 'stc_requestAccounts',
        });
        initialData.changeAccounts(newAccounts);
        console.log(window.starcoin, '???');
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <ContentBox>
      <Flex
        direction='column'
        align='center'
        w='100%'
        bgImage={`url(${Bauhaus})`}
        bgSize='contain'
        bgPosition='center'
        bgRepeat='no-repeat'
        py={12}
      >
        <Box textAlign='left'>
          <Box fontSize='2xl' fontFamily='heading' fontWeight={700}>
            Welcome to DAOhaus v2
          </Box>
          <Text fontSize='xl' mb={5}>
            Your new Hub for all Moloch DAO activity
          </Text>
          <Box fontSize='md' mb={5}>
            🔥 Interact with DAOs or Summon a new one
          </Box>
          <Box fontSize='md' mb={5}>
            🚨 Get activity feeds from all your DAOs
          </Box>
          <Box fontSize='md' mb={5}>
            🌊️️️ Easily switch between your DAOs
          </Box>
          <Flex justify='center' w='100%'>
            <Button onClick={() => initialClick()} mb={6}>
              Connect Wallet
            </Button>
          </Flex>
        </Box>
      </Flex>
    </ContentBox>
  );
};

export default HubSignedOut;
