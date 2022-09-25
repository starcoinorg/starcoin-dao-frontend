import React from 'react';
import { RiAddFill } from 'react-icons/ri';
import { Button } from '@chakra-ui/react';
import MainViewLayout from '../components/mainViewLayout';
import { createMemberProposal } from '../utils/memberPluginAPI';
import { useDao } from '../contexts/DaoContext';

const Proposals = () => {
    const { dao } = useDao();
    const openProposalSelector = () => {
      createMemberProposal(
        dao.daoType,
        'Apply add xxxx as member',
        '0x9711320238d0Ab3d42848A20d54b6b00',
        100,
        1000
      );
    };

    const ctaButton = (
      <Button
        rightIcon={<RiAddFill />}
        title={'Proposals'}
        onClick={openProposalSelector}
      >
        New Member
      </Button>
    );

    return (
      <MainViewLayout
        header='Proposals'
        headerEl={ctaButton}
      >

      </MainViewLayout>
    );
}

export default Proposals;
