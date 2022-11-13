import React, { createContext } from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  MemoryRouter,
  Redirect,
} from 'react-router-dom';
import { Dict } from "@chakra-ui/utils";
import App from './App';
import './App.less';

export const prefixCls = 'sub-app-react16';
export type AppInfo = {
  appName: string;
  dom: Element | ShadowRoot | Document;
  basename: string;
  appRenderInfo: Record<string, any>;
  props: Record<string, any>;
  theme?: Dict;
  dao: Record<string, any>;
};
export const SubAppContext = createContext<AppInfo>({} as AppInfo);

const RootComponent = (appInfo) => {
  const routes = (
    <Switch>
      <Route exact path="/" component={() => <Redirect to="/home" />} />
      <Route exact path="/home" component={() => <App />} />
      <Route exact path="/about" component={() => <App />} />
      <Route exact path="/vm-sandbox" component={() => <App />} />
    </Switch>
  );
  return (
    <SubAppContext.Provider value={{ ...appInfo }}>
        {location.pathname.includes('loadApp') ? (
          <MemoryRouter> {routes} </MemoryRouter>
        ) : (
          <BrowserRouter basename={appInfo.basename}>{routes}</BrowserRouter>
        )}
    </SubAppContext.Provider>
  );
};

export default RootComponent;
