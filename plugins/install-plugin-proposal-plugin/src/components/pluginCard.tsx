import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom'
import { Flex, Button, HStack, Stack, Tag, Text, Link, Badge, Heading, Spacer, useToast  } from '@chakra-ui/react';
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
  showDetail?: boolean;
}

const PluginCard = ({ daoId, plugin_info, installed, showDetail=true }: PluginCardProps) => {
  const { injectedProvider: provider, walletAddress } = useSubAppContext();
  const [stared, setStared] = useState(false);
  const [starCount, setStarCount] = useState(plugin_info.star_count);
  const toast = useToast();
  const history = useHistory();

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

  const renderPluginLables = () => {
    if (plugin_info?.labels) {
      return (
        <Flex as={HStack} spacing={2} align='center'>
          {plugin_info?.labels.map(label => {
            return (
              <Tag 
                key={label}
                variant='outline'
                fontSize='9px'
                colorScheme='orange'
                _notLast={{ marginRight: '3px' }}
                mt={1}
                _hover={{
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                {label}
              </Tag>
            );
          })}
        </Flex>
      );
    }
    return null;
  };

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
        {renderPluginLables()}
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
              {'create time'}
            </TextBox>
            <PropCardDate
              label=''
              dateTimeMillis={plugin_info?.created_at}
              opacity='1'
            />
          </Flex>
          <Flex flexDirection='column'>
            <TextBox size='xs' mb={2}>
              {'update time'}
            </TextBox>
            <PropCardDate
              label=''
              dateTimeMillis={plugin_info?.updated_at}
              opacity='1'
            />
          </Flex>
        </Flex>
        <Flex as={HStack} spacing={2} align='right'>
          <Spacer />
          { showDetail && (
            <Button
              as={Link}
              fontWeight='bold'
              onClick={() => {
                history.push(`/plugin/${plugin_info.type}`)
              }}
              variant='outline'
              size='sm'
              width='8rem'
              mt={['4', '4', '0']}
            >
              View Detail
            </Button>
          )}

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