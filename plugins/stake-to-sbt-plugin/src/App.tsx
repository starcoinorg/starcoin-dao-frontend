import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { OverlayProvider } from './contexts/OverlayContext';
import { useSubAppContext } from './contexts/SubAppContext';
import Router from './router/routes';
const App = () => {
  const { theme } = useSubAppContext();

  return (
    <ChakraProvider theme={theme}>
      <OverlayProvider>
        <Router/>
      </OverlayProvider>
    </ChakraProvider>
  )
};

export default App;
