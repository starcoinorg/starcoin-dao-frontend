import React from 'react';
import Members from './pages/Members';
import { ChakraProvider } from '@chakra-ui/react'

const App = () => {
  return (
    <ChakraProvider>
      <Members/>
    </ChakraProvider>
  )
};

export default App;
