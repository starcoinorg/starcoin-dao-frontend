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
} from '@chakra-ui/react';
import MainViewLayout from '../components/mainViewLayout';
import { createMemberProposal } from '../utils/memberPluginAPI';
import { useDao } from '../contexts/DaoContext';
import MemberCard from '../components/memberCard';
import MemberInviteList from '../components/memberInviteList';
import MyMemberInviteList from '../components/myMemberInviteList';

const Members = () => {
    const { dao } = useDao();
    const nftData = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiIHN0YW5kYWxvbmU9InllcyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6Y2M9Imh0dHA6Ly93ZWIucmVzb3VyY2Uub3JnL2NjLyIgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIiB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJmdWxsIiB3aWR0aD0iMTUwcHgiIGhlaWdodD0iMTUwcHgiIHZpZXdCb3g9IjAgMCAxNTAgMTUwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiBpZD0ic3ZnX2RvY3VtZW50IiBzdHlsZT0iem9vbTogMTsiPjwhLS0gQ3JlYXRlZCB3aXRoIG1hY1NWRyAtIGh0dHBzOi8vbWFjc3ZnLm9yZy8gLSBodHRwczovL2dpdGh1Yi5jb20vZHN3YXJkMi9tYWNzdmcvIC0tPjx0aXRsZSBpZD0ic3ZnX2RvY3VtZW50X3RpdGxlIj5VbnRpdGxlZC5zdmc8L3RpdGxlPjxkZWZzIGlkPSJzdmdfZG9jdW1lbnRfZGVmcyI+PC9kZWZzPjxnIGlkPSJtYWluX2dyb3VwIj48cmVjdCBpZD0iYmFja2dyb3VuZF9yZWN0IiBmaWxsPSIjMTU4OGYxIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE1MHB4IiBoZWlnaHQ9IjE1MHB4Ij48L3JlY3Q+PC9nPjwvc3ZnPg==`;
    const openProposalSelector = () => {
      createMemberProposal(
        dao.daoType,
        'Apply add 0x51b928B489cB8eFEaF11D530B42cBcDA as member',
        '0x51b928B489cB8eFEaF11D530B42cBcDA',
        nftData,
        "ipfs://xxxxxx",
        100,
        0
      );
    };
    
    const { isOpen, onOpen, onClose } = useDisclosure()

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
            <Tab>My Profile</Tab>
            <Tab>All Invite</Tab>
            <Tab>My Invite</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Flex as={Stack} direction='column' spacing={4} w='100%'>
                <MemberCard daoId={dao.daoType}/>
              </Flex>
            </TabPanel>
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
            <ModalHeader>Create your account</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>First name</FormLabel>
                <Input ref={initialRef} placeholder='First name' />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Last name</FormLabel>
                <Input placeholder='Last name' />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme='blue' mr={3} onClick={openProposalSelector}>
                Save
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </MainViewLayout>
    );
}

export default Members;
