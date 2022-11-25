import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { useSubAppContext } from './contexts/SubAppContext';
import Router from './router/routes';

const App = () => {
  const { theme } = useSubAppContext();

  return (  
    <ChakraProvider theme={theme}>
        <Router/>
    </ChakraProvider>
  )
};

export default App;
