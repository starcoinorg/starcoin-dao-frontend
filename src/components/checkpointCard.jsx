import React, { useEffect, useState } from 'react';
import { Flex, Button, HStack, Stack, Link } from '@chakra-ui/react';

import ContentBox from './ContentBox';
import TextBox from './TextBox';

const CheckpointCard = ({ checkpoint, onClickUpdateRootState }) => {
  return (
    <ContentBox as={Link} w='60%' isExternal>
      <Stack spacing={4}>
        <TextBox size='lg' color='whiteAlpha.900' maxW='80%'>
          {checkpoint.block_number}
        </TextBox>
        <Flex as={HStack} spacing={2} align='center'>
          <TextBox>Block hash:</TextBox>
          <TextBox variant='value'>{checkpoint.block_hash}</TextBox>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <TextBox>State Root:</TextBox>

          {checkpoint.state_root ? (
            <TextBox variant='value'>{checkpoint.state_root}</TextBox>
          ) : (
            <Button
              size='sm'
              colorScheme='blue'
              onClick={onClickUpdateRootState}
            >
              UpdateStateRoot
            </Button>
          )}
        </Flex>
      </Stack>
    </ContentBox>
  );
};

export default CheckpointCard;
