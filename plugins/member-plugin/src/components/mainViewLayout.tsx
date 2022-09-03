import React from 'react';
import { Box } from '@chakra-ui/react';

const MainViewLayout = ({ children }) => {
  return (
    <>
      <Box p={6}>{children}</Box>
    </>
  );
};

export default MainViewLayout;