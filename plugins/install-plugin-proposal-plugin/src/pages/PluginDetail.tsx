import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'
import { 
  Flex,
  Stack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Skeleton,
  Center,
  Spinner,
} from '@chakra-ui/react';
import MainViewLayout from '../components/mainViewLayout';
import { useSubAppContext } from '../contexts/SubAppContext';
import PluginCard from '../components/pluginCard';
import { PluginVersions } from '../components/pluginVersions';
import { getPluginInfo, getDaoInstalledPluginIds, isPluginInstalled, IPlugin } from '../utils/daoPluginApi';

const PluginDetail = () => {
  const { pluginId } = useParams()
  const { injectedProvider, dao } = useSubAppContext();
  const [pluginInfo, setPluginInfo] = useState<IPlugin>(null);
  const [installedPluginIds, setInstalledPluginIds] = useState<Array<string>>([]);
  const [loading, setLoading] = useState(true);
    const ctaButton = (
      <></>
    );
 
    useEffect(() => {
      const loadPluginDetail = async () => {
        try {
          setLoading(true);
          const plugin = await getPluginInfo(injectedProvider, pluginId);
          if (plugin) {
            setPluginInfo(plugin);
          }
          setLoading(false);
        } catch (err) {
          console.log(err);
          setLoading(false);
        }
      };

      loadPluginDetail();
    }, [pluginId]);

    useEffect(() => {
      const loadPlugins = async () => {
        try {
          const pluginIds = await getDaoInstalledPluginIds(injectedProvider, dao.daoType);
          setInstalledPluginIds(pluginIds);
        } catch (err) {
          console.log(err);
        }
      };

      loadPlugins();
    }, [dao.daoType]);

    return (
      <MainViewLayout
        header='Plugin Detail'
        headerEl={ctaButton}
      >
        {!loading ? (
          <Tabs size='md' variant='enclosed'>
            <TabList>
              <Tab>Readme</Tab>
              <Tab>Versions</Tab>
            </TabList>
            <TabPanels 
              w={['100%', null, null, '100%', '80%']}
              pr={[0, null, null, null, 6]}
              pb={6}>
              <TabPanel>
                <Flex as={Stack} direction='column' spacing={4}>
                  <Skeleton isLoaded={pluginInfo}>
                    <PluginCard
                      key={pluginInfo?.id}
                      daoId={dao?.daoType}
                      plugin_info={pluginInfo}
                      installed={isPluginInstalled(installedPluginIds, pluginInfo?.type)}
                      showDetail={false}
                    />
                  </Skeleton>
                </Flex>
              </TabPanel>
              <TabPanel>
                <Flex as={Stack} direction='column' spacing={4}>
                  <Skeleton isLoaded={pluginInfo}>
                    <PluginVersions daoId={dao?.daoType} versions={pluginInfo.versions}/>
                  </Skeleton>
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <Center mt='100px' w='100%'>
            <Spinner size='xl' />
          </Center>
        )}
      </MainViewLayout>
    );
}

export default PluginDetail;
