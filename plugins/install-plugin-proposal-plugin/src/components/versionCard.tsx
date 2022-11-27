import React, { useEffect, useState } from 'react';
import { Flex, Button, HStack, Stack, Tag, Text, Link, Badge, Heading, Spacer, useToast  } from '@chakra-ui/react';
import ContentBox from './contentBox';
import TextBox from './textBox';
import { PropCardDate } from './primitives';
import { IVersion } from '../utils/daoPluginApi';

type VersionCardProps = {
  daoId: string;
  version:IVersion;
}

const VersionCard = ({ daoId, version }: VersionCardProps) => {
  const renderDependExtpoints = () => {
    if (version?.depend_extpoints && version?.depend_extpoints.length > 0) {
      return (
        <Flex as={HStack} spacing={2} align='center'>
          {version?.depend_extpoints.map(label => {
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

  const renderImplementExtpoints = () => {
    if (version?.implement_extpoints && version?.implement_extpoints.length > 0) {
      return (
        <Flex as={HStack} spacing={2} align='center'>
          {version?.implement_extpoints.map(label => {
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
          <Heading>{ version?.tag }</Heading>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Text variant='value'>{ version?.js_entry_uri }</Text>
        </Flex>
        { renderDependExtpoints() }
        { renderImplementExtpoints()}
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
              dateTimeMillis={version?.created_at}
              opacity='1'
            />
          </Flex>
        </Flex>
      </Stack>
    </ContentBox>
  );
};

export default VersionCard;