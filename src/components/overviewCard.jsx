import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Flex,
  Box,
  Skeleton,
  Button,
  Avatar,
  Input,
  Spinner,
  Badge,
  Stack,
  FormControl,
  InputGroup,
  InputLeftAddon,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { AiOutlineCaretDown, AiFillQuestionCircle } from 'react-icons/ai';
import {
  RiDiscordFill,
  RiTelegramFill,
  RiTwitterFill,
  RiGlobeLine,
  RiMediumFill,
} from 'react-icons/ri';
import makeBlockie from 'ethereum-blockies-base64';
import { utils } from 'ethers';

import { useMetaData } from '../contexts/MetaDataContext';
import useBoost from '../hooks/useBoost';
import ContentBox from './ContentBox';
import TextBox from './TextBox';
import VaultTotal from './vaultTotal';
import DocLink from './docLink';

import { getActiveMembers, getDaoNFTImage } from '../utils/dao';
import { getTerm, getTitle, themeImagePath } from '../utils/metadata';
import { POST_LOCATIONS } from '../utils/poster';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';

const OverviewCard = ({ daoOverview, members, daoVaults }) => {
  const { daochain, daoid } = useParams();
  const { daoMetaData, customTerms } = useMetaData();
  const { injectedProvider, injectedChain, network } = useInjectedProvider();

  const [activeMembers, setActiveMembers] = useState(null);
  const totalShares = utils.commify(daoOverview?.totalShares || 0);
  const totalLoot = utils.commify(daoOverview?.totalLoot || 0);
  const history = useHistory();
  const { isActive } = useBoost();
  const [avatarImg, setAvatarImg] = useState(null);

  const [daoData, setDaoData] = useState(null);

  useEffect(() => {
    const loadDaoInfo = async () => {
      try {
        const avatarImg = await getDaoNFTImage(injectedProvider, daoid);
        setAvatarImg(avatarImg);
      } catch (e) {
        console.log('Error loading NFT image', e);
      }
    };

    loadDaoInfo();
  }, [daoid]);

  useEffect(() => {
    if (members?.length) {
      setActiveMembers(getActiveMembers(members));
    }
  }, [members]);

  const renderTags = () => {
    if (daoData?.daoMetaData?.tags) {
      return (
        <Flex direction='row' wrap='wrap'>
          {daoData.daoMetaData?.tags.split(',').map(tag => {
            return (
              <Badge
                key={tag}
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
    <Box>
      <TextBox size='sm' color='whiteAlpha.900'>
        Details
      </TextBox>
      <ContentBox mt={2} w='100%'>
        <Flex direction='row' align='center' ms='6'>
          <Skeleton isLoaded={daoMetaData?.name}>
            <Flex align='center'>
              <Avatar
                src={
                  avatarImg
                    ? themeImagePath(avatarImg)
                    : makeBlockie(daoid || '0x0')
                }
                mr={6}
              />
              <Box fontSize='2xl' fontWeight={700} fontFamily='heading'>
                {daoMetaData?.name || '--'}
              </Box>
            </Flex>
          </Skeleton>
        </Flex>
        <Skeleton isLoaded={daoMetaData?.description} ms='6'>
          <Box mt={6}>
            {daoMetaData?.description ? daoMetaData.description : '--'}
            {renderTags()}
          </Box>
        </Skeleton>
        <Flex mt={5} ms='6'>
          <TextBox size='xs' color='whiteAlpha.900'>
            {daoMetaData?.communityLinksTwitter ||
            daoMetaData?.communityLinksDiscord ||
            daoMetaData?.communityLinksTelegram
              ? 'Community Links:'
              : ''}
          </TextBox>
          <Flex ml={2} spacing={2} color='#fff'>
            {daoMetaData?.communityLinksTwitter ? (
              <a
                href={daoMetaData?.communityLinksTwitter}
                style={{ color: '#fff', fontSize: '24px', marginRight: '5px' }}
              >
                <RiTwitterFill />
              </a>
            ) : (
              <></>
            )}
            {daoMetaData?.communityLinksDiscord ? (
              <a
                href={daoMetaData?.communityLinksDiscord}
                style={{ color: '#fff', fontSize: '24px', marginRight: '5px' }}
              >
                <RiDiscordFill />
              </a>
            ) : (
              <></>
            )}
            {daoMetaData?.communityLinksTelegram ? (
              <a
                href={daoMetaData?.communityLinksTelegram}
                style={{ color: '#fff', fontSize: '24px', marginRight: '5px' }}
              >
                <RiTelegramFill />
              </a>
            ) : (
              <></>
            )}
          </Flex>
        </Flex>
        {/* <Flex direction='row' w='100%' justify='space-between' mt={6}>
          <Box>
            <TextBox size='xs' title={getTitle(customTerms, 'Members')}>
              {`Active ${getTerm(customTerms, 'members')}`}
            </TextBox>
            <Skeleton isLoaded={members}>
              <TextBox size='lg' variant='value'>
                {activeMembers ? activeMembers.length : <Spinner size='sm' />}
              </TextBox>
            </Skeleton>
          </Box>
          <Box>
            <TextBox size='xs'>Shares</TextBox>
            <Skeleton isLoaded={totalShares}>
              <TextBox size='lg' variant='value'>
                {totalShares || '--'}
              </TextBox>
            </Skeleton>
          </Box>
          <Box>
            <TextBox size='xs'>Loot</TextBox>
            <Skeleton isLoaded={totalLoot}>
              <TextBox size='lg' variant='value'>
                {totalLoot || '--'}
              </TextBox>
            </Skeleton>
          </Box>
        </Flex> */}
        {/* <Box mt={6}>
          {daoVaults && (
            <>
              <TextBox size='sm' title={getTitle(customTerms, 'Bank')}>
                {getTerm(customTerms, 'vault total')}
              </TextBox>
              <VaultTotal vaults={daoVaults} />
            </>
          )}
        </Box> */}
        {/* <DocLink locationName={POST_LOCATIONS.FRONT_PAGE} /> */}
        {daoData?.daoStrategies ? (
          <Flex flexDirection='column' mt={5} ms='6'>
            <Text mb={2} fontSize='xl'>
              {'STRATEGY:'}
            </Text>
            <Text size='xs' ml={4} as='li'>
              {daoData?.daoStrategies[0]?.strategyId || ''}
            </Text>
            <Text as='i' fontSize='xs' ml={4}>
              {daoData?.daoStrategies[0]?.description || ''}
            </Text>
          </Flex>
        ) : (
          <></>
        )}
        <Flex mt={6} ms='6' align='center'>
          {/* <Button
            variant='outline'
            mr={6}
            onClick={() => history.push(`/dao/${daochain}/${daoid}/vaults`)}
            value='bank'
            title={getTitle(customTerms, 'Bank')}
          >
            {`View ${getTerm(customTerms, 'bank')}`}
          </Button> */}
          <Button
            mr={6}
            margin='0 auto'
            onClick={() => history.push(`/dao/${daochain}/${daoid}/proposals`)}
            value='proposals'
            title={getTitle(customTerms, 'Proposals')}
          >
            {`View ${getTerm(customTerms, 'proposals')}`}
          </Button>
          {/* {isActive('SNAPSHOT') && (
            <Button
              onClick={() =>
                history.push(`/dao/${daochain}/${daoid}/boost/snapshot`)
              }
              value='proposals'
              title={getTitle(customTerms, 'Snapshots')}
            >
              {`View ${getTerm(customTerms, 'snapshots')}`}
            </Button>
          )} */}
        </Flex>
      </ContentBox>
    </Box>
  );
};

export default OverviewCard;
