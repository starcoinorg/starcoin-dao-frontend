import React, { useEffect, useState } from 'react';
import { Flex, Spinner, Button, HStack, Stack, Link } from '@chakra-ui/react';

import MyMemberInviteCard from './myMemberInviteCard';
import { listAllOffers, doAccecptOffer } from '../utils/memberPluginAPI';

const MyMemberInviteList = ({ daoId }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');

  useEffect(() => {
    const getAddress = async () => {
      const newAccounts = await window.starcoin.request({
        method: 'stc_requestAccounts',
      });
      setAddress(newAccounts[0]);
    };

    getAddress();
  }, [daoId]);

  useEffect(() => {
    const getMyOffers = async () => {
      try {
        const offers = await listAllOffers(daoId, address);
        setOffers(offers);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    getMyOffers();
  }, [daoId, address]);

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
                key={offer.for_user}
                offer={offer}
                onAcceptOffer={event =>
                  handleAccecptOffer(event, offer)
                }
              />
            ))
        ) : (
          <Flex mt='100px' w='100%' justify='center'>
            No Offer.
          </Flex>
        )
      ) : (
        <Spinner size='xl' />
      )}
    </Flex>
  );
};

export default MyMemberInviteList;