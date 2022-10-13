import React, { useEffect } from 'react';
import { RiAddFill } from 'react-icons/ri';
import { Button } from '@chakra-ui/react';
import MainViewLayout from '../components/mainViewLayout';
import { createMemberProposal } from '../utils/memberPluginAPI';
import { useDao } from '../contexts/DaoContext';

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

      </MainViewLayout>
    );
}

export default Members;
