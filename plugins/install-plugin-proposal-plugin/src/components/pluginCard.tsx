import React, { useEffect, useState } from 'react';
import { Box, Flex, Button, HStack, Stack, Tag, Text, Heading, Spacer  } from '@chakra-ui/react';
 
const PluginCard = ({ daoId, plugin_info, installed }) => {
  const [NFT, setNFT] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');

  useEffect(() => {
    const getAddress = async () => {
      const newAccounts = await window.starcoin.request({
        method: 'stc_requestAccounts',
      });
      setAddress(newAccounts[0]);
    };

    getAddress();
  }, [daoId]);

  return (
    <Box w='40%' p='6' borderWidth='1px' borderColor='whiteAlpha.200' rounded='lg' color='mode.900'>
      <Stack spacing={4}>
        <Flex as={HStack} spacing={2} align='center'>
          <Heading>{ plugin_info?.name }</Heading>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Text variant='value'>{ plugin_info?.description }</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Tag size='sm' key='sm' variant='solid' colorScheme='teal'>
            Inner
          </Tag>
        </Flex>
        <Flex as={HStack} spacing={2} align='right'>
          <Spacer />
          {
            installed ? (
              <Button colorScheme='teal' size='md'>
                Uninstall
              </Button>
            ) : (
              <Button colorScheme='teal' size='md'>
                Install
              </Button>
            )
          }
        </Flex>
      </Stack>
    </Box>
  );
};

export default PluginCard;