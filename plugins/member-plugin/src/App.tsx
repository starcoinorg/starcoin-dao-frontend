import React from 'react';
import Members from './pages/Members';
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
              <Members/>
            </OverlayProvider>
          </DaoProvider>
        </ChakraProvider>
      )
    }}
    </SubAppContext.Consumer>
  )
};

export default App;
