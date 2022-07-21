import React, { useState, useEffect } from 'react';

import ActivityCard from './activityCard';
import Paginator from './paginator';
import TextBox from './TextBox';
import { useParams } from 'react-router-dom';
import { useRequest } from '../hooks/useRequest';

const ActivitiesFeed = ({
  activities,
  hydrateFn,
  limit,
  heading = 'Activities',
  isLink,
  daoProposals,
  proposal,
}) => {
  const [allActivities, setAllActivities] = useState(null);
  const [pagedActivities, setPagedActivities] = useState(null);
  const { daochain, daoid, propid } = useParams();

  const { data: _activities, loading } = useRequest('accountVotes', {
    method: 'get',
    params: {
      daoId: daoid,
      proposalNumber: propid,
      page: 0,
      size: 1000,
    },
  });

  useEffect(() => {
    if (_activities) {
      setAllActivities(_activities);
    }
  }, [_activities]);

  return (
    <>
      <TextBox>{heading}</TextBox>
      {pagedActivities
        ? pagedActivities.map((activity, index) => {
            activity.memberAddress = activity.accountVoteId.accountAddress;
            return (
              <ActivityCard
                key={`${activity.id}-${index}`}
                activity={activity}
                displayAvatar
                isLink={isLink}
                daoProposals={daoProposals}
                proposal={proposal}
              />
            );
          })
        : null}
      {!_activities?.length ? (
        <TextBox variant='value'>Not much happening yet</TextBox>
      ) : null}
      <Paginator
        perPage={limit}
        setRecords={setPagedActivities}
        allRecords={_activities}
      />
    </>
  );
};

export default ActivitiesFeed;
