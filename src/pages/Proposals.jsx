import React, { useState } from 'react';
import { RiAddFill } from 'react-icons/ri';
import { Box, Button, Flex } from '@chakra-ui/react';

import { useOverlay } from '../contexts/OverlayContext';
import MainViewLayout from '../components/mainViewLayout';
import ProposalsList from '../components/proposalList';
import { getTerm, getTitle } from '../utils/metadata';
import useCanInteract from '../hooks/useCanInteract';
import { useRequest } from '../hooks/useRequest';

const Proposals = React.memo(({ proposals, customTerms }) => {
  const { setProposalSelector } = useOverlay();
  const [refresh, setRefresh] = useState(0);
  const { canInteract } = useCanInteract({
    checklist: ['isConnected', 'isSameChain', 'spamFilterMemberOnlyOff'],
  });

  const openProposalSelector = () => {
    setProposalSelector(true);
  };

  const ctaButton = (
    <Button
      onClick={() => {
        setRefresh(refresh + 1);
      }}
    >
      Refresh
    </Button>
  );
  return (
    <MainViewLayout
      header='Proposals'
      headerEl={ctaButton}
      customTerms={customTerms}
      isDao
    >
      <Flex wrap='wrap'>
        <Box
          w={['100%', null, null, '100%', '100%']}
          pr={[0, null, null, null, 6]}
          pb={6}
        >
          <ProposalsList
            refresh={refresh}
            proposals={proposals}
            customTerms={customTerms}
          />
        </Box>
      </Flex>
    </MainViewLayout>
  );
});

export default Proposals;
