import React, { useEffect, useState } from 'react';
import { Flex, Center, Spinner, Stack } from '@chakra-ui/react';
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
            return b.star_count - a.star_count;
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
            .map(plugin_info => {
                return isPluginInstalled(installedPluginIds, plugin_info.type) ? <></> : <PluginCard
                key={plugin_info.id}
                daoId={daoId}
                plugin_info={plugin_info}
              />
              }
            )
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

export default RecommendedPluginList;