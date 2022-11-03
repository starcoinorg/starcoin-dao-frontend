import React, { useEffect, useState } from 'react';
import { Box, Flex, Button, HStack, Stack, Link, Text } from '@chakra-ui/react';

const MyMemberInviteCard = ({ offer, onAcceptOffer }) => {
  return (
    <Box as={Link} w='60%' p='6' borderWidth='1px' borderColor='whiteAlpha.200' rounded='lg' color='mode.900' isExternal>
      <Stack spacing={4}>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>For:</Text>
          <Text variant='value'>{offer.for_user}</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>To Address:</Text>
          <Text variant='value'>{offer.to_address}</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>Init SBT:</Text>
          <Text variant='value'>{offer.init_sbt}</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>Time Lock:</Text>
          <Text variant='value'>{offer.time_lock}</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Button
            size='sm'
            colorScheme='blue'
            onClick={onAcceptOffer}
          >
            Accept
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};

export default MyMemberInviteCard;