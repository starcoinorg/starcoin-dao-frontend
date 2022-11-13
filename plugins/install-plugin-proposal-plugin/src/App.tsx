import React from 'react';
import PluginManagement from './pages/PluginManagement';
import { ChakraProvider } from '@chakra-ui/react';
import { OverlayProvider } from './contexts/OverlayContext';
import { useSubAppContext } from './contexts/SubAppContext';

const App = () => {
  const { theme } = useSubAppContext();

  return (
    <ChakraProvider theme={theme}>
      <OverlayProvider>
        <PluginManagement/>
      </OverlayProvider>
    </ChakraProvider>
  )
};

export default App;
