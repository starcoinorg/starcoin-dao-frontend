import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalOverlay,
  Box,
  Flex,
} from '@chakra-ui/react';
import { rgba } from 'polished';
import { useOverlay } from '../contexts/OverlayContext';

export const CARD_BG = '#0b0b0b';

const MemberProposal = () => {
  const { memberProposalModal, setMemberProposalModal } = useOverlay()

  const handleClose = () => {
    setMemberProposalModal(false);
  };

  return (
    <Modal isOpen={memberProposalModal} onClose={handleClose} isCentered>
      <ModalOverlay bgColor={rgba(CARD_BG, 0.8)} />
      <ModalContent
        rounded='lg'
        bg={CARD_BG}
        borderWidth='1px'
        borderColor='whiteAlpha.200'
        maxWidth='700px'
        py={3}
        px={9}
      >
        <ModalHeader pb={0}>
          <Flex justify='space-between' align='center' w='90%'>
            <Box
              fontFamily='heading'
              textTransform='uppercase'
              fontSize='md'
              fontWeight={700}
              mb={6}
              color='white'
            >
              What would you like to do?
            </Box>
          </Flex>
        </ModalHeader>
        <ModalBody
          flexDirection='column'
          display='flex'
          maxH='650px'
          overflowY='auto'
        >
           ModalBody
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MemberProposal;