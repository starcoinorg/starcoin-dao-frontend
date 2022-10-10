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
        'Apply add xxxx as member',
        '0x9711320238d0Ab3d42848A20d54b6b00',
        "",
        "ipfs://xxxxxx",
        100,
        0
      );
    };

    useEffect(() => {
      const initial = async () => {
        try {
          const newAccounts = await window.starcoin.request({
            method: 'stc_requestAccounts',
          });
          const chainInfo = await window.starcoin.request({
            method: 'chain.id',
          });
          const provider = new providers.Web3Provider(
            window.starcoin,
            chainInfo.name,
          );
        } catch (error) {
          console.error(error);
        }
      };
  
      initial();
    }, []);

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
