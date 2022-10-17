import React, { useEffect, useState } from 'react';
import { RiAddFill } from 'react-icons/ri';
import { Button, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import MainViewLayout from '../components/mainViewLayout';
import { createMemberProposal, listOffers } from '../utils/memberPluginAPI';
import { useDao } from '../contexts/DaoContext';
import MyMemberInviteList from '../components/myMemberInviteList';

const Members = () => {
    const { dao } = useDao();
    const openProposalSelector = () => {
      createMemberProposal(
        dao.daoType,
        'Apply add 0x76Ac08692318fd25E2E5e5c37662530B as member',
        '0x76Ac08692318fd25E2E5e5c37662530B',
        "",
        "ipfs://xxxxxx",
        100,
        0
      );
    };
    
    const ctaButton = (
      <Button
        rightIcon={<RiAddFill />}
        title={'Members'}
        onClick={openProposalSelector}
      >
        New Member
      </Button>
    );

    return (
      <MainViewLayout
        header='Members'
        headerEl={ctaButton}
      >
      <Tabs size='md' variant='enclosed'>
        <TabList>
          <Tab>Member List</Tab>
          <Tab>My Invite</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <p>one!</p>
          </TabPanel>
          <TabPanel>
            <MyMemberInviteList daoId={dao.daoType} />
          </TabPanel>
        </TabPanels>
      </Tabs>
      </MainViewLayout>
    );
}

export default Members;
