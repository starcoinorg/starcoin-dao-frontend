import React, { useEffect, useState } from 'react';
import { Flex, Button, HStack, Stack, Tag, Text, Heading, Spacer, useToast  } from '@chakra-ui/react';
import ContentBox from './contentBox';
import { useSubAppContext } from '../contexts/SubAppContext';
import { installPluginProposal, unInstallPluginProposal, starPlugin, unstarPlugin, hasStarPlugin, IPlugin } from '../utils/daoPluginApi';

type PluginCardProps = {
  daoId: string;
  plugin_info:IPlugin;
  installed: boolean;
}

const PluginCard = ({ daoId, plugin_info, installed }: PluginCardProps) => {
  const { injectedProvider } = useSubAppContext();
  const [star, setStar] = useState(false);
  const [starCount, setStarCount] = useState(plugin_info.star);
  const toast = useToast();

  useEffect(() => {
    const loadStarPlugin = async () => {
      //const stared = await hasStarPlugin(plugin_info.type);
      //setStar(stared);
      setStar(true);
    };

    loadStarPlugin();
  }, [daoId, plugin_info]);

  const onUninstallPlugin = async () => {
    toast({
      title: 'Tips',
      description: `Under development, stay tuned`,
      status: 'error',
      duration: 9000,
      position: 'top-right',
      isClosable: true,
    })
  }

  const onInstallPlugin = async () => {
    try {
      const transactionHash = await installPluginProposal(
        injectedProvider,
        daoId, 
        plugin_info.type, 
        `Apply install plugin ${plugin_info.name}`,
        `Apply install plugin ${plugin_info.name}`,
        `Apply install plugin ${plugin_info.name}`,
        0
      );

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

  const onSwitchStar = async () => {
    try {
      if (star) {
        await unstarPlugin(plugin_info.type);
        setStarCount(starCount - 1)
      } else {
        await starPlugin(plugin_info.type);
        setStarCount(starCount + 1)
      }

      setStar(!star);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <ContentBox >
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
    </ContentBox>
  );
};

export default PluginCard;