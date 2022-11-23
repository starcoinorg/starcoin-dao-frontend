import React, { useEffect, useContext, createContext, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { DaoMemberProvider } from './DaoMemberContext';
import { MetaDataProvider } from './MetaDataContext';
import { DaoPluginProvider } from './DaoPluginContext';
import { DaoActionProvider } from './DaoActionContext';
import { TokenProvider } from './TokenContext';
import { TXProvider } from './TXContext';
import { useInjectedProvider } from './InjectedProviderContext';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { supportedChains } from '../utils/chain';
import { putRefreshApiVault } from '../utils/metadata';

export const DaoContext = createContext();

export const DaoProvider = ({ children }) => {
  const { daoid, daochain } = useParams();
  const { injectedProvider, injectedChain, address } = useInjectedProvider();

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

  const refetch = async () => {
    currentDao.current = null;
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
        <DaoActionProvider>
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
        </DaoActionProvider>
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
