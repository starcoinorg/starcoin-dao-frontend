import React, { useEffect, useState } from 'react';
import { Flex, Center, Spinner, Stack } from '@chakra-ui/react';
import { useSubAppContext } from '../contexts/SubAppContext';
import PluginCard from './pluginCard';
import { Divider } from '@chakra-ui/react';
import { getDaoInstalledPlugins, isPluginInstalled, IPlugin } from '../utils/daoPluginApi';

const InstalledPluginList = ({ daoId, installedPluginIds }) => {
  const { injectedProvider } = useSubAppContext();
  const [installedPlugins, setInstalledPlugins] = useState<Array<IPlugin>>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadPlugins = async () => {
      try {
        const plugins = await getDaoInstalledPlugins(injectedProvider, daoId);
        setInstalledPlugins(plugins);
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
        Object.keys(installedPlugins).length > 0 ? (
          Object.values(installedPlugins)
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
        <Center mt='100px' w='100%'>
          <Spinner size='xl' />
        </Center>
      )}
    </Flex>
  );
};

export default InstalledPluginList;