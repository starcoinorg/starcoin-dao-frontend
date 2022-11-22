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
  useToast,
  useDisclosure,
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
import { useDaoAction } from '../contexts/DaoActionContext';
import {
  queue_proposal_action,
  get_member_power,
  get_access_path,
  get_with_proof_by_root_raw,
  cast_vote,
} from '../utils/proposalApi';
import { validate } from '../utils/validation';
import { formatDistanceToNow } from 'date-fns';
import {
  MiddleActionBox,
  PropActionBox,
  TopStatusBox,
  UserVoteData,
  VotingActive,
  VotingInactive,
} from '../proposalBuilder/proposalActionPrimitives';

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

const ProposalActionsForChain = ({
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
  const { executeProposal } = useDaoAction();
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
    console.log('daoProposals:', daoProposals);

    if (daoProposals) {
      const proposalsToProcess = daoProposals
        .filter(p => p.status === 'Agreed')
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

  const toast = useToast();
  const [daoData, setDaoData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [accountPowerTotal, setAccountPowerTotal] = useState(0);
  const [choiceSequenceId, setChoiceSequenceId] = useState(null);

  useEffect(() => {
    if (daoid) {
      setDaoData({
        daoId: daoid,
        daoStrategies: [
          {
            votingPowerName: 'default',
          },
        ],
      });
    }
  }, [daoid]);

  const voteHandler = async sequenceId => {
    setLoading(true);
    try {
      const accountPowerData = await get_member_power(
        address,
        daoid,
        proposal.state_root,
      );
      setAccountPowerTotal(+accountPowerData.totalVotingPower);
      setChoiceSequenceId(sequenceId);
      onOpen();
    } catch (err) {
      console.error('error getting member power:', err);
      setLoading(false);
    }
  };

  const signHandle = async choiceSequenceId => {
    try {
      let access_path = await get_access_path(injectedProvider, daoid, address);
      console.log('access_path: ', access_path);

      let state_root = proposal.blockStateRoot;
      console.log('state_root: ', state_root);

      let proof = await get_with_proof_by_root_raw(
        injectedChain.chainId,
        access_path,
        state_root,
      );
      console.log('proof: ', proof);

      let transactionHash = await cast_vote(
        injectedProvider,
        daoid,
        proposal.id,
        proof,
        choiceSequenceId,
      );
      console.log('transactionHash: ', transactionHash);

      onClose();
      setLoading(false);
      toast({
        title: 'Success',
        description: 'Vote successfully',
        position: 'top-right',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        position: 'top-right',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const queueProposal = async proposal => {
    setLoading(true);

    console.log('proposal:', proposal);

    await queue_proposal_action(
      injectedProvider,
      daoid,
      proposal.proposalId.proposalNumber,
    );

    setLoading(false);
  };

  const processProposal = async proposal => {
    setLoading(true);

    console.log('proposal:', proposal);

    await executeProposal(
      injectedProvider,
      proposal.proposalId.daoId,
      proposal.proposalId.proposalNumber,
    );

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

  const getProposalStatus = proposalStatus => {
    if (proposalStatus === 'Pending') {
      return {
        status: 'PENDING',
        color: 'yellow',
      };
    } else if (proposalStatus === 'Active') {
      return {
        status: 'ACTIVE',
        color: 'green',
      };
    } else if (proposalStatus === 'Rejected') {
      return {
        status: 'REJECTED',
        color: 'red.500',
      };
    } else if (proposalStatus === 'Defeated') {
      return {
        status: 'DEFEATED',
        color: 'red.500',
      };
    } else if (proposalStatus === 'Agreed') {
      return {
        status: 'AGREED',
        color: 'green.500',
      };
    } else if (proposalStatus === 'Queued') {
      return {
        status: 'QUEUED',
        color: 'green.500',
      };
    } else if (proposalStatus === 'Executable') {
      return {
        status: 'EXECUTABLE',
        color: 'green.500',
      };
    } else if (proposalStatus === 'Extracted') {
      return {
        status: 'EXTRACTED',
        color: 'green.500',
      };
    } else {
      return {
        status: 'UNKOWN',
        color: '#EB8A23',
      };
    }
  };

  const getStartTime = () => {
    if (validate.number(Number(proposal?.votingPeriodStart))) {
      return formatDistanceToNow(
        new Date(Number(proposal?.votingPeriodStart)),
        {
          addSuffix: true,
        },
      );
    }
    return '--';
  };

  const getEtaTime = () => {
    if (validate.number(Number(proposal?.eta))) {
      return formatDistanceToNow(new Date(Number(proposal?.eta)), {
        addSuffix: true,
      });
    }
    return '--';
  };

  const getEndTime = () => {
    if (validate.number(Number(proposal?.votingPeriodEnd))) {
      return formatDistanceToNow(new Date(Number(proposal?.votingPeriodEnd)), {
        addSuffix: true,
      });
    }
    return '--';
  };

  const getProposalText = proposalStatus => {
    if (proposalStatus === 'Pending') {
      return `will start ${getStartTime()}`;
    } else if (proposalStatus === 'Queued') {
      return `can be executed ${getEtaTime()}`;
    }

    return `ended ${getEndTime()}`;
  };

  return (
    <>
      <ContentBox position='relative'>
        <Skeleton isLoaded={proposal?.status}>
          <TopStatusBox
            status={getProposalStatus(proposal?.status).status}
            appendStatusText={getProposalText(proposal?.status)}
            circleColor={getProposalStatus(proposal?.status).color}
            proposal={proposal}
            voteData={voteData}
            quorum
          />
        </Skeleton>

        {
          <>
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
                    {currentlyVoting(proposal) && (
                      <Button
                        ml={5}
                        size='sm'
                        minW='4rem'
                        onClick={voteHandler(item.sequenceId)}
                      >
                        Vote
                      </Button>
                    )}
                  </TextBox>
                </Skeleton>
              ))}
            </Flex>
          </>
        }

        <Stack>
          {proposal?.status === 'Agreed' && (
            <Flex justify='center' pt='10px'>
              <Flex direction='column'>
                <Button
                  onClick={() => queueProposal(proposal)}
                  isLoading={loading}
                >
                  Queue
                </Button>
              </Flex>
            </Flex>
          )}

          {proposal?.status === 'Executable' && (
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
          )}

          {proposal?.escrow &&
            (proposal?.status === 'Failed' ||
              proposal?.status === 'Cancelled') && (
              <Flex justify='center'>
                <EscrowActions proposal={proposal} />
              </Flex>
            )}
        </Stack>

        <AlertDialog
          motionPreset='slideInBottom'
          leastDestructiveRef={cancelRef}
          onClose={() => {
            onClose();
            setLoading(false);
          }}
          isOpen={isOpen}
          isCentered
        >
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader color={'#000'}>Confirm Vote</AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody color={'#000'}>
              You have <i>{accountPowerTotal}</i> voting rights（
              {daoData?.daoStrategies[0]?.votingPowerName}）, All votes can be
              cast at one time only, and cannot be modified after cast
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  onClose();
                  setLoading(false);
                }}
                sx={{
                  border: '1px solid rgb(255, 150, 142)',
                  background: '#fff',
                  color: '#000',
                  _hover: {
                    background: '#fff',
                    color: '#000',
                  },
                  _focus: {
                    background: '#fff',
                    color: '#000',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme={'red'}
                ml={3}
                disabled={+accountPowerTotal === 0}
                onClick={() => {
                  signHandle(choiceSequenceId);
                }}
              >
                Confirm Vote
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ContentBox>
    </>
  );
};

export default ProposalActionsForChain;
