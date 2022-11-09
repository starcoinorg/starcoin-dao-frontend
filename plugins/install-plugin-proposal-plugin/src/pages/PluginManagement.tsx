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
import { useDao } from '../contexts/DaoContext';
import InstalledPluginList from '../components/installedPluginList';
import RecommendedPluginList from '../components/recommendedPluginList';
import AllPluginList from '../components/allPluginList';
import { getDaoInstalledPluginIds, IPlugin } from '../utils/daoPluginApi';

const PluginManagement = () => {
    const { dao } = useDao();
    const [installedPluginIds, setInstalledPluginIds] = useState<Array<string>>([]);
    const ctaButton = (
      <></>
    );

    useEffect(() => {
      const loadPlugins = async () => {
        try {
          const pluginIds = await getDaoInstalledPluginIds(dao.daoType);
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
          <TabPanels>
            <TabPanel>
              <Flex as={Stack} direction='column' spacing={4} w='100%'>
                <InstalledPluginList daoId={dao?.daoType} installedPluginIds={installedPluginIds} />
              </Flex>
            </TabPanel>
            <TabPanel>
                <RecommendedPluginList daoId={dao?.daoType} installedPluginIds={installedPluginIds}/>
            </TabPanel>
            <TabPanel>
                <AllPluginList daoId={dao?.daoType} installedPluginIds={installedPluginIds}/>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </MainViewLayout>
    );
}

export default PluginManagement;
