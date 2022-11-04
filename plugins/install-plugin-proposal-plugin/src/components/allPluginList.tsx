import React, { useEffect, useState } from 'react';
import { Flex, Spinner, Button, HStack, Stack, Link } from '@chakra-ui/react';

import PluginCard from './pluginCard';
import { listPlugins, isPluginInstalled, IPlugin } from '../utils/daoPluginApi';

const AllPluginList = ({ daoId, installedPluginIds }) => {
  const [plugins, setPlugins] = useState<Array<IPlugin>>([]);
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

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        const plugins = await listPlugins(0, 10);
        setPlugins(plugins);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    loadPlugins();
  }, [daoId]);

  return (
    <Flex as={Stack} direction='column' spacing={4} w='100%'>
      {!loading ? (
        Object.keys(plugins).length > 0 ? (
          Object.values(plugins)
            .slice(0, 10)
            .map(plugin_info => (
              <PluginCard
                key={plugin_info.id}
                daoId={daoId}
                plugin_info={plugin_info}
                installed={isPluginInstalled(installedPluginIds, plugin_info.type)}
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

export default AllPluginList;