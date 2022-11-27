import React from 'react';
import {
  Modal,
  ModalHeader,
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
import AddressAvatar from '../components/addressAvatar';

const HubAccountModal = () => {
  const { disconnectDapp, address } = useInjectedProvider();
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
          <AddressAvatar hideCopy addr={address} />
          <Divider color='primary.300' my={6} />
          <Box
            onClick={handleSwitchWallet}
            color='secondary.400'
            _hover={{ color: 'secondary.600', cursor: 'pointer' }}
          >
            Disconnect wallet
          </Box>
          <Divider color='primary.300' my={6} />
          <Box as={Stack} spacing={4}>
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
