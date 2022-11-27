import React, {
  useContext,
  useCallback,
  createContext,
  useEffect,
  useState,
  useRef,
} from 'react';

import { useInjectedProvider } from './InjectedProviderContext';
import { useOverlay } from './OverlayContext';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { HUB_MEMBERSHIPS } from '../graphQL/member-queries';
import { createPoll } from '../services/pollService';
import { hubChainQuery } from '../utils/theGraph';
import { supportedChains } from '../utils/chain';
import { getApiMetadata } from '../utils/metadata';
import { handleGetProfile } from '../utils/3box';
import { listUserDaoTypes } from '../utils/dao';

const numOfSupportedChains = Object.keys(supportedChains).length;

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const { injectedProvider, address } = useInjectedProvider();
  const { successToast, errorToast } = useOverlay();
  const [addressProfile, setAddressProfile] = useState(null);

  const [apiData, setApiData] = useState(null);
  const [userHubDaos, setUserHubDaos] = useSessionStorage('userHubData', []);

  const [outstandingTXs, setOutstandingTXs] = useState([]);

  const hasLoadedHubData = userHubDaos?.length === numOfSupportedChains;
  const prevAddress = useRef(null);

  const [userDaos, setUserDaos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const daos = await listUserDaoTypes(injectedProvider, address);
        setUserDaos(daos);
      } catch (err) {
        console.error('Error fetching user daos', err);
      }
    };

    if (address && injectedProvider) {
      fetchData();
    } else {
      setUserDaos([]);
    }
  }, [injectedProvider, address]);

  const resolvePoll = txHash => {
    if (!address) {
      console.error("User address wasn't found. Cannot cache Poll.");
      return;
    }
    const oldCache = JSON.parse(localStorage.getItem('TXs')) || {};
    const userSpecificCache = oldCache[address] ? oldCache[address] : [];
    const newUserCache = userSpecificCache.map(tx =>
      tx.txHash === txHash ? { ...tx, status: 'resolved' } : tx,
    );
    const newCache = {
      ...oldCache,
      [address]: newUserCache,
    };
    localStorage.setItem('TXs', JSON.stringify(newCache));
    setOutstandingTXs(newUserCache);
  };

  const refreshMemberProfile = useCallback(async () => {
    try {
      if (!address) return;
      const profile = await handleGetProfile(address);
      if (!profile) return;
      setAddressProfile(profile);
      return profile;
    } catch (error) {
      setAddressProfile(null);
    }
  }, [address]);

  useEffect(async () => {
    if (address) {
      await refreshMemberProfile();
    }
  }, [address, refreshMemberProfile]);

  useEffect(() => {
    if (!address) return;
    const cachedTXs = JSON.parse(localStorage.getItem('TXs')) || {};
    const userTXs = cachedTXs[address];
    if (userTXs?.length) {
      userTXs.forEach(tx => {
        if (tx.status === 'unresolved') {
          createPoll(tx.pollData)({
            ...tx.pollArgs,
            actions: {
              onSuccess: () => {
                resolvePoll(tx.txHash);
                successToast({ title: 'Success!', description: tx.successMsg });
              },
              onError: () => {
                resolvePoll(tx.txHash);
                errorToast({ title: 'Error!', description: tx.errorMsg });
              },
            },
          })(tx.txHash);
        }
      });
      setOutstandingTXs(userTXs);
    }
  }, [address]);

  const cachePoll = pollData => {
    if (!address) {
      console.error("User address wasn't found. Cannot cache Poll.");
      return;
    }
    const oldCache = JSON.parse(localStorage.getItem('TXs')) || {};
    const userSpecificCache = oldCache[address] ? oldCache[address] : [];
    const newUserCache = [pollData, ...userSpecificCache];
    const newCache = {
      ...oldCache,
      [address]: newUserCache,
    };
    localStorage.setItem('TXs', JSON.stringify(newCache));
    setOutstandingTXs(newUserCache);
  };

  const refetchUserHubDaos = () => {
    prevAddress.current = null;
    setUserHubDaos([]);
  };

  return (
    <UserContext.Provider
      value={{
        userHubDaos,
        hasLoadedHubData,
        cachePoll,
        resolvePoll,
        outstandingTXs,
        refetchUserHubDaos,
        apiData,
        refreshMemberProfile,
        addressProfile,
        userDaos,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
export const useUser = () => {
  const {
    userHubDaos,
    hasLoadedHubData,
    cachePoll,
    apiData,
    resolvePoll,
    outstandingTXs,
    refetchUserHubDaos,
    refreshMemberProfile,
    addressProfile,
    userDaos,
  } = useContext(UserContext);
  return {
    userHubDaos,
    hasLoadedHubData,
    apiData,
    cachePoll,
    resolvePoll,
    outstandingTXs,
    refetchUserHubDaos,
    refreshMemberProfile,
    addressProfile,
    userDaos,
  };
};
