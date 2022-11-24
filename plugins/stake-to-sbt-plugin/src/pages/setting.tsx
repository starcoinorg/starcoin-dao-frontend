import React, {
    useEffect,
    useState
} from 'react';
import {
    SimpleGrid,
    Container,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useDisclosure, Spinner
} from '@chakra-ui/react'

import {useHistory} from 'react-router-dom'
import {rgba} from 'polished'
import Card from '../components/card'
import Back from "../components/back"
import MainViewLayout from '../components/mainViewLayout'
import {useSubAppContext} from '../contexts/SubAppContext'
import CreateAcceptProposalWidget from '../components/createAcceptProposal'
import {
    queryStakeTokenType,
    QueryStakeTypeResult
} from '../utils/api'

const CARD_BG = '#0b0b0b';

const SettingPage = () => {
    const {dao} = useSubAppContext()
    const history = useHistory()
    const [loading, setLoading] = useState(true)
    const [dataList, setDataList] = useState<Array<QueryStakeTypeResult>>([])
    const {isOpen, onOpen, onClose} = useDisclosure()

    useEffect(() => {
        const fetchData = async () => {
            let result = await queryStakeTokenType(dao.address, dao.daoType)
            result.push({
                title: "-",
                type: "-"
            })
            setDataList(result)
        }

        fetchData()
            .catch(console.log)
            .finally(() => setLoading(false))
    }, [])

    return (
        <MainViewLayout
            header='Stake SBT Setting'
            headerEl={Back('Back')}
        >
            <Modal isOpen={isOpen} onClose={onClose} size='full'>
                <ModalOverlay bgColor={rgba(CARD_BG, 0.8)}/>
                <ModalContent
                    rounded='lg'
                    bg={CARD_BG}
                    borderWidth='1px'
                    borderColor='whiteAlpha.200'
                    py={3}
                    px={9}>
                    <ModalHeader>Create a new stake Token</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <CreateAcceptProposalWidget dao={dao} formHelperText="asd"/>
                    </ModalBody>

                </ModalContent>
            </Modal>
            <Container maxW="80rem" centerContent>
                <SimpleGrid columns={[1, 2]}>
                    {
                        loading
                            ?
                            <Spinner/>
                            :
                            dataList.map(function (data) {
                                const {title, type} = data;
                                const plus = title === "-"
                                return (
                                    <Card
                                        key={type}
                                        product={plus ? "New" : title}
                                        summary={plus ? "Add new token type to stake" : type}
                                        longLine="..."
                                        action={plus ? "Add" : "Detail"}
                                        actionCallback={() => {
                                            if (plus) {
                                                onOpen()
                                            } else {
                                                history.push(`/detail/${type}`)
                                            }
                                        }}
                                    />
                                )
                            })
                    }
                </SimpleGrid>
            </Container>

        </MainViewLayout>
    )
}

export default SettingPage;