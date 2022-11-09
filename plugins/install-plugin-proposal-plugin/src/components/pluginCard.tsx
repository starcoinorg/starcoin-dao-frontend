import React, { useEffect, useState } from 'react';
import { AiOutlineStar } from "react-icons/ai";
import { Box, Flex, Button, HStack, Stack, Tag, Text, Heading, Spacer, useToast  } from '@chakra-ui/react';

import { installPluginProposal, IPlugin } from '../utils/daoPluginApi';

const PluginCard = ({ daoId, plugin_info, installed }) => {
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const toast = useToast();

  useEffect(() => {
    const getAddress = async () => {
      const newAccounts = await window.starcoin.request({
        method: 'stc_requestAccounts',
      });
      setAddress(newAccounts[0]);
    };

    getAddress();
  }, [daoId]);

  const onUninstallPlugin = async () => {

  }

  const onInstallPlugin = async () => {
    try {
      const transactionHash = await installPluginProposal(daoId, plugin_info.type, 
        `Apply install plugin ${plugin_info.name}`,
        0);

      toast({
        title: 'Tips',
        description: `Create install plugin proposal success, transactionHash: ${transactionHash}`,
        status: 'success',
        duration: 9000,
        position: 'top-right',
        isClosable: true,
      })
    } catch (err) {
      console.log(err);

      toast({
        title: 'Tips',
        description: `Create install plugin proposal failed, error: ${err.message}`,
        status: 'error',
        duration: 9000,
        position: 'top-right',
        isClosable: true,
      })
    }
  }

  return (
    <Box w='40%' p='6' borderWidth='1px' borderColor='whiteAlpha.200' rounded='lg' color='mode.900'>
      <Stack spacing={4}>
        <Flex as={HStack} spacing={2} align='center'>
          <Heading>{ plugin_info?.name }</Heading>
          <Spacer />
          <Button leftIcon={<AiOutlineStar />} size='xs' colorScheme='orange' variant='solid'>
            Star 25
          </Button>
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
              <Button colorScheme='teal' size='md' onClick={onUninstallPlugin}>
                Uninstall
              </Button>
            ) : (
              <Button colorScheme='teal' size='md' onClick={onInstallPlugin}>
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