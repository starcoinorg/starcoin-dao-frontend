import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { RiLinksLine } from 'react-icons/ri';
import {
  Flex,
  Icon,
  Button,
  Box,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Portal,
  Spacer,
} from '@chakra-ui/react';
import styled from '@emotion/styled';

import Brand from './brand';
import ChangeDao from './changeDao';
import ChangeUser from '../components/changeUser';
import NavLinkList from './navLinkList';
import SocialsLinkList from './socialsLinkList';
import {
  defaultSocialLinks,
  generateDaoSocials,
  generateDiscourseLink,
} from '../utils/navLinks';

const TemporaryPopoverFix = styled.span`
  .css-n0uled {
    max-width: fit-content;
  }
`;

const DesktopNav = ({ dao }) => {
  const { daoid, daochain } = useParams();

  return (
    <Flex
      p={5}
      position={['relative', 'relative', 'relative', 'fixed']}
      direction='column'
      align='start'
      justifyContent='start'
      bg='primary.500'
      zIndex='1'
      w='100px'
      minH='100vh'
      overflow='hidden'
      overflowY='auto'
    >
      <Flex
        direction={['row', 'row', 'row', 'column']}
        justify='start'
        align={['center', 'center', 'center', 'start']}
        w='100%'
        wrap='wrap'
      >
        <Flex
          align={['center', 'center', 'center', 'start']}
          justify={['space-between', 'space-between', 'space-between', 'start']}
          direction='row'
          w='100%'
          wrap='wrap'
        >
          <Brand dao={dao} />
        </Flex>
      </Flex>
      <Flex direction='column' wrap='wrap'>
        <>
          <NavLinkList dao={dao} view='desktop' />
        </>
      </Flex>
      <Spacer />
      <Flex direction='column' wrap='wrap'>
        {daoid && (
          <Box
            w={['auto', null, null, '100%']}
            order={[3, null, null, 3]}
            mt={[0, null, null, 6]}
          >
            <ChangeDao />
          </Box>
        )}
        <Box
          w={['auto', null, null, '100%']}
          order={[3, null, null, 3]}
          mt={[0, null, null, 6]}
        >
          <ChangeUser isDao={daoid} />
        </Box>
      </Flex>
    </Flex>
  );
};

export default DesktopNav;
