import React from 'react';

import VotingPeriod from './votingPeriod';
import InQueue from './inQueue';
import Unsponsored from './unsponsored';
import ReadyForProcessing from './readyForProcessing';
import GracePeriod from './gracePeriod';
import Processed from './processed';
import Cancelled from './cancelled';

import { ProposalStatus } from '../utils/proposalUtils';
// export const ProposalStatus = {
//   Unknown: 'Unknown',
//   InQueue: 'InQueue',
//   VotingPeriod: 'VotingPeriod',
//   GracePeriod: 'GracePeriod',
//   Cancelled: 'Cancelled',
//   Passed: 'Passed',
//   Failed: 'Failed',
//   ReadyForProcessing: 'ReadyForProcessing',
//   Unsponsored: 'Unsponsored',
// };

const PropActions = props => {
  // if (!props.proposal.votingPeriodStart) {
  //   return <Unsponsored {...props} />;
  // }
  // if (status === ProposalStatus.Cancelled) {
  //   return <Cancelled {...props} />;
  // }
  const nowDate = Date.now();
  const votingPeriodEnd = props.proposal.votingPeriodEnd;
  if (votingPeriodEnd > Date.now()) {
    return <VotingPeriod {...props} />;
  }
  // if (status === ProposalStatus.InQueue) {
  //   return <InQueue {...props} />;
  // }

  // if (
  //   props.proposal.accountVoteSummaries.length &&
  //   props.proposal.votingPeriodEnd < nowDate
  // ) {
  //   return <Processed {...props} />;
  // }
  // if (status === ProposalStatus.ReadyForProcessing) {
  //   return <ReadyForProcessing {...props} />;
  // }

  // if (
  //   status === ProposalStatus.Passed ||
  //   status === ProposalStatus.Failed ||
  //   status === ProposalStatus.NeedsExecution
  // ) {
  //   return <Processed {...props} />;
  // }
  // return <VotingPeriod {...props} />;

  return <VotingPeriod {...props} />;
};

export default PropActions;
