import React, { useEffect, useState } from 'react';
import { 
  Flex,
  Stack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import MainViewLayout from '../components/mainViewLayout';
import { useSubAppContext } from '../contexts/SubAppContext';
import InstalledPluginList from '../components/installedPluginList';
import RecommendedPluginList from '../components/recommendedPluginList';
import AllPluginList from '../components/allPluginList';
import { getDaoInstalledPluginIds } from '../utils/daoPluginApi';

const PluginManagement = () => {
    const { injectedProvider, dao } = useSubAppContext();
    const [installedPluginIds, setInstalledPluginIds] = useState<Array<string>>([]);
    const ctaButton = (
      <></>
    );

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
        header='Plugins'
        headerEl={ctaButton}
      >
        <Tabs size='md' variant='enclosed'>
          <TabList>
            <Tab>Installled</Tab>
            <Tab>Recommended</Tab>
            <Tab>All</Tab>
          </TabList>
          <TabPanels 
            w={['100%', null, null, '100%', '80%']}
            pr={[0, null, null, null, 6]}
            pb={6}>
            <TabPanel>
              <Flex as={Stack} direction='column' spacing={4}>
                <InstalledPluginList daoId={dao?.daoType} installedPluginIds={installedPluginIds} />
              </Flex>
            </TabPanel>
            <TabPanel>
              <Flex as={Stack} direction='column' spacing={4}>
                <RecommendedPluginList daoId={dao?.daoType} installedPluginIds={installedPluginIds}/>
              </Flex>
            </TabPanel>
            <TabPanel>
                <Flex as={Stack} direction='column' spacing={4}>
                  <AllPluginList daoId={dao?.daoType} installedPluginIds={installedPluginIds}/>
                </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </MainViewLayout>
    );
}

export default PluginManagement;
