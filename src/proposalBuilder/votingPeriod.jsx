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

const VotingPeriod = ({ proposal, canInteract, isMember }) => {
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

  const { data: dao } = useRequest(`daos/${proposal?.proposalId?.daoId || ''}`);
  useEffect(() => {
    if (dao) {
      setDaoData(dao);
    }
  }, [dao]);

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
  const getTime = () => {
    if (validate.number(Number(proposal?.votingPeriodStart))) {
      return formatDistanceToNow(new Date(Number(proposal?.votingPeriodEnd)), {
        addSuffix: true,
      });
    }
    return '--';
  };

  const toast = useToast();
  const { requestWallet, address } = useInjectedProvider();

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

  const url_prev = `${config.api}/getVotingPower`;
  const castVoteUrl = `${config.api}/castVote`;

  const getPower = async () => {
    const response = await axios(url_prev, {
      method: 'get',
      params: {
        accountAddress: address,
        daoId: proposal.proposalId.daoId,
        proposalNumber: +proposal.proposalId.proposalNumber,
      },
    });

    return response.data;
  };

  const signHandle = async choiceSequenceId => {
    const message = JSON.stringify({
      daoId: proposal.proposalId.daoId,
      proposalNumber: +proposal.proposalId.proposalNumber,
      accountAddress: address,
      votingPower: accountPowerTotal,
      choiceSequenceId,
    });

    const msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`;
    const networkId = `1`;
    const extraParams = { networkId };
    const getSign = async () => {
      const sign = await window.starcoin.request({
        method: 'personal_sign',
        params: [msg, address, extraParams],
      });

      return sign;
    };

    const sign = await getSign();

    try {
      const ret = await axios.post(castVoteUrl, {
        signedMessageHex: sign,
      });

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

  const voteYes = async () => {
    setLoading(true);
    const accountPowerData = await getPower();
    setAccountPowerTotal(+accountPowerData.totalVotingPower);
    setChoiceSequenceId(1);
    onOpen();
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
      if (window.starcoin.networkVersion !== '1') {
        toast({
          title: 'Error',
          description: 'Please switch to the mainnet',
          position: 'top-right',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setLoading(true);
      try {
        const accountPowerData = await getPower();
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

  const getProposalStatus = () => {
    if (proposal?.status) {
      if (proposal.status === 'PASSED') {
        return {
          status: 'Passed',
          color: 'green',
        };
      } else if (proposal.status === 'FAILED') {
        return {
          status: 'Failed',
          color: 'red.500',
        };
      } else if (proposal.status === 'UNKNOWN') {
        return {
          status: 'Passed',
          color: 'green.500',
        };
      }
    }

    return {
      status: 'Voting',
      color: '#EB8A23',
    };
  };

  return (
    <PropActionBox>
      <TopStatusBox
        status={getProposalStatus().status}
        appendStatusText={`ended ${getTime()}`}
        // circleColor={voteData.isPassing ? 'green' : 'red'}
        circleColor={getProposalStatus().color}
        proposal={proposal}
        voteData={voteData}
        quorum
      />
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
    </PropActionBox>
  );
};
export default VotingPeriod;
