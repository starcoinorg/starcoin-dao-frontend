import React, { useEffect, useState } from 'react';
import { Flex, Spinner, Button, HStack, Stack, Link } from '@chakra-ui/react';

import { useSubAppContext } from '../contexts/SubAppContext';
import MyMemberInviteCard from './myMemberInviteCard';
import { listUserOffers, doAccecptOffer } from '../utils/memberPluginAPI';

const MyMemberInviteList = ({ daoId }) => {
  const { walletAddress } = useSubAppContext();
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMyOffers = async () => {
      try {
        const offers = await listUserOffers(daoId, walletAddress);
        setMyOffers(offers);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    getMyOffers();
  }, [daoId, walletAddress]);

  const handleAccecptOffer = async (_, offer) => {
    console.log('accepting offer', offer);
    await doAccecptOffer(daoId);
  };

  return (
    <Flex as={Stack} direction='column' spacing={4} w='100%'>
      {!loading ? (
        Object.keys(myOffers).length > 0 ? (
          Object.values(myOffers)
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
            No Invites Here Yet.
          </Flex>
        )
      ) : (
        <Spinner size='xl' />
      )}
    </Flex>
  );
};

export default MyMemberInviteList;