import React, {useEffect, useState} from 'react';
import {RiAddFill} from 'react-icons/ri';
import {
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
    Input, FormHelperText, FormErrorMessage,
//    useToast,
} from '@chakra-ui/react';

import {rgba} from 'polished';

import MainViewLayout from '../components/mainViewLayout';
import {createMemberProposal, getMemberNFT} from '../utils/memberPluginAPI';
import {useSubAppContext} from '../contexts/SubAppContext';
import MemberInviteList from '../components/memberInviteList';
import MyMemberInviteList from '../components/myMemberInviteList';
import {isValidateAddress} from '../utils/stcWalletSdk';

const CARD_BG = '#0b0b0b';

const Members = () => {
    const {dao} = useSubAppContext();
    //    const toast = useToast();
    const {isOpen, onOpen, onClose} = useDisclosure()

    const [memberAddress, setMemberAddress] = React.useState('')
    const handleMemberAddressChange = (event) => setMemberAddress(event.target.value)
    const [addressError, setAddressError] = useState(null)
    const [sbtError, setSBTError] = useState(null)
    const [currentAddressNFT, setCurrentAddressNFT] = useState(null)
    const [loading, setLoaing] = useState(true)
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)

//    const [nftImages, setNFTImages] = useState<Array<File>>();
//    const onDrop = pictures => {
//        setNFTImages(pictures);
//    };

    const [initSBT, setInitSBT] = React.useState(0);
    const handleInitSBTChange = (event) => setInitSBT(event.target.value)

    const openProposalSelector = async () => {

        if (memberAddress == '' || !isValidateAddress(memberAddress)) {
            setAddressError('The member address is invalid.')
            return
        }

        setAddressError(null)

        if (initSBT < 0) {
            setSBTError("The initial SBT must great or equal zero.")
            return
        }

        setSBTError(null)

        try {
            await createMemberProposal(
                dao.daoType,
                `Apply add ${memberAddress} as member`,
                memberAddress,
                "",
                "",
                initSBT,
                0
            );

            onClose();

        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        const fetchNFT = async () => {
            const ruslt = await getMemberNFT(dao.daoType, window.starcoin.selectedAddress);
            setCurrentAddressNFT(ruslt);
        }

        fetchNFT().catch(e => console.log(e)).finally(() => setLoaing(false))
    }, [])

    const ctaButton = (
            currentAddressNFT ? <Button
                rightIcon={<RiAddFill/>}
                title={'Members'}
                onClick={onOpen}
                isLoading={loading}
                >
                Invite Member
            </Button>
                    :<></>
    );

    const tab = (text) => {
        return (
            <Tab _selected={{
                color: '#EB8A23',
                borderColor: '#EB8A23',
                borderBottom: '2px',
                variant: 'solid'
            }}
                 borderBottom='none'
            >
                {text}
            </Tab>
        )
    }

    return (
        <MainViewLayout
            header='Members'
            headerEl={ctaButton}
        >
            <Tabs size='md'>
                <TabList>
                    {tab('All Member Invites')}
                    {tab('My Member Invite')}
                </TabList>
                <TabPanels
                    pb={6}
                >
                    <TabPanel>
                        <MemberInviteList daoId={dao.daoType}/>
                    </TabPanel>
                    <TabPanel>
                        <MyMemberInviteList daoId={dao.daoType}/>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <Modal
                initialFocusRef={initialRef}
                finalFocusRef={finalRef}
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay bgColor={rgba(CARD_BG, 0.8)}/>

                <ModalContent rounded='lg'
                              bg={CARD_BG}
                              borderWidth='1px'
                              borderColor='whiteAlpha.200'
                              py={3}
                              px={9}>
                    <ModalHeader>Add Member Proposal</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>Member Address:</FormLabel>
                            <Input
                                ref={initialRef}
                                placeholder='Member Address'
                                value={memberAddress}
                                onChange={handleMemberAddressChange}
                            />
                            {
                                addressError ?
                                    <FormHelperText>
                                        {addressError}
                                    </FormHelperText> : <></>
                            }
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
                            {
                                sbtError ?
                                    <FormHelperText>
                                        {sbtError}
                                    </FormHelperText> : <></>
                            }
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
