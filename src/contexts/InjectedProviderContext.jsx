import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
} from 'react';
import Web3 from 'web3';
import { SafeAppWeb3Modal } from '@gnosis.pm/safe-apps-web3modal';
import StarMaskOnboarding from '@starcoin/starmask-onboarding';
import { providers } from '@starcoin/starcoin';
import { OverlayContext } from './OverlayContext';
import {
  deriveChainId,
  deriveSelectedAddress,
  getProviderOptions,
} from '../utils/web3Modal';
import { supportedChains } from '../utils/chain';
import { useLocalStorage } from '../hooks/useLocalStorage';

const defaultModal = new SafeAppWeb3Modal({
  providerOptions: getProviderOptions(),
  cacheProvider: true,
  theme: 'dark',
});

export const InjectedProviderContext = createContext();

export const InjectedProvider = ({ children }) => {
  const [injectedProvider, setInjectedProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [injectedChain, setInjectedChain] = useState(null);
  const [web3Modal, setWeb3Modal] = useState(defaultModal);
  const { errorToast } = useContext(OverlayContext);
  const [network, setNetwork] = useLocalStorage('dao_fe_network', 'main');

  const hasListeners = useRef(null);

  const connectProvider = async () => {
    const providerOptions = getProviderOptions();
    if (!providerOptions) {
      setInjectedProvider(null);
      setAddress(null);
      setWeb3Modal(defaultModal);
      window.localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
      errorToast({ title: 'Could not connect to unsupported network' });
      return;
    }

    const web3Modal = new SafeAppWeb3Modal({
      providerOptions,
      cacheProvider: true,
      theme: 'dark',
    });

    const provider = await web3Modal.requestProvider();
    provider.selectedAddress = deriveSelectedAddress(provider);
    const chainId = deriveChainId(provider);

    const chain = {
      ...supportedChains[chainId],
      chainId,
    };
    const web3 = new Web3(provider);
    if (web3?.currentProvider?.selectedAddress) {
      setInjectedProvider(web3);
      setAddress(web3.currentProvider.selectedAddress.toLowerCase());
      setInjectedChain(chain);
      setWeb3Modal(web3Modal);
    }
  };

  const initialStarCoin = () => {
    const currentUrl = new URL(window.location.href);
    const forwarderOrigin =
      currentUrl.hostname === 'localhost' ? 'http://localhost:9032' : undefined;

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
      name: '',
      chainId: 0,
    };

    return {
      isStarMaskInstalled,
      isStarMaskConnected,
      accounts,
      onboarding,
      chainInfo,
    };
  };

  useEffect(() => {
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

    const initial = async () => {
      const _status = status();
      if (_status === 0) {
        initialData.onboarding.startOnboarding();
      } else if (_status === 1) {
        try {
          const newAccounts = await window.starcoin.request({
            method: 'stc_requestAccounts',
          });
          const chain = await window.starcoin.request({
            method: 'chain.id',
          });

          let chainInfo = {
            chainId: chain.id,
            name: chain.name,
          };

          const provider = new providers.Web3Provider(
            window.starcoin,
            chainInfo,
          );

          setAddress(newAccounts[0]);
          setInjectedChain(chainInfo);
          setNetwork(chainInfo.name);
          setInjectedProvider(provider);
        } catch (error) {
          console.error(error);
        }
      }
    };

    initial();
  }, []);

  // This useEffect handles the initialization of EIP-1193 listeners
  // https://eips.ethereum.org/EIPS/eip-1193

  useEffect(() => {
    const onStarcoinEvent = () => {
      const initialData = initialStarCoin();
      if (initialData.isStarMaskInstalled) {
        const handleNewChain = chain => {
          const provider = new providers.Web3Provider(window.starcoin, chain);

          setInjectedChain(chain);
          setNetwork(chain.name);
          setInjectedProvider(provider);
        };
        const handleNewAccounts = accounts => {
          setAddress(accounts[0]);
        };
        // 钱包网络切换
        window.starcoin.on('chainChanged', handleNewChain);
        // 钱包帐号切换
        window.starcoin.on('accountsChanged', handleNewAccounts);
      }
    };
    onStarcoinEvent();
  }, []);

  const requestWallet = async () => {
    connectProvider();
  };

  const disconnectDapp = async () => {
    setInjectedProvider(null);
    setAddress(null);
    setWeb3Modal(defaultModal);
    web3Modal.clearCachedProvider();
    if (localStorage.getItem('walletconnect')) {
      // cleanup cache if it was using WalletConnect
      localStorage.removeItem('walletconnect');
      window.localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
    }
  };

  return (
    <InjectedProviderContext.Provider
      value={{
        injectedProvider,
        requestWallet,
        disconnectDapp,
        injectedChain,
        network,
        address,
        web3Modal,
      }}
    >
      {children}
    </InjectedProviderContext.Provider>
  );
};
export const useInjectedProvider = () => {
  const {
    injectedProvider,
    requestWallet,
    disconnectDapp,
    injectedChain,
    network,
    address,
    web3Modal,
  } = useContext(InjectedProviderContext);
  return {
    injectedProvider,
    requestWallet,
    disconnectDapp,
    injectedChain,
    network,
    web3Modal,
    address,
  };
};
