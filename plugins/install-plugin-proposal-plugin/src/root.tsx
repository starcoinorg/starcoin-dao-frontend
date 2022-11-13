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
  const routes = (
    <Switch>
      <Route exact path="/" component={() => <Redirect to="/home" />} />
      <Route exact path="/home" component={() => <App />} />
      <Route exact path="/about" component={() => <App />} />
      <Route exact path="/vm-sandbox" component={() => <App />} />
    </Switch>
  );
  return (
    <SubAppProvider value={{
      initDao: appInfo.dao,
      initTheme: appInfo.theme,
      getInjectedProvider: appInfo.getInjectedProvider,
      getWalletAddress: appInfo.getWalletAddress,
     }}>
        {location.pathname.includes('loadApp') ? (
          <MemoryRouter> {routes} </MemoryRouter>
        ) : (
          <BrowserRouter basename={appInfo.basename}>{routes}</BrowserRouter>
        )}
    </SubAppProvider>
  );
};

export default RootComponent;
