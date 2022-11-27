import React, { useEffect, useState } from 'react';
import { Flex, Center, Spinner, Stack } from '@chakra-ui/react';
import { useSubAppContext } from '../contexts/SubAppContext';
import VersionCard from './versionCard';
import { IVersion } from '../utils/daoPluginApi';

type VersionsProps = {
  daoId: string;
  versions: Array<IVersion>;
}

export const PluginVersions = ({ daoId, versions }: VersionsProps) => {
  return (
    <Flex as={Stack} direction='column' spacing={4} w='100%'>
      {versions ? (
        Object.keys(versions).length > 0 ? (
          Object.values(versions)
            .slice(0, 10)
            .map(version => (
              <VersionCard
                key={version?.number}
                daoId={daoId}
                version={version}
              />
            ))
        ) : (
          <Flex mt='100px' w='100%' justify='center'>
            No Version.
          </Flex>
        )
      ) : (
        <Center mt='100px' w='100%'>
          <Spinner size='xl' />
        </Center>
      )}
    </Flex>
  );
};