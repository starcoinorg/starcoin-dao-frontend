import React from 'react';
import { RiAddFill } from 'react-icons/ri';
import { Button } from '@chakra-ui/react';

import MainViewLayout from '../components/mainViewLayout';

const Members = React.memo(
  () => {
    const openProposalSelector = () => {
      console.log("openProposalSelector");
    };

    const ctaButton = (
      <Button
        rightIcon={<RiAddFill />}
        title={'Proposal'}
        onClick={openProposalSelector}
      >
        New proposal
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
