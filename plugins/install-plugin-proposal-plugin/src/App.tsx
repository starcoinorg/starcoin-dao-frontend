import React from 'react';
import Proposals from './pages/Proposals';
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
              <Proposals/>
            </OverlayProvider>
          </DaoProvider>
        </ChakraProvider>
      )
    }}
    </SubAppContext.Consumer>
  )
};

export default App;
