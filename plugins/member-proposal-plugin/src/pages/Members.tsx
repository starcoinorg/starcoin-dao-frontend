import React, { useEffect, useState } from 'react';
import { RiAddFill } from 'react-icons/ri';
import { 
  Flex,
  Stack,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  useDisclosure,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';

import MainViewLayout from '../components/mainViewLayout';
import { createMemberProposal } from '../utils/memberPluginAPI';
import { useSubAppContext } from '../contexts/SubAppContext';
import MemberInviteList from '../components/memberInviteList';
import MyMemberInviteList from '../components/myMemberInviteList';
import { isValidateAddress } from '../utils/stcWalletSdk';

const Members = () => {
    const { dao } = useSubAppContext();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure()

    const [memberAddress, setMemberAddress] = React.useState('')
    const handleMemberAddressChange = (event) => setMemberAddress(event.target.value)

    const [nftImages, setNFTImages] = useState<Array<File>>();
    const onDrop = pictures => {
      setNFTImages(pictures);
    };

    const [initSBT, setInitSBT] = React.useState(0);
    const handleInitSBTChange = (event) => setInitSBT(event.target.value)

    const openProposalSelector = async () => {
      if (memberAddress == '') {
        toast({
          title: 'Tips',
          description: "The member address is required.",
          status: 'error',
          duration: 9000,
          position: 'top-right',
          isClosable: true,
        })

        return;
      }

      if (!isValidateAddress(memberAddress)) {
        toast({
          title: 'Tips',
          description: "The member address is invalid.",
          status: 'error',
          duration: 9000,
          position: 'top-right',
          isClosable: true,
        })

        return
      }

      if (initSBT < 0) {
        toast({
          title: 'Tips',
          description: "The initial SBT must great or equal zero.",
          status: 'error',
          duration: 9000,
          position: 'top-right',
          isClosable: true,
        })

        return;
      }

      try {
        const transactionHash = await createMemberProposal(
          dao.daoType,
          `Apply add ${memberAddress} as member`,
          memberAddress,
          "",
          "",
          initSBT,
          0
        );

        onClose();

        toast({
          title: 'Tips',
          description: `Create member proposal success, transactionHash: ${transactionHash}`,
          status: 'success',
          duration: 9000,
          position: 'top-right',
          isClosable: true,
        })
      } catch (error) {
        toast({
          title: 'Tips',
          description: `Create member proposal failed, error: ${error.message}`,
          status: 'error',
          duration: 9000,
          position: 'top-right',
          isClosable: true,
        })
      }
    };
    
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)

    const ctaButton = (
      <Button
        rightIcon={<RiAddFill />}
        title={'Members'}
        onClick={onOpen}
      >
        New Member
      </Button>
    );

    return (
      <MainViewLayout
        header='Members'
        headerEl={ctaButton}
      >
        <Tabs size='md' variant='enclosed'>
          <TabList>
            <Tab>All Member Invites</Tab>
            <Tab>My Member Invite</Tab>
          </TabList>
          <TabPanels
            w={['100%', null, null, '100%', '80%']}
            pr={[0, null, null, null, 6]}
            pb={6}
          >
            <TabPanel>
              <MemberInviteList daoId={dao.daoType} />
            </TabPanel>
            <TabPanel>
              <MyMemberInviteList daoId={dao.daoType} />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Modal
          initialFocusRef={initialRef}
          finalFocusRef={finalRef}
          isOpen={isOpen}
          onClose={onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Member Proposal</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Member Address:</FormLabel>
                <Input 
                  ref={initialRef} 
                  placeholder='Member Address' 
                  value={memberAddress}
                  onChange={handleMemberAddressChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Init SBT:</FormLabel>
                <Input 
                  ref={initialRef} 
                  placeholder='Init SBT'
                  type={'number'}
                  value={initSBT}
                  onChange={handleInitSBTChange}
                />
              </FormControl>

            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={openProposalSelector}>
                Create Proposal
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </MainViewLayout>
    );
}

export default Members;
