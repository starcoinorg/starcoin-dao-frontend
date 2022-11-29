import React, { useState } from 'react';
import { Flex, Text, Stack, Button, HStack } from '@chakra-ui/react';
import { utils, bcs } from '@starcoin/starcoin';
import { hexlify } from '@ethersproject/bytes';
import ContentBox from './ContentBox';
import { nodeUrlMap } from '../utils/consts';

const OfferCard = ({
  tokens,
  profile,
  provider,
  daoType,
  offer,
  hasBalance,
  needsSync,
}) => {
  const hasAction = hasBalance || needsSync;

  const [loading, setLoading] = useState(false);

  const acceptOffer = async () => {
    setLoading(true);
    try {
      const functionId = '0x1::DAOSpace::accept_member_offer_entry';
      const tyArgs = [daoType];
      const args = [];

      const nodeUrl = nodeUrlMap[window.starcoin.networkVersion];
      console.log('nodeUrl:', nodeUrl);

      const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(
        functionId,
        tyArgs,
        args,
        nodeUrl,
      );

      // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
      const payloadInHex = (function() {
        const se = new bcs.BcsSerializer();
        scriptFunction.serialize(se);
        return hexlify(se.getBytes());
      })();
      const txParams = {
        data: payloadInHex,
        expiredSecs: 10,
      };

      await provider.getSigner().sendUncheckedTransaction(txParams);
    } catch (error) {
      console.log('doAccecptOffer error:', error);
    }
    setLoading(false);
  };

  return (
    <ContentBox mt={6}>
      <Stack spacing={4}>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>Init SBT:</Text>
          <Text variant='value'>{offer.init_sbt}</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>Invite time:</Text>
          <Text variant='value'>{offer.time_lock}</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Button
            margin='0 auto'
            size='sm'
            isLoading={loading}
            colorScheme='blue'
            onClick={acceptOffer}
          >
            Accept Offer
          </Button>
        </Flex>
      </Stack>
    </ContentBox>
  );
};

export default OfferCard;
