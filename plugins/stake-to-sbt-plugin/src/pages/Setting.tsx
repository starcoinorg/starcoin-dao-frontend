import React from 'react';
import {
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
} from '@chakra-ui/react';

import MainViewLayout from '../components/mainViewLayout';
import Back from "../components/back";
import { useSubAppContext } from '../contexts/SubAppContext'
import CreateAcceptProposalWidget from '../components/createAcceptProposal'
import CreateWeightProposalWidget from "../components/createWeightProposal";

const Setting = () => {
    const {dao} = useSubAppContext()

    console.log(dao)

    return (
        <MainViewLayout
            header='Stake SBT Setting'
            headerEl={Back('Back')}
        >
            <Tabs size='md' variant='enclosed'>
                <TabList>
                    <Tab>Create weight propoal</Tab>
                    <Tab>Create accept propoal</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        {/* TODO: AutoCompleteInputWidget BUG index must 0,  */}
                        <CreateWeightProposalWidget dao={dao}/>
                    </TabPanel>
                    <TabPanel>
                        <CreateAcceptProposalWidget dao={dao}/>
                    </TabPanel>
                </TabPanels>
            </Tabs>

        </MainViewLayout>
    )
}

export default Setting;