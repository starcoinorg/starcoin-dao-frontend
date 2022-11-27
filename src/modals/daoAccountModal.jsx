import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Modal,
  Flex,
  Link,
  Box,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
  ModalBody,
  Divider,
} from '@chakra-ui/react';
import { rgba } from 'polished';

import { useCustomTheme } from '../contexts/CustomThemeContext';
import { useDaoMember } from '../contexts/DaoMemberContext';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { useOverlay } from '../contexts/OverlayContext';
import { listUserDaoTypes } from '../utils/dao';

import HubProfileCard from '../components/hubProfileCard';
import MemberInfoGuts from '../components/memberInfoGuts';
import UserDaoList from '../components/userDaoList';

const DaoAccountModal = () => {
  const { daoAccountModal, setDaoAccountModal } = useOverlay();
  const { daoMember, isMember } = useDaoMember();
  const {
    injectedProvider,
    address,
    disconnectDapp,
    requestWallet,
  } = useInjectedProvider();
  const { daoid, daochain } = useParams();
  const { theme } = useCustomTheme();
  const [userDaos, setUserDaos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setDaoAccountModal(false);
  };

  const handleSwitchWallet = () => {
    setDaoAccountModal(false);
    disconnectDapp();
  };

  return (
    <Modal isOpen={daoAccountModal} onClose={handleClose} isCentered>
      <ModalOverlay bgColor={rgba(theme.colors.background[500], 0.8)} />
      <ModalContent
        rounded='lg'
        bg='blackAlpha.800'
        borderWidth='1px'
        borderColor='whiteAlpha.200'
        py={6}
      >
        <ModalCloseButton />
        <ModalBody flexDirection='column' display='flex'>
          {isMember ? (
            <MemberInfoGuts member={daoMember} showMenu={false} hideCopy />
          ) : (
            <HubProfileCard />
          )}
          <Divider color='primary.300' my={6} />
          <Box>
            <Flex direction='row' justify='space-between' align='flex-start'>
              <Flex direction='column'>
                {address && daochain && daoid && (
                  <Link
                    as={RouterLink}
                    to={`/dao/${daochain}/${daoid}/profile/${address}`}
                    onClick={handleClose}
                    color='secondary.400'
                    _hover={{ color: 'secondary.600' }}
                    mb='4px'
                  >
                    View Member Profile
                  </Link>
                )}
                {address && daochain && daoid && daoMember && (
                  <Link
                    as={RouterLink}
                    to={`/dao/${daochain}/${daoid}/profile/${address}?edit=true`}
                    onClick={handleClose}
                    color='secondary.400'
                    _hover={{ color: 'secondary.600' }}
                    mb='4px'
                  >
                    Edit Member Profile
                  </Link>
                )}
                <Box
                  onClick={handleSwitchWallet}
                  color='secondary.400'
                  _hover={{ color: 'secondary.600', cursor: 'pointer' }}
                >
                  Disconnect wallet
                </Box>
              </Flex>

              <Link
                color='secondary.400'
                _hover={{ color: 'secondary.600' }}
                as={RouterLink}
                to='/'
                onClick={handleClose}
              >
                Go to Hub
              </Link>
            </Flex>
          </Box>
          <Divider color='primary.300' my={6} />
          <Box>
            <Box fontSize='l' fontFamily='heading' mb={6}>
              My Daos:
            </Box>
            <UserDaoList handleClose={handleClose} />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DaoAccountModal;
