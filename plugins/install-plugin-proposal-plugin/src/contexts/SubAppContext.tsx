import React, { createContext, useState, useEffect, useContext } from 'react';
import { providers } from "@starcoin/starcoin"
import { Dict } from "@chakra-ui/utils";

export interface IDaoInfo {
  name: string,
  address: string,
  daoType: string,
}

export type AppContext = {
  dao: IDaoInfo;
  theme?: Dict;
  injectedProvider: providers.JsonRpcProvider;
  walletAddress: string;
};

export const SubAppContext = createContext<AppContext>({} as AppContext);

export type SubAppProviderValue = {
  initDao: Record<string, any>;
  initTheme?: Dict;
  getInjectedProvider(): providers.JsonRpcProvider;
  getWalletAddress(): string;
};

export type SubAppProviderProps = {
  children: React.ReactNode;
  value: SubAppProviderValue;
};

export const SubAppProvider = ({ children, value: { initDao, initTheme, getInjectedProvider, getWalletAddress} }:SubAppProviderProps) => {
  const [dao, _] = useState<IDaoInfo>({
    name: initDao.name,
    address: initDao.address,
    daoType: initDao.daoType,
  });

  const [injectedProvider, ___] = useState<providers.JsonRpcProvider>(getInjectedProvider());
  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    const loadWalletAddress = async () => {
      try {
        const address = await getWalletAddress();
        setWalletAddress(address);
      } catch (err) {
        console.log(err);
      }
    };

    loadWalletAddress();
  }, [injectedProvider]);

  return (
    <SubAppContext.Provider
      value={{
        dao,
        theme: initTheme,
        injectedProvider,
        walletAddress,
      }}
    >
      {children}
    </SubAppContext.Provider>
  );
};

export default SubAppProvider;

export const useSubAppContext = ():AppContext => {
  return useContext(SubAppContext);
};
