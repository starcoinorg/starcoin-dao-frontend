import React, { createContext } from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  MemoryRouter,
  Redirect,
} from 'react-router-dom';
import { Dict } from "@chakra-ui/utils";
import { providers } from "@starcoin/starcoin"
import App from './App';
import './App.less';
import { SubAppProvider } from './contexts/SubAppContext';

export const prefixCls = 'sub-app-react16';

export type AppInfo = {
  appName: string;
  dom: Element | ShadowRoot | Document;
  basename: string;
  appRenderInfo: Record<string, any>;
  props: Record<string, any>;
  theme?: Dict;
  dao: Record<string, any>;
  getInjectedProvider(): providers.JsonRpcProvider;
  getWalletAddress(): string;
};

const RootComponent = (appInfo: AppInfo) => {
  
  return (
    <SubAppProvider value={{
      initDao: appInfo.dao,
      initTheme: appInfo.theme,
      getInjectedProvider: appInfo.getInjectedProvider,
      getWalletAddress: appInfo.getWalletAddress,
     }}>
        {location.pathname.includes('loadApp') ? (
          <MemoryRouter> <App/> </MemoryRouter>
        ) : (
          <BrowserRouter basename={appInfo.basename}><App/></BrowserRouter>
        )}
    </SubAppProvider>
  );
};

export default RootComponent;
