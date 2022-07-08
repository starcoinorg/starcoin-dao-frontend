import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Flex,
  SimpleGrid,
  Text,
  HStack,
} from '@chakra-ui/react';

import ContentBox from './ContentBox';
import TextBox from './TextBox';

import MCAvatar from '../assets/img/metacartel__avatar.jpg';
import LexAvatar from '../assets/img/lex__avatar.png';
import MGDAvatar from '../assets/img/mgd__avatar.jpg';
import VenturesAvatar from '../assets/img/ventures__avatar.jpg';
import RaidAvatar from '../assets/img/raidguild__avatar.png';

const featuredDaoList = [
  {
    address: 'starswap_dao',
    network: '0x1',
    name: 'Starswap DAO',
    description: 'Starswap DAO',
    badges: ['DEX', 'AMM', 'Starcoin', 'STC', 'swap', 'dao'],
  },
  {
    address: 'test_dao_id',
    network: '0x1',
    name: 'test_dao_id',
    description: 'test_dao_id',
    badges: ['Starcoin', 'STC', 'swap', 'dao'],
  },
];

const FeaturedDaos = () => (
  <>
    <Flex justify='space-between'>
      <TextBox mb={6}>Featured DAOs</TextBox>
      <TextBox as={RouterLink} to='/explore' color='secondary.500'>
        Explore
      </TextBox>
    </Flex>
    <SimpleGrid minChildWidth='200px' spacing={3}>
      {featuredDaoList.map(dao => (
        <ContentBox
          _hover={{ transform: 'scale(1.05)' }}
          direction='column'
          as={RouterLink}
          to={`/dao/${dao.network}/${dao.address}`}
          justify='start'
          align='center'
          key={dao.name}
        >
          <Avatar src={dao.image} alt='' />
          <Text>{dao.name}</Text>
          <Text fontSize='xs'>{dao.description}</Text>
          <HStack mt={2} justify='center'>
            <Badge variant='outline' colorScheme='secondary' textAlign='center'>
              {dao.badges[0]}
            </Badge>
            <Badge variant='outline' colorScheme='primary' textAlign='center'>
              {dao.badges[1]}
            </Badge>
          </HStack>
        </ContentBox>
      ))}
    </SimpleGrid>
  </>
);

export default FeaturedDaos;
