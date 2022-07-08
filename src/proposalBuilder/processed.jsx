import React, { useState, useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { AiOutlineCheck } from 'react-icons/ai';

import {
  InactiveButton,
  MiddleActionBox,
  PropActionBox,
  TopStatusBox,
  UserVoteData,
  VotingInactive,
} from './proposalActionPrimitives';
import MinionExexcuteFactory from './minionExexcuteFactory';
import { ParaSm } from '../components/typography';
import { isMinionProposalType } from '../utils/proposalUtils';

const Processed = props => {
  const { proposal } = props;

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

  if (!isMinionProposalType(proposal)) {
    return (
      <PropActionBox>
        <TopStatusBox
          status={
            +voteData?.totalYes > +voteData?.totalNo ? 'Passed' : 'Failed'
          }
          appendStatusText='and processed'
          circleColor={
            +voteData?.totalYes > +voteData?.totalNo ? 'green' : 'red'
          }
        />
        {voteData?.votePassedProcessFailed && (
          <ParaSm>The vote passed but process function failed</ParaSm>
        )}
        <MiddleActionBox>
          <VotingInactive
            {...props}
            justifyContent='space-between'
            voteData={voteData}
          />
        </MiddleActionBox>
        <Flex alignItems='center'>
          <UserVoteData voteData={voteData} />
          <Flex ml='auto'>
            <InactiveButton size='sm' leftIcon={<AiOutlineCheck />}>
              Processed
            </InactiveButton>
          </Flex>
        </Flex>
      </PropActionBox>
    );
  }
  return (
    <PropActionBox>
      <TopStatusBox
        status={
          voteData?.isPassing && !voteData?.votePassedProcessFailed
            ? 'Passed'
            : 'Failed'
        }
        appendStatusText={
          !voteData?.votePassedProcessFailed &&
          `and ${proposal?.executed ? 'minion executed' : 'needs execution'}`
        }
        circleColor={
          voteData?.isPassing && !voteData?.votePassedProcessFailed
            ? 'green'
            : 'red'
        }
        quorum
        voteData={voteData}
        proposal={proposal}
      />
      {voteData?.votePassedProcessFailed && (
        <ParaSm>The vote passed but failed to process</ParaSm>
      )}
      <MiddleActionBox>
        <VotingInactive
          {...props}
          justifyContent='space-between'
          voteData={voteData}
        />
      </MiddleActionBox>
      <Flex alignItems='center'>
        <UserVoteData voteData={voteData} />
        <Flex ml='auto'>
          {voteData.isPassing && !voteData?.votePassedProcessFailed && (
            <MinionExexcuteFactory {...props} />
          )}
        </Flex>
      </Flex>
    </PropActionBox>
  );
};
export default Processed;
