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
  const { daochain, daoid } = useParams();
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

  useEffect(() => {
    if (_activities) {
      _activities.forEach(item => {
        if (item.accountVoteId.accountAddress === address) {
          setDisabled(true);
        }
      });
    }
  }, [_activities]);

  const url_prev =
    'http://k8s-default-daoapiin-a10a2591c6-298563096.ap-northeast-1.elb.amazonaws.com/dev/v1/getVotingPower';
  const castVoteUrl =
    'http://k8s-default-daoapiin-a10a2591c6-298563096.ap-northeast-1.elb.amazonaws.com/dev/v1/castVote';

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

      setTimeout(() => {
        setLoading(false);
        window.location.reload();
      }, 3000);
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

  const voteNo = async () => {
    setLoading(true);
    const accountPowerData = await getPower();
    setAccountPowerTotal(+accountPowerData.totalVotingPower);
    setChoiceSequenceId(2);
    onOpen();
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const [accountPowerTotal, setAccountPowerTotal] = useState(0);
  const [choiceSequenceId, setChoiceSequenceId] = useState(null);

  return (
    <PropActionBox>
      <TopStatusBox
        status='Voting'
        appendStatusText={`ends ${getTime()}`}
        // circleColor={voteData.isPassing ? 'green' : 'red'}
        circleColor={'green'}
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
              voteYes={voteYes}
              voteNo={voteNo}
              loadingAll={isLoading}
              disableAll={disabled}
              proposal={proposal}
              voteData={voteData}
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
            You have <i>{accountPowerTotal}</i> voting rights, All votes can be
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
