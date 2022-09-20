import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { RiErrorWarningLine, RiQuestionLine } from 'react-icons/ri';
import {
  Box,
  Button,
  Flex,
  Icon,
  Skeleton,
  Tooltip,
  Stack,
  Text,
} from '@chakra-ui/react';
import { isAfter, isBefore } from 'date-fns';
import { MaxUint256 } from '@ethersproject/constants';
import { motion } from 'framer-motion';
import { utils } from 'ethers';

import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { useMetaData } from '../contexts/MetaDataContext';
import { useTX } from '../contexts/TXContext';
import useCanInteract from '../hooks/useCanInteract';
import CrossChainMinionExecute from './crossChainMinionExecute';
import ContentBox from './ContentBox';
import TextBox from './TextBox';
import MinionExecute from './minionExecute';
import MinionCancel from './minionCancel';
import EscrowActions from './escrowActions';

import { TX } from '../data/txLegos/contractTX';
import { isMinionProposalType, memberVote } from '../utils/proposalUtils';
import { getTerm, getTitle } from '../utils/metadata';
import { capitalize, daoConnectedAndSameChain } from '../utils/general';
import { createContract } from '../utils/contract';
import { LOCAL_ABI } from '../utils/abi';
import { supportedChains } from '../utils/chain';
import { earlyExecuteMinionType } from '../utils/minionUtils';
import { useRequest } from '../hooks/useRequest';

const MotionBox = motion(Box);

const getVoteOptionData = (votingChoices, accountVote) => {
  if (!votingChoices) return [];

  const ret = votingChoices.map(item => {
    if (accountVote.length) {
      accountVote.map(vote => {
        if (!item.subtotalVotingPower) {
          item.subtotalVotingPower = 0;
        }

        if (vote.choiceSequenceId === item.sequenceId) {
          item.subtotalVotingPower = vote.subtotalVotingPower;
        }
      });
    } else {
      item.subtotalVotingPower = 0;
    }

    return item;
  });

  return ret;
};

