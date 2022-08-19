import React from 'react';
import { Box, Button, Flex, Progress, Text } from '@chakra-ui/react';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';

import { ParaSm } from '../components/typography';
import ExecuteQuorum from './executeQuorum';
import { useRequest } from '../hooks/useRequest';

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

export const StatusCircle = ({ color }) => (
  <Box borderRadius='50%' background={color} h='.6rem' w='.6rem' mr='2' />
);
export const VoteButton = props => {
  const { voteslabel, votes, optionsdata } = props;

  return (
    <Flex
      style={{
        cursor: 'pointer',
        marginBottom: '0.625rem',
      }}
      justifyContent='center'
      alignItems='center'
    >
      <Text fontSize={'0.88rem'} flex={'1'}>
        {`${optionsdata.title}（${optionsdata.subtotalVotingPower}）`}
      </Text>
      <Button size='sm' minW='4rem' {...props}>
        {`Vote`}
      </Button>
    </Flex>
  );
};

export const InactiveButton = props =>
  props.shade === 'highlight' ? (
    <Button
      size='sm'
      minW='4rem'
      variant='outline'
      cursor='not-allowed'
      disabled
      _disabled={{
        color: 'whiteAlpha.800',
        borderColor: 'whiteAlpha.500',
      }}
      _hover={{
        color: 'whiteAlpha.900',
        borderColor: 'whiteAlpha.900',
      }}
      {...props}
    />
  ) : (
    <Button
      size='sm'
      minW='4rem'
      variant='outline'
      cursor='not-allowed'
      disabled
      _disabled={{
        color: 'whiteAlpha.600',
        borderColor: 'whiteAlpha.200',
      }}
      _hover={{
        color: 'whiteAlpha.600',
        borderColor: 'whiteAlpha.600',
      }}
      {...props}
    />
  );

export const AbstainButton = props => (
  <Button
    size='sm'
    minW='4rem'
    color='secondary.500'
    variant='outline'
    {...props}
  >
    Abstain
  </Button>
);

export const PropActionBox = ({ children }) => (
  <Box px='1.2rem' py='0.6rem' w='100%'>
    {children}
  </Box>
);

export const StatusDisplayBox = ({ children }) => (
  <Flex alignItems='center' position='relative'>
    {children}
  </Flex>
);

export const TopStatusBox = ({
  status,
  proposal,
  voteData,
  helperText,
  circleColor,
  quorum,
  appendStatusText,
}) => {
  return (
    <Box mb='4'>
      <Flex
        alignItems='center'
        justifyContent='space-between'
        mb={3}
        height='1.2rem'
      >
        <StatusDisplayBox>
          <StatusCircle color={circleColor} />
          <ParaSm fontWeight='700' mr='1'>
            {status}
          </ParaSm>
          {appendStatusText && (
            <ParaSm fontStyle='italic'>{appendStatusText}</ParaSm>
          )}
        </StatusDisplayBox>
        {quorum && <ExecuteQuorum proposal={proposal} voteData={voteData} />}
      </Flex>
      {helperText && <ParaSm>{helperText}</ParaSm>}
    </Box>
  );
};

export const MiddleActionBox = ({ children }) => <Box mb={4}>{children}</Box>;

export const UserVoteData = ({ voteData = {} }) => {
  const { userNo, userNoReadable, userYes, userYesReadable } = voteData;
  return (
    <>
      {(userNo || userYes) && (
        <Flex alignItems='center' minHeight='2rem'>
          <ParaSm fontStyle='italic'>
            You voted {userNo > 0 && `No ${userNoReadable}`}
            {userYes > 0 && `Yes ${userYesReadable}`}
          </ParaSm>
        </Flex>
      )}
    </>
  );
};

export const VotingBar = ({ voteData = {}, proposal = {} }) => {
  const { totalVotes, totalYes } = voteData;
  const getNow = Date.now();

  let barPercentage =
    ((getNow - proposal.votingPeriodStart) /
      (proposal.votingPeriodEnd - proposal.votingPeriodStart)) *
    100;

  if (getNow < proposal.votingPeriodStart) {
    barPercentage = 0;
  }

  const getBgColor = () => {
    if (proposal?.status) {
      if (proposal.status === 'PASSED') {
        return 'green';
      } else if (proposal.status === 'FAILED') {
        return 'red';
      } else if (proposal.status === 'UNKNOWN') {
        return 'green';
      }
    }

    return 'chakraProgressBarHack';
  };

  return (
    <Progress
      value={barPercentage || 0}
      mb='4'
      mt='4'
      size='sm'
      colorScheme={getBgColor()}
    />
  );
};

export const VotingActive = ({
  voteYes,
  voteNo,
  disableAll,
  loadingAll,
  proposal,
  voteData,
  daoData,
}) => {
  let isLoading = false;
  if (daoData) {
    let { data: _proposals, loading } = useRequest(
      `proposals/${daoData.daoId}%2C${proposal.proposalId.proposalNumber}`,
      {
        method: 'get',
        param: {
          page: 1,
          pageSize: 1,
        },
      },
    );

    if (_proposals) {
      proposal = _proposals;
      isLoading = !loading;
    }
  }

  const voteOptions = getVoteOptionData(
    proposal.proposalVotingChoices,
    proposal.accountVoteSummaries,
  );
  const getNow = Date.now();
  return isLoading ? (
    <>
      <VotingBar voteData={voteData} proposal={proposal} />
      <Text fontSize={'1.25rem'}>Vote Options:</Text>
      <Flex flexDirection='column'>
        {voteOptions.map((item, index) => (
          <VoteButton
            key={index}
            votes={item.title}
            sequenceid={item.sequenceId}
            onClick={() => voteNo(item.sequenceId)}
            optionsdata={item}
            isDisabled={
              disableAll ||
              getNow >= proposal.votingPeriodEnd ||
              getNow < proposal.votingPeriodStart
            }
            isLoading={loadingAll}
            voteslabel={voteData.totalNoReadable}
          />
        ))}
      </Flex>
    </>
  ) : (
    <span>loading...</span>
  );
};

export const VotingInactive = props => {
  const { voteData, proposal } = props;
  const { totalYesReadable, totalNoReadable, isPassing, isFailing } = voteData;
  return (
    <>
      <VotingBar voteData={voteData} proposal={proposal} />
      <Flex justifyContent='space-between'>
        <InactiveButton
          leftIcon={isFailing && <AiOutlineClose />}
          shade={isFailing ? 'highlight' : undefined} // chakra wants this
        >
          No {totalNoReadable}
        </InactiveButton>
        <InactiveButton
          leftIcon={isPassing && <AiOutlineCheck />}
          shade={isPassing ? 'highlight' : undefined} // chakra wants this
        >
          Yes {totalYesReadable}
        </InactiveButton>
      </Flex>
    </>
  );
};

export const EarlyExecuteButton = () => {
  return <Button size='sm'>Early Execute</Button>;
};
