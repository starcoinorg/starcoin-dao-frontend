import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

import {
  MiddleActionBox,
  PropActionBox,
  TopStatusBox,
  UserVoteData,
  VotingInactive,
} from './proposalActionPrimitives';
import { validate } from '../utils/validation';

const GracePeriod = ({ proposal }) => {
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
    if (proposal.accountVoteSummaries.length) {
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

  const getTime = () => {
    if (validate.number(Number(proposal?.votingPeriodEnd))) {
      return formatDistanceToNow(new Date(Number(proposal?.votingPeriodEnd)), {
        addSuffix: true,
      });
    }
    return '--';
  };

  return (
    <PropActionBox>
      <TopStatusBox
        status='Grace Period'
        appendStatusText={`ends ${getTime()}`}
        circleColor={voteData.isPassing ? 'green' : 'red'}
        proposal={proposal}
        voteData={voteData}
        quorum
      />
      <MiddleActionBox>
        <VotingInactive voteData={voteData} />
      </MiddleActionBox>
      {voteData.hasVoted && <UserVoteData voteData={voteData} />}
    </PropActionBox>
  );
};
export default GracePeriod;
