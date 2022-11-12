import React from 'react';
import PluginManagement from './pages/PluginManagement';
import { ChakraProvider } from '@chakra-ui/react'
import { OverlayProvider } from './contexts/OverlayContext'
import { DaoProvider } from './contexts/DaoContext'
import { SubAppContext, AppInfo } from './root';

const App = () => {
  return (
    <SubAppContext.Consumer>
    {(appInfo: AppInfo) => {
      console.log("appInfo", appInfo);

      return (
        <ChakraProvider theme={appInfo.theme}>
          <DaoProvider initDao={appInfo.dao}>
            <OverlayProvider>
              <PluginManagement/>
            </OverlayProvider>
          </DaoProvider>
        </ChakraProvider>
      )
    }}
    </SubAppContext.Consumer>
  )
};

export default App;
