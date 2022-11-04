import React from 'react';
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

const PluginManagement = () => {
    const { dao } = useDao();
    const ctaButton = (
      <></>
    );

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
                <InstalledPluginList daoId={dao?.daoType} />
              </Flex>
            </TabPanel>
            <TabPanel>
                <RecommendedPluginList daoId={dao?.daoType} />
            </TabPanel>
            <TabPanel>
                <AllPluginList daoId={dao?.daoType} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </MainViewLayout>
    );
}

export default PluginManagement;
