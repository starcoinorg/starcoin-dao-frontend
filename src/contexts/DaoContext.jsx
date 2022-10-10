import React, { useEffect, useContext, createContext, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { DaoMemberProvider } from './DaoMemberContext';
import { MetaDataProvider } from './MetaDataContext';
import { DaoPluginProvider } from './DaoPluginContext';
import { TokenProvider } from './TokenContext';
import { TXProvider } from './TXContext';
import { useInjectedProvider } from './InjectedProviderContext';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { listDaoProposals } from '../utils/proposalApi';
import { supportedChains } from '../utils/chain';
import { putRefreshApiVault } from '../utils/metadata';

export const DaoContext = createContext();

export const DaoProvider = ({ children }) => {
  const { daoid, daochain } = useParams();
  const { injectedChain, address } = useInjectedProvider();

  const daoNetworkData = supportedChains[daochain];
  const isCorrectNetwork = daochain === injectedChain?.chainId;

  const [daoProposals, setDaoProposals] = useSessionStorage(
    `proposals-${daoid}`,
    null,
  );
  const [daoActivities, setDaoActivities] = useSessionStorage(
    `activities-${daoid}`,
    null,
  );
  const [daoOverview, setDaoOverview] = useSessionStorage(
    `overview-${daoid}`,
    null,
  );
  const [daoMembers, setDaoMembers] = useSessionStorage(
    `members-${daoid}`,
    null,
  );

  const [daoVaults, setDaoVaults] = useSessionStorage(`vaults-${daoid}`, null);

  const hasPerformedBatchQuery = useRef(false);
  const currentDao = useRef(null);

  useEffect(() => {
    // This condition is brittle. If one request passes, but the rest fail
    // this stops the app from fetching. We'll need something better later on.
    if (daoProposals || daoActivities || daoOverview || daoMembers) {
      return;
    }

    if (!daoid || !daochain || hasPerformedBatchQuery.current) {
      return;
    }

    listDaoProposals(daoid)
      .then(proposals => {
        setDaoProposals(proposals);
      })
      .catch(err => {
        console.error('Error fetching proposals', err);
      });

    hasPerformedBatchQuery.current = true;
  }, [
    daoid,
    daochain,
    daoNetworkData,
    daoActivities,
    daoMembers,
    daoOverview,
    daoProposals,
    daoVaults,
    setDaoActivities,
    setDaoMembers,
    setDaoOverview,
    setDaoProposals,
    setDaoVaults,
    isCorrectNetwork,
  ]);

  const refetch = async () => {
    currentDao.current = null;

    listDaoProposals(daoid)
      .then(proposals => {
        setDaoProposals(proposals);
      })
      .catch(err => {
        console.error('Error fetching proposals', err);
      });
  };

  const refreshAllDaoVaults = async () => {
    const { network } = supportedChains[daochain];
    await putRefreshApiVault({ network, molochAddress: daoid });
  };

  return (
    <DaoContext.Provider
      value={{
        daoProposals,
        daoActivities,
        daoMembers,
        daoOverview,
        daoVaults,
        isCorrectNetwork,
        refetch,
        refreshAllDaoVaults,
        hasPerformedBatchQuery, // Ref, not state
      }}
    >
      <MetaDataProvider>
        <DaoPluginProvider>
          <TokenProvider>
            <DaoMemberProvider
              daoMembers={daoMembers}
              address={address}
              overview={daoOverview}
            >
              <TXProvider>{children}</TXProvider>
            </DaoMemberProvider>
          </TokenProvider>
        </DaoPluginProvider>
      </MetaDataProvider>
    </DaoContext.Provider>
  );
};
export const useDao = () => {
  const {
    daoProposals,
    daoActivities,
    daoMembers,
    daoOverview,
    daoVaults,
    isCorrectNetwork,
    refetch,
    refreshAllDaoVaults,
    hasPerformedBatchQuery, // Ref, not state
  } = useContext(DaoContext);
  return {
    daoProposals,
    daoActivities,
    daoMembers,
    daoOverview,
    daoVaults,
    isCorrectNetwork,
    refetch,
    refreshAllDaoVaults,
    hasPerformedBatchQuery,
  };
};
