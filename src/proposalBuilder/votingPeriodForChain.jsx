import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Skeleton,
  AlertDialogCloseButton,
  useDisclosure,
} from '@chakra-ui/react';

import { useTX } from '../contexts/TXContext';
import { ParaSm } from '../components/typography';
import {
  MiddleActionBox,
  PropActionBox,
  TopStatusBox,
  UserVoteData,
  VotingActive,
  VotingInactive,
} from './proposalActionPrimitives';

import { validate } from '../utils/validation';
import { TX } from '../data/txLegos/contractTX';
import { useRequest } from '../hooks/useRequest';
import { useParams } from 'react-router-dom';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import axios from 'axios';
import StarMaskOnboarding from '@starcoin/starmask-onboarding';
import config from '../utils/getConfig';
import {
  get_access_path,
  get_proposal_state,
  get_with_proof_by_root_raw,
  cast_vote,
  ProposalState,
  get_member_power,
} from '../utils/proposalApi';

const VotingPeriodForChain = ({ proposal, canInteract, isMember }) => {
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
  const { daochain, daoid } = useParams();
  const [daoData, setDaoData] = useState(null);

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

  useEffect(() => {
    if (proposal?.accountVoteSummaries?.length) {
      const accountVoteSummaries = proposal.accountVoteSummaries;

      for (let i = 0; i < accountVoteSummaries.length; i++) {
        const choiceSequenceId = accountVoteSummaries[i].choiceSequenceId;
        const subtotalVotingPower = accountVoteSummaries[i].subtotalVotingPower;

        if (choiceSequenceId === 0) {
          setVoteData({
            ...voteData,
            totalYes: subtotalVotingPower,
            totalYesReadable: `(${subtotalVotingPower})`,
            totalVotes: voteData.totalVotes + subtotalVotingPower,
          });
        }

        if (choiceSequenceId === 1) {
          setVoteData({
            ...voteData,
            totalNo: subtotalVotingPower,
            totalNoReadable: `(${subtotalVotingPower})`,
            totalVotes: voteData.totalVotes + subtotalVotingPower,
          });
        }
      }
    }
  }, [proposal]);

  const [isLoading, setLoading] = useState(false);
  const { submitTransaction } = useTX();
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

  const toast = useToast();
  const { injectedProvider, injectedChain, address } = useInjectedProvider();

  const { data: _activities, loading } = useRequest('accountVotes', {
    method: 'get',
    params: {
      daoId: daoid,
      proposalNumber: +proposal.proposalId.proposalNumber,
      page: 0,
      size: 10,
    },
  });

  const [disabled, setDisabled] = useState(false);

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

  const voteHandler = async sequenceId => {
    const initialStarCoin = () => {
      const currentUrl = new URL(window.location.href);
      const forwarderOrigin =
        currentUrl.hostname === 'localhost'
          ? 'http://localhost:9032'
          : undefined;

      const isStarMaskInstalled = StarMaskOnboarding.isStarMaskInstalled();
      const isStarMaskConnected = !!window?.starcoin?.selectedAddress;
      const accounts = [];

      let onboarding;
      try {
        onboarding = new StarMaskOnboarding({ forwarderOrigin });
      } catch (error) {
        console.error(error);
      }

      let chainInfo = {
        chain: '',
        network: '',
        accounts: '',
      };

      return {
        isStarMaskInstalled,
        isStarMaskConnected,
        accounts,
        onboarding,
        chainInfo,
      };
    };

    const initialData = initialStarCoin();
    const status = () => {
      if (!initialData.isStarMaskInstalled) {
        return 0;
      } else if (initialData.isStarMaskConnected) {
        initialData.onboarding?.stopOnboarding();
        return 2;
      } else {
        return 1;
      }
    };
    const _status = status();
    if (_status === 0) {
      initialData.onboarding.startOnboarding();
    } else if (_status === 2) {
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
        toast({
          title: 'Error',
          description: 'reqeuest error',
          position: 'top-right',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
      }
    } else if (_status === 1) {
      try {
        const newAccounts = await window.starcoin.request({
          method: 'stc_requestAccounts',
        });
        window.location.reload();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [accountPowerTotal, setAccountPowerTotal] = useState(0);
  const [choiceSequenceId, setChoiceSequenceId] = useState(null);

  useEffect(() => {
    if (_activities) {
      _activities.forEach(item => {
        if (item.accountVoteId.accountAddress === address) {
          setDisabled(true);
        }
      });
    }
  }, [_activities, address]);

  const [proposalStatus, setProposalStatus] = useState('UNKNOWN');

  useEffect(() => {
    const loadProposalStatus = async () => {
      const status = await get_proposal_state(
        injectedProvider,
        daoid,
        proposal.id,
      );

      setProposalStatus(status);
    };

    if (injectedProvider && proposal) {
      loadProposalStatus();
    }
  }, [injectedProvider, proposal]);

  const getProposalStatus = () => {
    if (proposalStatus === ProposalState.PENDING) {
      return {
        status: 'PENDING',
        color: 'yellow',
      };
    } else if (proposalStatus === ProposalState.ACTIVE) {
      return {
        status: 'ACTIVE',
        color: 'green',
      };
    } else if (proposalStatus === ProposalState.REJECTED) {
      return {
        status: 'REJECTED',
        color: 'red.500',
      };
    } else if (proposalStatus === ProposalState.DEFEATED) {
      return {
        status: 'DEFEATED',
        color: 'red.500',
      };
    } else if (proposalStatus === ProposalState.AGREED) {
      return {
        status: 'AGREED',
        color: 'green.500',
      };
    } else if (proposalStatus === ProposalState.QUEUED) {
      return {
        status: 'QUEUED',
        color: 'green.500',
      };
    } else if (proposalStatus === ProposalState.EXECUTABLE) {
      return {
        status: 'EXECUTABLE',
        color: 'green.500',
      };
    } else if (proposalStatus === ProposalState.EXTRACTED) {
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

  const getProposalText = () => {
    if (proposalStatus === ProposalState.PENDING) {
      return `will start ${getStartTime()}`;
    } else if (proposalStatus === ProposalState.QUEUED) {
      return `can be executed ${getEtaTime()}`;
    }

    return `ended ${getEndTime()}`;
  };

  return (
    <PropActionBox>
      <Skeleton isLoaded={proposalStatus !== 'UNKNOWN'}>
        <TopStatusBox
          status={getProposalStatus().status}
          appendStatusText={getProposalText()}
          circleColor={getProposalStatus().color}
          proposal={proposal}
          voteData={voteData}
          quorum
        />
      </Skeleton>
      {voteData?.hasVoted ? (
        <>
          <MiddleActionBox>
            <VotingInactive voteData={voteData} />
          </MiddleActionBox>
          <UserVoteData voteData={voteData} />
        </>
      ) : (
        <>
          <MiddleActionBox>
            <VotingActive
              voteYes={voteHandler}
              voteNo={voteHandler}
              loadingAll={isLoading}
              disableAll={disabled}
              proposal={proposal}
              voteData={voteData}
              daoData={daoData}
            />
          </MiddleActionBox>
          {/* <ParaSm fontStyle='italic'> Vote if you&apos;re a member</ParaSm> */}
        </>
      )}
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
        <AlertDialogContent background='#000'>
          <AlertDialogHeader>Confirm Vote</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
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
    </PropActionBox>
  );
};

export default VotingPeriodForChain;
