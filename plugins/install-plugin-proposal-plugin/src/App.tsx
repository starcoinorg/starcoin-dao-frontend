import React from 'react';
import PluginManagement from './pages/PluginManagement';
import { ChakraProvider } from '@chakra-ui/react'
import { OverlayProvider } from './contexts/OverlayContext'
import { DaoProvider } from './contexts/DaoContext'
import { SubAppContext } from './root';

const App = () => {
  return (
    <SubAppContext.Consumer>
    {(appInfo) => {
      console.log("appInfo", appInfo);

      return (
        <ChakraProvider>
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
