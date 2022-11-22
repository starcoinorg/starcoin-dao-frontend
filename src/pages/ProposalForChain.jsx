import React, { useEffect, useState } from 'react';
import { RiArrowLeftLine, RiRefreshLine } from 'react-icons/ri';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Flex, Box, Stack, Link, Icon, IconButton } from '@chakra-ui/react';

import { useTX } from '../contexts/TXContext';
import ActivitiesFeed from '../components/activitiesFeed';
import MainViewLayout from '../components/mainViewLayout';
import ProposalActionsForChain from '../components/proposalActionsForChain';
import ProposalDetailsForChain from '../components/proposalDetailsForChain';
import TextBox from '../components/TextBox';
import { getProposalHistories } from '../utils/activities';
import { getTerm, getTitle } from '../utils/metadata';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import {
  get_proposal_state_text,
  get_single_proposal,
} from '../utils/proposalApi';

const ProposalForChain = ({
  activities,
  customTerms,
  daoProposals,
  daoMember,
  delegate,
  overview,
}) => {
  const { refreshDao } = useTX();
  const { propid, daochain, daoid } = useParams();
  const [minionAction, setMinionAction] = useState(null);
  const [hideMinionExecuteButton, setHideMinionExecuteButton] = useState(false);
  const [currentProposal, setCurrentProposal] = useState(null);
  const [proposal, setProposal] = useState(null);
  const { injectedProvider, injectedChain, address } = useInjectedProvider();

  const handleRefreshDao = () => {
    const skipVaults = true;
    refreshDao(skipVaults);
  };

  const loadProposal = async () => {
    const proposal = await get_single_proposal(injectedProvider, daoid, propid);
    proposal.status = await get_proposal_state_text(
      injectedProvider,
      daoid,
      propid,
    );
    return proposal;
  };

  useEffect(() => {
    if (injectedProvider) {
      loadProposal()
        .then(proposal => {
          setProposal(proposal);
        })
        .catch(err => {
          console.error('Error fetching proposals', err);
        });
    }
  }, [daoid, daochain, propid, injectedProvider]);

  return (
    <MainViewLayout header='Proposal' customTerms={customTerms} isDao>
      <Box>
        <Flex wrap='wrap'>
          <Flex
            direction='column'
            w={['100%', null, null, null, '60%']}
            pr={[0, null, null, null, 6]}
          >
            <Link as={RouterLink} to={`/dao/${daochain}/${daoid}/proposals`}>
              <Flex align='center'>
                <Icon
                  name='arrow-back'
                  color='primary.50'
                  as={RiArrowLeftLine}
                  h='20px'
                  w='20px'
                  mr={2}
                />
                <TextBox
                  size={['sm', null, null, 'md']}
                  title={getTitle(customTerms, 'Proposals')}
                >
                  {`All ${getTerm(customTerms, 'proposals')}`}
                </TextBox>
              </Flex>
            </Link>
            <ProposalDetailsForChain
              proposal={proposal}
              overview={overview}
              hideMinionExecuteButton={hideMinionExecuteButton}
              minionAction={minionAction}
            />
          </Flex>
          <Flex
            direction='column'
            w={['100%', null, null, null, '40%']}
            pt={[6, 0]}
          >
            <Flex justifyContent='space-between'>
              {(!currentProposal?.cancelled || currentProposal?.escrow) && (
                <TextBox size='md'>Actions</TextBox>
              )}

              <IconButton
                icon={<RiRefreshLine size='1.5rem' />}
                p={0}
                size='sm'
                variant='outline'
                onClick={handleRefreshDao}
              />
            </Flex>
            <Stack pt={6} spacing={6}>
              <ProposalActionsForChain
                proposal={proposal}
                overview={overview}
                daoMember={daoMember}
                daoProposals={daoProposals}
                delegate={delegate}
                hideMinionExecuteButton={hideMinionExecuteButton}
                minionAction={minionAction}
              />
              {/* {(!currentProposal?.cancelled || currentProposal?.escrow) && (
                
              )} */}
              <ActivitiesFeed
                limit={10}
                activities={currentProposal}
                hydrateFn={getProposalHistories}
                isLink={false}
                proposal={proposal}
                daoProposals={daoProposals}
              />
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </MainViewLayout>
  );
};

export default ProposalForChain;
