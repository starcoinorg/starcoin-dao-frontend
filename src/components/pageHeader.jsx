import React from 'react';
import { Box, Flex } from '@chakra-ui/react';

import WrongNetworkToolTip from './wrongNetworkToolTip';
import { getTerm } from '../utils/metadata';
import HausBalance from './hausBalance';

const PageHeader = ({ isDao, header, headerEl, customTerms }) => {
  return (
    <Flex direction='row' justify='space-between' p={6}>
      <Flex
        direction='row'
        justify={['space-between', null, null, 'flex-start']}
        align='center'
        w={['100%', null, null, 'auto']}
      >
        {header ? (
          <Box
            fontSize={['lg', null, null, '3xl']}
            fontFamily='heading'
            fontWeight={700}
            mr={10}
          >
            {customTerms ? getTerm(customTerms, header) : header}
          </Box>
        ) : null}
        {headerEl}
      </Flex>
    </Flex>
  );
};
export default PageHeader;
