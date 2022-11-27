import React from 'react';
import {
  Modal,
  ModalContent,
  ModalOverlay,
  Box,
  Text,
  ModalCloseButton,
  ModalBody,
  Stack,
  Divider,
} from '@chakra-ui/react';
import { rgba } from 'polished';

import { useOverlay } from '../contexts/OverlayContext';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { useCustomTheme } from '../contexts/CustomThemeContext';
import HubProfileCard from '../components/hubProfileCard';
import UserDaoList from '../components/userDaoList';

const HubAccountModal = () => {
  const { disconnectDapp, requestWallet } = useInjectedProvider();
  const { hubAccountModal, setHubAccountModal } = useOverlay();
  const { theme } = useCustomTheme();

  const handleClose = () => setHubAccountModal(false);
  const handleSwitchWallet = () => {
    setHubAccountModal(false);
    disconnectDapp();
  };

  return (
    <Modal isOpen={hubAccountModal} onClose={handleClose} isCentered>
      <ModalOverlay
        bgColor={rgba(theme.colors.background[500], 0.8)}
        style={{ backdropFilter: 'blur(6px)' }}
      />
      <ModalContent
        rounded='lg'
        bg='blackAlpha.800'
        borderWidth='1px'
        borderColor='whiteAlpha.200'
        py={6}
      >
        <ModalCloseButton />
        <ModalBody flexDirection='column' display='flex'>
          <HubProfileCard />
          <Box
            onClick={handleSwitchWallet}
            color='secondary.400'
            _hover={{ color: 'secondary.600', cursor: 'pointer' }}
            my={6}
          >
            Disconnect wallet
          </Box>
          <Divider color='primary.300' />
          <Box as={Stack} spacing={4} my={6}>
            <Text fontSize='l' fontFamily='heading'>
              My DAOs:
            </Text>
            <UserDaoList handleClose={handleClose} />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default HubAccountModal;