const ProposalActions = ({
  daoMember,
  daoProposals,
  delegate,
  hideMinionExecuteButton,
  minionAction,
  overview,
  proposal,
}) => {
  const { daochain, daoid, propid } = useParams();
  const { address, injectedChain, injectedProvider } = useInjectedProvider();
  const { submitTransaction } = useTX();
  const { customTerms } = useMetaData();
  const { canInteract, interactErrors } = useCanInteract({
    checklist: ['canSponsorAndVote'],
  });
  const [enoughDeposit, setEnoughDeposit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nextProposalToProcess, setNextProposal] = useState(null);
  const [quorumNeeded, setQuorumNeeded] = useState(null);

  const [voteData, setVoteData] = useState({
    hasVoted: null,
    votedYes: false,
    votedNo: false,
    userYes: false,
    userNo: false,
    userYesReadable: false,
    userNoReadable: false,
    totalYes: 0,
    totalNo: 0,
    totalYesReadable: '(0)',
    totalNoReadable: '(0)',
    totalVotes: 0,
    isPassing: true,
    isFailing: false,
    votePassedProcessFailed: false,
  });

  const getVoteOptionData = (votingChoices, accountVote) => {
    if (!votingChoices) return [];

    const ret = votingChoices.map(item => {
      if (accountVote.length) {
        accountVote.map(vote => {
          if (!item.subtotalVotingPower) {
            item.subtotalVotingPower = 0;
          }

          if (vote.choiceSequenceId === item.sequenceId) {
            item.subtotalVotingPower = vote.subtotalVotingPower;
          }
        });
      } else {
        item.subtotalVotingPower = 0;
      }

      return item;
    });

    return ret;
  };

  useEffect(() => {
    const optionsData = getVoteOptionData(
      proposal?.proposalVotingChoices,
      proposal?.accountVoteSummaries,
    );

    optionsData.map(item => {
      if (item.title === 'Yes' || item.title === 'YES') {
        setVoteData(
          Object.assign(voteData, {
            totalYes: item.subtotalVotingPower,
            totalYesReadable: `(${item.subtotalVotingPower})`,
            totalVotes: +voteData.totalVotes + item.subtotalVotingPower,
          }),
        );
      }

      if (item.title === 'No' || item.title === 'NO') {
        setVoteData(
          Object.assign(voteData, {
            totalNo: item.subtotalVotingPower,
            totalNoReadable: `(${item.subtotalVotingPower})`,
            totalVotes: +voteData.totalVotes + item.subtotalVotingPower,
          }),
        );
      }
    });
  }, [proposal]);

  const currentlyVoting = proposal => {
    return (
      isBefore(Date.now(), new Date(+proposal?.votingPeriodEnd)) &&
      isAfter(Date.now(), new Date(+proposal?.votingPeriodStart))
    );
  };

  const dateNow = Date.now();
  const NetworkOverlay = () => (
    <Flex
      position='absolute'
      top='0px'
      left='0px'
      bottom='0px'
      right='0px'
      zIndex='3'
      align='center'
      justify='center'
      style={{ backdropFilter: 'blur(6px)' }}
      sx={{ '-webkit-backdrop-filter': 'blur(6px)' }}
      w='100%'
      h='100%'
    >
      <Box
        maxW={['70%', null, null, 'auto']}
        fontFamily='heading'
        fontSize={['md', null, null, 'xl']}
        fontWeight={700}
        textAlign='center'
        zIndex='2'
        title={getTitle(customTerms, 'Proposal')}
      >
        {`Connect to ${capitalize(supportedChains[daochain]?.network)}
      for ${getTerm(customTerms, 'proposal')} actions`}
      </Box>
    </Flex>
  );

  useEffect(() => {
    let shouldUpdate = true;
    const getDepositTokenBalance = async () => {
      const tokenContract = createContract({
        address: overview?.depositToken.tokenAddress,
        abi: LOCAL_ABI.ERC_20,
        chainID: daochain,
      });
      const tokenBalance = await tokenContract.methods
        .balanceOf(address)
        .call();

      if (shouldUpdate) {
        setEnoughDeposit(
          +overview?.proposalDeposit === 0 ||
            +tokenBalance / 10 ** overview?.depositToken.decimals >=
              +overview?.proposalDeposit /
                10 ** overview?.depositToken.decimals,
        );
      }
    };
    if (overview?.depositToken && address && proposal) {
      getDepositTokenBalance();
      setQuorumNeeded(
        (overview?.totalShares * proposal?.minion?.minQuorum) / 100,
      );
    }
    () => {
      shouldUpdate = false;
    };
  }, [overview, address, proposal, injectedChain]);

  useEffect(() => {
    if (daoProposals) {
      const proposalsToProcess = daoProposals
        .filter(p => p.status === 'ReadyForProcessing')
        .sort((a, b) => a.gracePeriodEnds - b.gracePeriodEnds);
      if (proposalsToProcess.length > 0) {
        setNextProposal(proposalsToProcess[0]);
      }
    }
  }, [daoProposals]);

  const cancelProposal = async () => {
    setLoading(true);
    await submitTransaction({
      args: [proposal.proposalId],
      tx: TX.CANCEL_PROPOSAL,
    });
    setLoading(false);
  };

  const unlock = async token => {
    setLoading(true);
    const unlockAmount = MaxUint256.toString();
    await submitTransaction({
      args: [daoid, unlockAmount],
      tx: TX.UNLOCK_TOKEN,
      values: { tokenAddress: token, unlockAmount },
    });
    setLoading(false);
  };

  const sponsorProposal = async id => {
    setLoading(true);
    await submitTransaction({
      args: [id],
      tx: TX.SPONSOR_PROPOSAL,
    });
    setLoading(false);
  };

  const submitVote = async (proposal, vote) => {
    setLoading(true);
    await submitTransaction({
      args: [proposal.proposalIndex, vote],
      tx: TX.SUBMIT_VOTE,
    });
    setLoading(false);
  };

  const processProposal = async proposal => {
    setLoading(true);
    const getTx = proposal => {
      if (proposal.whitelist) {
        return TX.PROCESS_WL_PROPOSAL;
      }
      if (proposal.guildkick) {
        return TX.PROCESS_GK_PROPOSAL;
      }
      return TX.PROCESS_PROPOSAL;
    };
    await submitTransaction({
      args: [proposal.proposalIndex],
      tx: getTx(proposal),
    });
    setLoading(false);
  };

  const getMaxOptionsTitle = () => {
    let maxId = -1;
    let maxPower = -1;
    let ret = '';
    proposal.accountVoteSummaries.forEach(item => {
      if (item.subtotalVotingPower > maxPower) {
        maxPower = item.subtotalVotingPower;
        maxId = item.choiceSequenceId;
      }
    });

    proposal.proposalVotingChoices.forEach(item => {
      if (item.sequenceId === maxId) {
        ret = item.title;
      }
    });

    return ret;
  };

  const getBgColor = () => {
    if (proposal?.status) {
      if (proposal.status === 'PASSED') {
        return 'green.500';
      } else if (proposal.status === 'FAILED') {
        return 'red.500';
      } else if (proposal.status === 'UNKNOWN') {
        return 'green.500';
      }
    }

    return '#EB8A23';
  };

  return (
    <>
      <ContentBox position='relative'>
        {!daoConnectedAndSameChain(address, daochain, injectedChain?.chainId) &&
          ((proposal?.status === 'Unsponsored' && !proposal?.proposalIndex) ||
            proposal?.status === 'ReadyForProcessing') && <NetworkOverlay />}
        {!daoConnectedAndSameChain(address, daochain, injectedChain?.chainId) &&
          (proposal?.status !== 'Unsponsored' || proposal?.proposalIndex) &&
          proposal?.status !== 'Cancelled' &&
          !proposal?.status === 'ReadyForProcessing' && <NetworkOverlay />}
        {proposal?.status === 'Unsponsored' && !proposal?.proposalIndex && (
          <Flex justify='center' direction='column'>
            <Flex justify='center' mb={4}>
              <Flex justify='center' direction='column' align='center'>
                <TextBox size='xs'>
                  Deposit to Sponsor
                  <Tooltip
                    hasArrow
                    shouldWrapChildren
                    placement='bottom'
                    label='Deposits discourage spam, and are returned after a proposal is processed. Minus the reward for processing, if one has been selected'
                  >
                    <Icon mt='-4px' as={RiQuestionLine} />
                  </Tooltip>
                </TextBox>
                <TextBox variant='value' size='xl' textAlign='center'>
                  {`${overview?.proposalDeposit /
                    10 ** overview?.depositToken.decimals}
                  ${overview?.depositToken?.symbol}`}
                  {!enoughDeposit && daoMember ? (
                    <Tooltip
                      shouldWrapChildren
                      placement='bottom'
                      label={`Insufficient Funds: You only have ${Number(
                        daoMember?.depositTokenBalance,
                      )?.toFixed(3)} ${overview?.depositToken?.symbol}`}
                    >
                      <Icon
                        color='red.500'
                        as={RiErrorWarningLine}
                        ml={2}
                        mt='-4px'
                      />
                    </Tooltip>
                  ) : null}
                </TextBox>
              </Flex>
            </Flex>
            <Flex justify='space-around'>
              {canInteract ? (
                <>
                  {Number(daoMember?.depositTokenData?.allowance) ||
                  Number(delegate?.depositTokenData?.allowance) >=
                    Number(overview?.proposalDeposit) ||
                  Number(overview?.proposalDeposit === 0) ? (
                    <Button
                      onClick={() => sponsorProposal(proposal?.proposalId)}
                      isDisabled={!enoughDeposit}
                      isLoading={loading}
                    >
                      Sponsor
                    </Button>
                  ) : (
                    <Button
                      onClick={() => unlock(overview.depositToken.tokenAddress)}
                      isLoading={loading}
                    >
                      Unlock
                    </Button>
                  )}
                </>
              ) : (
                <Tooltip
                  hasArrow
                  shouldWrapChildren
                  placement='bottom'
                  label={interactErrors}
                  bg='secondary.500'
                >
                  <Button isDisabled>Sponsor</Button>
                </Tooltip>
              )}
              {proposal?.proposer === address?.toLowerCase() &&
                !proposal?.minionAddress && (
                  <Button
                    variant='outline'
                    onClick={cancelProposal}
                    isLoading={loading}
                  >
                    Cancel
                  </Button>
                )}
              {proposal?.minionAddress &&
                proposal?.proposer === proposal?.minionAddress && (
                  <MinionCancel
                    proposal={proposal}
                    minionAction={minionAction}
                  />
                )}
            </Flex>
          </Flex>
        )}

        {
          <>
            <Flex mb={6} w='100%'>
              <Skeleton
                isLoaded={proposal}
                w='100%'
                display='flex'
                flexDirection='row'
              >
                {currentlyVoting(proposal) ? (
                  <>
                    {daoConnectedAndSameChain(
                      address,
                      daochain,
                      injectedChain?.chainId,
                    ) &&
                      canInteract &&
                      memberVote(proposal, address) === null && (
                        <Flex w='48%' justify='space-around'>
                          <Flex
                            p={3}
                            borderWidth='1px'
                            borderColor='green.500'
                            borderStyle='solid'
                            borderRadius='40px'
                            justiy='center'
                            align='center'
                          >
                            <Icon
                              as={FaThumbsUp}
                              color='green.500'
                              w='25px'
                              h='25px'
                              _hover={{ cursor: 'pointer' }}
                              onClick={() => submitVote(proposal, 1)}
                            />
                          </Flex>
                          <Flex
                            p={3}
                            borderWidth='1px'
                            borderColor='red.500'
                            borderStyle='solid'
                            borderRadius='40px'
                            justiy='center'
                            align='center'
                          >
                            <Icon
                              as={FaThumbsDown}
                              color='red.500'
                              w='25px'
                              h='25px'
                              transform='rotateY(180deg)'
                              _hover={{ cursor: 'pointer' }}
                              onClick={() => submitVote(proposal, 2)}
                            />
                          </Flex>
                        </Flex>
                      )}
                    <Flex
                      justify={
                        daoMember && memberVote(proposal, address) === null
                          ? 'flex-end'
                          : 'center'
                      }
                      align='center'
                      w={
                        daoMember && memberVote(proposal, address) === null
                          ? '50%'
                          : '100%'
                      }
                    >
                      <Box
                        as='i'
                        fontSize={
                          daoMember && memberVote(proposal, address) === null
                            ? 'xs'
                            : 'md'
                        }
                      >
                        {dateNow < proposal.votingPeriodEnd &&
                          dateNow >= proposal.votingPeriodStart &&
                          'Awaiting Votes'}
                      </Box>
                    </Flex>
                  </>
                ) : (
                  <>
                    <Flex justify='center' align='center' w='100%'>
                      <TextBox size='xl' variant='value'>
                        {proposal?.status === 'FAILED' && 'Failed'}
                        {proposal?.status === 'PASSED' && 'Passed'}
                        {proposal?.status === 'UNKNOWN' && getMaxOptionsTitle()}
                      </TextBox>
                    </Flex>
                  </>
                )}
              </Skeleton>
            </Flex>
            <Flex
              w='100%'
              h='20px'
              borderRadius='999px'
              backgroundColor='whiteAlpha.500'
              overflow='hidden'
              justify='space-between'
            >
              {
                <MotionBox
                  h='100%'
                  backgroundColor={getBgColor()}
                  animate={{
                    width: [
                      '0%',
                      proposal
                        ? `${((dateNow - proposal.votingPeriodStart) /
                            (proposal.votingPeriodEnd -
                              proposal.votingPeriodStart)) *
                            100}%`
                        : '0%',
                    ],
                  }}
                  transition={{ duration: 0.5 }}
                />
              }
              {/* {+voteData?.totalNo > 0 && (
                <MotionBox
                  h='100%'
                  backgroundColor='red.500'
                  animate={{
                    width: [
                      '0%',
                      `${(+voteData?.totalNo /
                        (+voteData?.totalYes + +voteData?.totalNo)) *
                        100}%`,
                    ],
                  }}
                  transition={{ duration: 0.5 }}
                />
              )} */}
            </Flex>
            <Flex justify='space-between' flexDirection='column' mt={3}>
              {getVoteOptionData(
                proposal?.proposalVotingChoices,
                proposal?.accountVoteSummaries,
              ).map((item, index) => (
                <Skeleton key={index} isLoaded={true}>
                  <TextBox
                    variant='value'
                    size='md'
                    style={{ display: 'flex' }}
                  >
                    <Text mr={5} style={{ flex: 1 }}>{`${item.title}`}</Text>
                    <Tooltip label={item.subtotalVotingPower} fontSize='md'>
                      <Text
                        maxW={'50%'}
                        style={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.subtotalVotingPower
                          .toString()
                          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}
                      </Text>
                    </Tooltip>
                  </TextBox>
                </Skeleton>
              ))}
            </Flex>
          </>
        }

        <Stack>
          {daoConnectedAndSameChain(
            address,
            daochain,
            injectedChain?.chainId,
          ) &&
            proposal?.status === 'ReadyForProcessing' &&
            !injectedProvider?.currentProvider?.safe &&
            (nextProposalToProcess?.proposalId === proposal?.proposalId ? (
              <Flex justify='center' pt='10px'>
                <Flex direction='column'>
                  <Button
                    onClick={() => processProposal(proposal)}
                    isLoading={loading}
                  >
                    Process
                  </Button>
                </Flex>
              </Flex>
            ) : (
              <Flex justify='center' pt='10px'>
                <Flex direction='column'>
                  <Button
                    as={Link}
                    to={`/dao/${daochain}/${daoid}/proposals/${nextProposalToProcess?.proposalId}`}
                    variant='outline'
                    onClick={() => setNextProposal(nextProposalToProcess)}
                  >
                    {`Proposal ${nextProposalToProcess?.proposalId} Needs Processing Next`}
                  </Button>
                </Flex>
              </Flex>
            ))}

          {((proposal?.status === 'NeedsExecution' &&
            proposal?.minionAddress) ||
            earlyExecuteMinionType(proposal)) && (
            <Stack mt='15px' justify='center'>
              {(proposal?.status === 'NeedsExecution' &&
                proposal?.minionAddress) ||
              (quorumNeeded && voteData.totalYes >= quorumNeeded) ? (
                <MinionExecute
                  hideMinionExecuteButton={hideMinionExecuteButton}
                  minionAction={minionAction}
                  proposal={proposal}
                  early={
                    earlyExecuteMinionType(proposal) &&
                    voteData.totalYes >= quorumNeeded &&
                    proposal?.status === 'NeedsExecution'
                  }
                />
              ) : (
                quorumNeeded &&
                isMinionProposalType(proposal) && (
                  <Text size='sm' textAlign='center' maxW='60%' m='auto'>
                    {proposal?.minion?.minQuorum}% quorum or{' '}
                    {utils.commify(quorumNeeded)} shares needed for Early
                    Execution
                  </Text>
                )
              )}
            </Stack>
          )}
          {proposal?.executed && proposal?.minionExecuteActionTx && (
            <CrossChainMinionExecute chainID={daochain} proposal={proposal} />
          )}
          {proposal?.escrow &&
            (proposal?.status === 'Failed' ||
              proposal?.status === 'Cancelled') && (
              <Flex justify='center'>
                <EscrowActions proposal={proposal} />
              </Flex>
            )}
        </Stack>
      </ContentBox>
    </>
  );
};

export default ProposalActions;
