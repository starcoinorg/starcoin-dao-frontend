import React, { useEffect, useState } from 'react';
import { Flex, Spinner, Button, HStack, Stack, Link } from '@chakra-ui/react';

import PluginCard from './pluginCard';
 
const RecommendedPluginList = ({ daoId }) => {
  const [installedPlugins, setInstalledPlugins] = useState([]);
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
    <Flex as={Stack} direction='column' spacing={4} w='100%'>
      {!loading ? (
        Object.keys(installedPlugins).length > 0 ? (
          Object.values(installedPlugins)
            .slice(0, 10)
            .map(plugin_info => (
              <PluginCard
                daoId={daoId}
                plugin_info={plugin_info}
                installed={true}
              />
            ))
        ) : (
          <Flex mt='100px' w='100%' justify='center'>
            No Plughin.
          </Flex>
        )
      ) : (
        <Spinner size='xl' />
      )}
    </Flex>
  );
};

export default RecommendedPluginList;