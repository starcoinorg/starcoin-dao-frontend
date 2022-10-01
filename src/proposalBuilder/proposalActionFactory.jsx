import React from 'react';
import { useParams } from 'react-router-dom';
import VotingPeriod from './votingPeriod';
import VotingPeriodForChain from './votingPeriodForChain';

const PropActions = props => {
  const { _, daoid } = useParams();

  let isChainDao = false;
  if (daoid && daoid.startsWith('0x')) {
    isChainDao = true;
  }

  if (isChainDao) {
    return <VotingPeriodForChain {...props} />;
  } else {
    return <VotingPeriod {...props} />;
  }
};

export default PropActions;
