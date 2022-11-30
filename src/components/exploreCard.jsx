import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, Flex, Button, Badge, Link, Text } from '@chakra-ui/react';
import makeBlockie from 'ethereum-blockies-base64';

import { ExploreContext } from '../contexts/ExploreContext';
import ContentBox from './ContentBox';
import { chainByNetworkId } from '../utils/chain';
import { numberWithCommas } from '../utils/general';
import { getDaoNFTImage } from '../utils/dao';
import { pokemolUrlExplore, themeImagePath } from '../utils/metadata';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';

const ExploreCard = ({ dao }) => {
  const { injectedProvider, injectedChain, network } = useInjectedProvider();
  const { state, dispatch } = useContext(ExploreContext);
  const [daoData, setDaoData] = useState({});
  const [avatarImg, setAvatarImg] = useState(null);

  useEffect(() => {
    const loadDaoInfo = async () => {
      let _dao = {
        meta: {
          tags: dao?.tags?.split(',') || null,
          description: dao?.description || '',
          network: network,
          chainID: injectedChain?.chainId || '',
          name: dao?.name || '',
        },
        id: dao?.daoId || '',
      };
      setDaoData(_dao);

      try {
        const avatarImg = await getDaoNFTImage(injectedProvider, dao.daoId);
        setAvatarImg(avatarImg);
      } catch (e) {
        console.log('Error loading NFT image', e);
      }
    };

    loadDaoInfo();
  }, [dao]);

  const handleTagSelect = tag => {
    if (!state.tags.includes(tag)) {
      const tagUpdate = [...state.tags, tag];
      dispatch({ type: 'updateTags', payload: tagUpdate });
    }
  };

  const renderTags = () => {
    if (daoData.meta?.tags) {
      return (
        <Flex direction='row' justify='flex-start' wrap='wrap'>
          {daoData.meta.tags.map(tag => {
            return (
              <Badge
                key={tag}
                onClick={() => handleTagSelect(tag)}
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
      to={
        daoData?.meta?.version === '1'
          ? null
          : `/dao/${daoData?.meta?.chainID}/${daoData.id}`
      }
      href={daoData?.meta?.version === '1' ? pokemolUrlExplore(daoData) : null}
      w={['100%', '100%', '100%', '340px', '340px']}
      h='230px'
      mt={5}
      mr={5}
      style={{ transition: 'all .15s linear' }}
      _hover={{ transform: 'scale(1.05)', cursor: 'pointer' }}
    >
      <Flex direction='row' align='center' w='100%'>
        <Avatar
          src={avatarImg ? themeImagePath(avatarImg) : null}
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
        my={3}
        style={{
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}
      >
        {daoData.meta?.description}
      </Text>
      {/* <Flex direction='row' align='center' mt={3}>
        <Badge
          colorScheme='primary'
          variant='outline'
          border='none'
          m='3px 5px 3px 0px'
        >
          {daoData.meta?.network}
        </Badge>
      </Flex> */}

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
