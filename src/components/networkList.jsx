import React, { useEffect, useState } from 'react';
import { BsFillCircleFill } from 'react-icons/bs';
import { Link as RouterLink } from 'react-router-dom';
import { Flex, Icon, Input, Box, Text } from '@chakra-ui/react';

import { useUser } from '../contexts/UserContext';
import ContentBox from './ContentBox';
import NetworkDaoList from './networkDaoList';
import TextBox from './TextBox';

const NetworkList = () => {
  const { userHubDaos } = useUser();
  const [searchTerm, setSearchTerm] = useState();
  const [sortedDaos, setSortedDaos] = useState({});

  useEffect(() => {
    const networkDaos = userHubDaos.sort((a, b) => {
      return a.hubSortOrder - b.hubSortOrder;
    });
    const count = userHubDaos.reduce((sum, network) => {
      sum += network.data.length;
      return sum;
    }, 0);
    setSortedDaos({ networkDaos, count });
  }, [userHubDaos]);

  const handleChange = event => {
    setSearchTerm(event.target.value);
  };

  return (
    <ContentBox p={6} mt={6} maxW='600px'>
      {sortedDaos.count ? (
        <Flex justify='space-between' alignItems='center' mb={6}>
          <TextBox size='xs'>
            {`Member of ${sortedDaos.count || 0} DAO`}
            {sortedDaos.count > 1 && 's'}
          </TextBox>
          <Input
            type='search'
            className='input'
            placeholder='Search My Daos'
            maxW={300}
            onChange={e => handleChange(e)}
          />
        </Flex>
      ) : (
        <>
          <TextBox size='sm'>Welcome to DAOSPACE</TextBox>
          <Text fontSize='md' mb={5} mt={7}>
            Your new Hub for all Moloch DAO activity
          </Text>
          <Box fontSize='md' mb={5}>
            🔥 Interact with DAOs or Summon a new one
          </Box>
          <Box fontSize='md' mb={5}>
            🚨 Get activity feeds from all your DAOs
          </Box>
          <Box fontSize='md' mb={5}>
            🌊️️️ Easily switch between your DAOs
          </Box>
          <TextBox as={RouterLink} to='/explore'>
            Explore DAOs
          </TextBox>
        </>
      )}
      {sortedDaos.networkDaos?.length > 0 && (
        <>
          {sortedDaos.networkDaos.map((network, i) => {
            if (network.data.length) {
              return (
                <NetworkDaoList
                  data={network.data}
                  network={network}
                  searchTerm={searchTerm}
                  key={network.network_id}
                  index={i}
                />
              );
            }
            return null;
          })}
        </>
      )}
    </ContentBox>
  );
};

export default NetworkList;
