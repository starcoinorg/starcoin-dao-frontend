import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, Flex, Button, Badge, Link, Text } from '@chakra-ui/react';
import makeBlockie from 'ethereum-blockies-base64';

import { ExploreContext } from '../contexts/ExploreContext';
import ContentBox from './ContentBox';
import { chainByNetworkId } from '../utils/chain';
import { numberWithCommas } from '../utils/general';
import { pokemolUrlExplore, themeImagePath } from '../utils/metadata';

const ExploreCard = ({ dao }) => {
  const { state, dispatch } = useContext(ExploreContext);
  const [daoData, setDaoData] = useState({});

  useEffect(() => {
    let _dao = {
      meta: {
        tags: dao?.tags?.split(',') || '',
        avatarImg: dao?.logoUrl || '',
        description: dao?.description || '',
        network: 'MAIN',
        name: dao?.name || '',
      },
      id: dao?.daoId || '',
    };

    setDaoData(_dao);
  }, [dao]);

  const handleTagSelect = tag => {
    if (!state.tags.includes(tag)) {
      const tagUpdate = [...state.tags, tag];
      dispatch({ type: 'updateTags', payload: tagUpdate });
    }
  };

  const renderTags = () => {
    if (daoData.meta?.moreTags) {
      return (
        <Flex direction='row' wrap='wrap'>
          {daoData.meta.tags.map(tag => {
            return (
              <Badge
                key={tag}
                onClick={() => handleTagSelect(tag)}
                colorScheme='secondary.500'
                variant='outline'
                fontSize='9px'
                _notLast={{ marginRight: '3px' }}
                mt={1}
                _hover={{
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                {tag}
              </Badge>
            );
          })}
        </Flex>
      );
    }
    return null;
  };

  return (
    <ContentBox
      as={daoData?.meta?.version === '1' ? Link : RouterLink}
      to={daoData?.meta?.version === '1' ? null : `/dao/0x1/${daoData.id}`}
      href={daoData?.meta?.version === '1' ? pokemolUrlExplore(daoData) : null}
      w={['100%', '100%', '100%', '340px', '340px']}
      h='340px'
      mt={5}
      style={{ transition: 'all .15s linear' }}
      _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
    >
      <Flex direction='row' align='center' w='100%'>
        <Avatar
          src={
            daoData.meta?.avatarImg
              ? themeImagePath(daoData.meta.avatarImg)
              : null
          }
          mr='10px'
          bg='primary'
        />
        <Box
          fontSize='xl'
          fontWeight={300}
          fontFamily='heading'
          lineHeight='1.125'
        >
          {daoData.meta?.name}
        </Box>
      </Flex>
      <Text
        fontSize='md'
        color='whiteAlpha.800'
        h='80px'
        my={3}
        style={{
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {daoData.meta?.description}
      </Text>

      <Box fontSize='md' mt={2} fontFamily='heading'>
        {/* ${numberWithCommas(dao.guildBankValue.toFixed(2))} */}
      </Box>
      <Flex direction='row' align='center'>
        <Box fontSize='sm' mr={3}>
          {daoData?.members
            ? `${
                daoData.members.length === 100
                  ? `${daoData.members.length}+`
                  : `${daoData.members.length}`
              }
          Members`
            : null}
        </Box>
        <Box fontSize='sm' mr={3}>
          |
        </Box>
        <Box fontSize='sm'>
          {daoData?.tokens?.length} Token
          {daoData?.tokens?.length > 1 && 's'}
        </Box>
      </Flex>
      <Flex direction='row' align='center' mt={3}>
        <Badge colorScheme='secondary' variant='outline' m='3px 5px 3px 0px'>
          {daoData.meta?.purpose}
        </Badge>
        <Badge colorScheme='primary' variant='outline' m='3px 5px 3px 0px'>
          {daoData.meta?.network}
        </Badge>
      </Flex>

      {renderTags()}
      <Flex justify='flex-end' w='100%'>
        <Box mt={5}>
          <Button minWidth='80px' variant='outline'>
            Go
          </Button>
        </Box>
      </Flex>
    </ContentBox>
  );
};

export default ExploreCard;
