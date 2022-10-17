import React, { useEffect, useState } from 'react';
import { Flex, Spinner, Button, HStack, Stack, Link } from '@chakra-ui/react';

import MyMemberInviteCard from './myMemberInviteCard';
import { listOffers, doAccecptOffer } from '../utils/memberPluginAPI';

const MyMemberInviteList = ({ daoId }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMyOffers = async () => {
      try {
        const offers = await listOffers(daoId);
        setOffers(offers);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    getMyOffers();
  }, [daoId]);

  const handleAccecptOffer = async (_, offer) => {
    console.log('accepting offer', offer);
    await doAccecptOffer(daoId);
  };

  return (
    <Flex as={Stack} direction='column' spacing={4} w='100%'>
      {!loading ? (
        Object.keys(offers).length > 0 ? (
          Object.values(offers)
            .slice(0, 10)
            .map(offer => (
              <MyMemberInviteCard
                offer={offer}
                onAcceptOffer={event =>
                  handleAccecptOffer(event, offer)
                }
              />
            ))
        ) : (
          <Flex mt='100px' w='100%' justify='center'>
            No checkpoints Found.
          </Flex>
        )
      ) : (
        <Spinner size='xl' />
      )}
    </Flex>
  );
};

export default MyMemberInviteList;