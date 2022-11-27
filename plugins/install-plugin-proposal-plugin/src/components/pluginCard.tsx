import React, { useEffect, useState } from 'react';
import { Flex, Button, HStack, Stack, Tag, Text, Link, Heading, Spacer, useToast  } from '@chakra-ui/react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import ContentBox from './contentBox';
import TextBox from './textBox';
import { PropCardDate } from './primitives';
import { useSubAppContext } from '../contexts/SubAppContext';
import { installPluginProposal, starPlugin, unstarPlugin, hasStarPlugin, IPlugin } from '../utils/daoPluginApi';

type PluginCardProps = {
  daoId: string;
  plugin_info:IPlugin;
  installed: boolean;
}

const PluginCard = ({ daoId, plugin_info, installed }: PluginCardProps) => {
  const { injectedProvider: provider, walletAddress } = useSubAppContext();
  const [stared, setStared] = useState(false);
  const [starCount, setStarCount] = useState(plugin_info.star_count);
  const toast = useToast();

  useEffect(() => {
    const loadStarPlugin = async () => {
      const stared = await hasStarPlugin(provider, walletAddress, plugin_info.type);
      setStared(stared);
    };

    if (walletAddress && walletAddress!="") {
      loadStarPlugin();
    }
  }, [daoId, plugin_info, walletAddress]);

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
        provider,
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
      if (stared) {
        await unstarPlugin(provider, plugin_info.type);
        setStarCount(starCount - 1)
      } else {
        await starPlugin(provider, plugin_info.type);
        setStarCount(starCount + 1)
      }

      setStared(!stared);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <ContentBox >
      <Stack spacing={4}>
        <Flex as={HStack} spacing={2} align='center'>
          <Heading>{ plugin_info?.name }</Heading>
          <Spacer />
          { stared ? (
              <Button leftIcon={<AiFillStar />} size='xs' colorScheme='orange' variant='solid' onClick={onSwitchStar}>Stared {starCount}</Button>
            ) : (
              <Button leftIcon={<AiOutlineStar />} size='xs' colorScheme='orange' variant='solid' onClick={onSwitchStar}>Star {starCount}</Button>
            ) 
          }
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Text variant='value'>{ plugin_info?.description }</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Tag size='sm' key='sm' variant='solid' colorScheme='teal'>
            Inner
          </Tag>
        </Flex>
        <Flex
          display='flex'
          align={['none', 'center']}
          direction={['column', 'row']}
          justify={['none', 'space-between']}
          mb='3'
          mt={6}
        >
          <Flex flexDirection='column'>
            <TextBox size='xs' mb={2}>
              {'voting start'}
            </TextBox>
            <PropCardDate
              label=''
              dateTimeMillis={plugin_info?.startTime}
              opacity='1'
            />
          </Flex>
          <Flex flexDirection='column'>
            <TextBox size='xs' mb={2}>
              {'voting end'}
            </TextBox>
            <PropCardDate
              label=''
              dateTimeMillis={plugin_info?.votingPeriodEnd}
              opacity='1'
            />
          </Flex>
        </Flex>
        <Flex as={HStack} spacing={2} align='right'>
          <Spacer />
          <Button
            as={Link}
            fontWeight='bold'
            to={`/plugin/${plugin_info.id}/detail`}
            variant='outline'
            size='sm'
            width='8rem'
            mt={['4', '4', '0']}
          >
            View Detail
          </Button>

          {
            installed ? (
              <Button size='sm' minW='4rem' onClick={onUninstallPlugin}>
                Uninstall
              </Button>
            ) : (
              <Button size='sm' minW='4rem' onClick={onInstallPlugin}>
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