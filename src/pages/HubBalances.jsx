import React, { useEffect, useState } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import CrossDaoInternalBalanceList from '../components/crossDaoInternalBalanceList';
import HubProfileCard from '../components/hubProfileCard';
import HubSignedOut from '../components/hubSignedOut';
import Layout from '../components/layout';
import MainViewLayout from '../components/mainViewLayout';
import { balanceChainQuery } from '../utils/theGraph';
import { supportedChains } from '../utils/chain';

const HubBalances = () => {
  const { address } = useInjectedProvider();
  const [balances, setBalances] = useState([]);
  const [balancesGraphData, setBalanceGraphData] = useState({
    chains: [],
    data: [],
  });
  const hasLoadedBalanceData =
    balancesGraphData.chains.length === Object.keys(supportedChains).length;

  useEffect(() => {
    if (address) {
      balanceChainQuery({
        reactSetter: setBalanceGraphData,
        address,
      });
    }
  }, [address]);

  useEffect(() => {
    if (hasLoadedBalanceData) {
      const tokenBalances = balancesGraphData.data
        .flatMap(bal => {
          return bal.tokenBalances.map(b => {
            return { ...b, moloch: bal.moloch, meta: bal.meta };
          });
        })
        .filter(bal => +bal.tokenBalance > 0);

      setBalances(tokenBalances);
    }
  }, [hasLoadedBalanceData]);

  return (
    <Layout>
      <MainViewLayout header='Balances'>
        {address ? (
          <>
            <HubProfileCard address={address} key={address} />
            <Box
              my={5}
              maxW='800px'
              style={{
                widtH: '800px',
                backgroundColor: '#0b0b0b',
                borderRadius: '5px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '24px',
              }}
            >
              Internal DAO balances are the result of proposal deposits,
              processing rewards, rage quits and cancelled tribute proposals.
              These can be withdrawn into your wallet from the profile page in
              the DAO.
            </Box>
            {/* <CrossDaoInternalBalanceList tokens={balances} /> */}
          </>
        ) : (
          <HubSignedOut />
        )}
      </MainViewLayout>
    </Layout>
  );
};

export default HubBalances;
