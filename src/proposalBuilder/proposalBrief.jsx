import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

import { CardLabel, ParaMd } from '../components/typography';
import CustomTransfer from './customTransferFactory';
import {
  PropCardCrossChain,
  PropCardDate,
  PropCardOffer,
  PropCardRequest,
} from './proposalBriefPrimitives';
import { useRequest } from '../hooks/useRequest';

import { CUSTOM_CARD_DATA } from '../data/proposalData';
import { useEffect } from 'react';

const ProposalCardBrief = ({ proposal = {}, minionAction }) => {
  const { daochain, daoid } = useParams();
  const isOffering = Number(proposal.tributeOffered) > 0;
  const isRequesting =
    Number(proposal.lootRequested) > 0 ||
    Number(proposal.sharesRequested) > 0 ||
    Number(proposal.paymentRequested) > 0;
  const isCrossChain = proposal.minion?.crossChainMinion;
  const { customTransferUI } = CUSTOM_CARD_DATA[proposal.proposalType] || {};
  const [proposalData, setProposalData] = useState(null);

  const { data } = useRequest(`proposals/${daoid}%2C1`);

  useEffect(() => {
    if (data) {
      setProposalData(data);
    }
  }, [data]);
  return (
    <Flex
      width={['100%', '100%', '60%']}
      minHeight={['10rem', '10rem', '0']}
      justifyContent='space-between'
      borderRight={['none', 'none', '1px solid rgba(255,255,255,0.1)']}
      borderBottom={[
        '1px solid rgba(255,255,255,0.1)',
        '1px solid rgba(255,255,255,0.1)',
        'none',
        'none',
      ]}
      position='relative'
    >
      <Box px='1.2rem' py='0.6rem' w='100%'>
        <Flex
          alignItems='center'
          mb={['4', '4', '4']}
          justifyContent='space-between'
          w='100%'
        >
          <CardLabel>{proposal.votingType}</CardLabel>
        </Flex>
        <ParaMd
          fontWeight='700'
          mb={['5', '5', '5']}
          fontSize={['1.2rem', '1.2rem', '1.2rem']}
          lineHeight={['1.8rem', '1.8rem', '1.2rem']}
        >
          {proposal.title}
        </ParaMd>
        {isCrossChain && (
          <PropCardCrossChain chainID={daochain} proposal={proposal} />
        )}
        {isRequesting && <PropCardRequest proposal={proposal} />}
        {isOffering && <PropCardOffer proposal={proposal} />}
        {customTransferUI && (
          <CustomTransfer
            proposal={proposal}
            customTransferUI={customTransferUI}
            minionAction={minionAction}
          />
        )}
        <Flex
          display='flex'
          align={['none', 'center']}
          direction={['column', 'row']}
          justify={['none', 'space-between']}
          mb='3'
        >
          <PropCardDate
            label='Submitted'
            dateTimeMillis={proposal?.submittedAt}
          />
          <Button
            as={Link}
            fontWeight='bold'
            to={`/dao/${daochain}/${daoid}/proposals/${proposal.proposalId.proposalNumber}`}
            variant='outline'
            size='sm'
            width='8rem'
            mt={['4', '4', '0']}
          >
            View Details
          </Button>
        </Flex>
        <Flex mt={6} alignItems='center'>
          <Text size='xs' mr={5} minWidth='9.625rem'>
            <Text
              size='xs'
              mr={2}
              minWidth='9.625rem'
              style={{ display: 'flex' }}
            >
              {'BLOCK HEIGHT'}

              <Box ml={2} display='inline-flex' alignItems='center'>
                <Tooltip
                  label='Snapshot block height：The block height of the snapshot used to calculate the voting power.'
                  fontSize='md'
                >
                  <WarningIcon />
                </Tooltip>
              </Box>
            </Text>
          </Text>
          <Text as='i' fontSize='xs'>
            {proposal?.blockHeight || 0}
          </Text>
        </Flex>
        <Flex mt={6} alignItems='center'>
          <Text
            size='xs'
            mr={5}
            minWidth='9.625rem'
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Text
              size='xs'
              mr={2}
              minWidth='9.625rem'
              style={{ display: 'inline-block' }}
            >
              {'BLOCK STATE ROOT'}
            </Text>
            <Tooltip
              label='Snapshot state root：The State Root corresponding to the block height of the snapshot.'
              fontSize='md'
              ml={2}
            >
              <WarningIcon />
            </Tooltip>
          </Text>
          <Text as='i' fontSize='xs'>
            {proposal?.blockStateRoot || ''}
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default ProposalCardBrief;
