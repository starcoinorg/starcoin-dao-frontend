import React, { useEffect } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import ContentBox from './ContentBox';

import Bauhaus from '../assets/img/bauhaus__raw.png';
import StarMaskOnboarding from '@starcoin/starmask-onboarding';

import { arrayify } from '@ethersproject/bytes';
import { utils } from '@starcoin/starcoin';

const HubSignedOut = () => {
  const { requestWallet } = useInjectedProvider();
  const {
    encodeSignedMessage,
    recoverSignedMessageAddress,
  } = utils.signedMessage;

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
      } catch (error) {
        console.error(error);
      }
    }
  };

  const testClick = async () => {
    const chainId = 254;
    const exampleMessage = JSON.stringify({
      daoId: 'test_dao_id',
      proposalNumber: '1',
      accountAddress: '0x01',
      votingPower: 1111111,
      choiceSequenceId: 1,
    });
    const publicKey =
      '0x32ed52d319694aebc5b52e00836e2f7c7d2c7c7791270ede450d21dbc90cbfa1';
    const privateKey =
      '0x587737ebefb4961d377a3ab2f9ceb37b1fa96eb862dfaf954a4a1a99535dfec0';
    const address = '0xd7f20befd34b9f1ab8aeae98b82a5a51';
    const privateKeyBytes = arrayify(privateKey);
    const signedMessageHex = await utils.signedMessage.encodeSignedMessage(
      exampleMessage,
      privateKeyBytes,
      chainId,
    );

    console.log({
      chainId,
      exampleMessage,
      privateKey,
      publicKey,
      address,
      signedMessageHex,
    });
  };

  return (
    <ContentBox>
      <Flex
        direction='column'
        align='center'
        w='100%'
        bgSize='contain'
        bgPosition='center'
        bgRepeat='no-repeat'
        py={12}
      >
        <Box textAlign='left'>
          <Box fontSize='2xl' fontFamily='heading' fontWeight={700}>
            Welcome to Genesis DAO
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
