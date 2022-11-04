import React, { useEffect, useState } from 'react';
import { Box, Flex, Button, HStack, Stack, Link, Text } from '@chakra-ui/react';
 
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
    <Box as={Link} w='60%' p='6' borderWidth='1px' borderColor='whiteAlpha.200' rounded='lg' color='mode.900'>
      <Stack spacing={4}>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>插件名称:</Text>
          <Text variant='value'>{ plugin_info?.name }</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>插件描述:</Text>
          <Text variant='value'>{ plugin_info?.description }</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>操作</Text>
          <Text variant='value'>安装</Text>
        </Flex>
      </Stack>
    </Box>
  );
};

export default PluginCard;