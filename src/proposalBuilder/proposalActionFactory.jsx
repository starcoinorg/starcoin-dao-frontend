import React from 'react';
import { useParams } from 'react-router-dom';
import VotingPeriod from './votingPeriod';
import VotingPeriodForChain from './votingPeriodForChain';
import { isChainDAO } from '../utils/dao';

const PropActions = props => {
  const { _, daoid } = useParams();

  if (isChainDAO(daoid)) {
    return <VotingPeriodForChain {...props} />;
  } else {
    return <VotingPeriod {...props} />;
  }
};

export default PropActions;
