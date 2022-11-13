import React, { useEffect, useState } from 'react';
import { Flex, Spinner, Stack } from '@chakra-ui/react';
import { useSubAppContext } from '../contexts/SubAppContext';
import PluginCard from './pluginCard';
import { listPlugins, isPluginInstalled, IPlugin } from '../utils/daoPluginApi';

const RecommendedPluginList = ({ daoId, installedPluginIds }) => {
  const { injectedProvider } = useSubAppContext();
  const [plugins, setPlugins] = useState<Array<IPlugin>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        const plugins = await listPlugins(injectedProvider, 0, 20);
        if (plugins.length > 0) {
          plugins.sort((a: IPlugin, b: IPlugin) => {
            return b.star - a.star;
          });
        }

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

export default RecommendedPluginList;