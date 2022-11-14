import React from 'react';
import Members from './pages/Members';
import { ChakraProvider } from '@chakra-ui/react';
import { OverlayProvider } from './contexts/OverlayContext';
import { useSubAppContext } from './contexts/SubAppContext';

const App = () => {
  const { theme } = useSubAppContext();

  return (
    <ChakraProvider theme={theme}>
      <OverlayProvider>
        <Members/>
      </OverlayProvider>
    </ChakraProvider>
  )
};

export default App;