import React from 'react';
import { Flex, Box, Button } from '@chakra-ui/react';

import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { useUser } from '../contexts/UserContext';
import FeaturedDaos from '../components/featuredDaos';
import HubProfileCard from '../components/hubProfileCard';
import HubSignedOut from '../components/hubSignedOut';
import MainViewLayout from '../components/mainViewLayout';
import NewsFeed from '../components/newsFeed';
import NetworkList from '../components/networkList';
import HausCard from '../components/hausCard';
import TitleHeader from '../assets/img/title_header_light.png';
import StarMaskOnboarding from '@starcoin/starmask-onboarding';

const Main = () => {
  const { address } = useInjectedProvider();
  const { userHubDaos } = useUser();

  const hasDaos = () => {
    return userHubDaos.some(network => network.data.length);
  };

  const ctaButton = (
    <Button as='a' href='https://3box.io/hub' target='_blank' variant='outline'>
      Edit 3Box Profile
    </Button>
  );

  const TitleEl = () => (
    <div style={{ width: '100%', height: '26px', marginTop: '20px' }}>
      <img style={{ width: '100%', height: '100%' }} src={TitleHeader} />
    </div>
  );

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
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <MainViewLayout headerEl={<TitleEl />}>
      <Flex wrap='wrap'>
        <Box
          w={['100%', null, null, null, '60%']}
          pr={[0, null, null, null, 6]}
          pb={6}
        >
          {address ? (
            <>
              <HubProfileCard address={address} key={address} />
              <NetworkList />
            </>
          ) : (
            <Box>
              <Box fontSize={109}>Welcome to</Box>
              <Box fontSize={109} color={'#7c87f7'}>
                DAOhaus V2
              </Box>
              <Box fontSize={35}>Your new Hub for all Moloch DAO activity</Box>
              <Box fontSize={27}>Interact with DAOs or Summon a new one</Box>
              <Box fontSize={27}>Get activity feeds from all your DAOs</Box>
              <Box fontSize={27}>Easily switch between your DAOs</Box>
              <Box
                onClick={() => initialClick()}
                mb={6}
                fontSize={38}
                borderWidth={1}
                borderColor={'#858EE8'}
              >
                Connect Wallet
              </Box>
            </Box>
          )}
        </Box>
        {address && (
          <Box w={['100%', null, null, null, '40%']}>
            {/* <HausCard /> */}
            {hasDaos() ? <NewsFeed /> : <FeaturedDaos />}
          </Box>
        )}
      </Flex>
    </MainViewLayout>
  );
};

export default Main;
