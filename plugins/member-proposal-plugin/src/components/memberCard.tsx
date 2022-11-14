import React, { useEffect, useState } from 'react';
import { Box, Flex, Button, HStack, Stack, Link, Text } from '@chakra-ui/react';
import ContentBox from './contentBox';
import { getMemberNFT } from '../utils/memberPluginAPI';

const MemberCard = ({ daoId }) => {
  const [NFT, setNFT] = useState(null);
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
    const getMyMemberNFT = async () => {
      try {
        const nft = await getMemberNFT(daoId, address);
        console.log('member nft', nft);

        setNFT(nft);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    getMyMemberNFT();
  }, [daoId, address]);

  return (
    <ContentBox>
      <Stack spacing={4}>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>Address:</Text>
          <Text variant='value'>{address}</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>Is Member:</Text>
          <Text variant='value'>{NFT ? 'YES' : 'NO'}</Text>
        </Flex>
        <Flex as={HStack} spacing={2} align='center'>
          <Text>SBT:</Text>
          <Text variant='value'>{NFT ? NFT.init_sbt : 0}</Text>
        </Flex>
      </Stack>
    </ContentBox>
  );
};

export default MemberCard;