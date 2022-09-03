import React from 'react';
import { RiAddFill } from 'react-icons/ri';
import { Button } from '@chakra-ui/react';
import { requestAccounts } from '../utils/stcWalletSdk';
import MainViewLayout from '../components/mainViewLayout';

const Members = React.memo(
  () => {
    const openProposalSelector = () => {
      const newAccounts = requestAccounts();
      console.log(newAccounts);
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
        Body
      </MainViewLayout>
    );
  },
);

export default Members;
