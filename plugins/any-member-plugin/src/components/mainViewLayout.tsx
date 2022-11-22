import React from 'react';
import { Box } from '@chakra-ui/react';

import PageHeader from './pageHeader';

const MainViewLayout = ({ children, header}) => {
  return (
    <>
      <PageHeader
        header={header}
      />
      <Box p={6}>{children}</Box>
    </>
  );
};


export default MainViewLayout;