import React, {useEffect, useState} from 'react'
import {
    SimpleGrid,
    Container,
    Spinner,
    Modal,
    ModalBody,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    useDisclosure,
} from '@chakra-ui/react'
import { rgba } from 'polished'
import {useParams} from 'react-router-dom'

import Back from "../components/back"
import Card from '../components/card'
import MainViewLayout from '../components/mainViewLayout'
import {useSubAppContext} from '../contexts/SubAppContext'
import CreateWeightProposalWidget from "../components/createWeightProposal"
import {
    queryTokenStakeLimit,
    QueryTokenStakeLimitResult
} from '../utils/stakeSBTPluginAPI'

export const CARD_BG = '#0b0b0b';

const TypePage = (props) => {
    const {dao} = useSubAppContext()
    const {type} = useParams()
    const [dataList, setDataList] = useState<Array<QueryTokenStakeLimitResult>>([])
    const [loading, setLoading] = useState(true)
    const {isOpen, onOpen, onClose} = useDisclosure()

    useEffect(() => {
        const fetchData = async () => {
            let result = await queryTokenStakeLimit(dao.address, dao.daoType, type)
            console.log(result)
            // result.push({
            //     lock_time: -1n,
            //     weight: -1n
            // })
            setDataList(result)
            setLoading(false)
        }

        fetchData().catch(console.log)
    }, [])

    const formatTime = (t) => {
        if (t > 60 * 60) {
            return `${(t / (60 * 60)).toFixed(2)} hours`
        } else {
            return `${t / 60} minutes`
        }
    }

    return (
        <MainViewLayout
            header='Token Detail'
            headerEl={Back('Back')}
        >
            <Modal isOpen={isOpen} onClose={onClose} size='full'>
            <ModalOverlay bgColor={rgba(CARD_BG, 0.8)} />
                <ModalContent rounded='lg'
                bg={CARD_BG}
                borderWidth='1px'
                borderColor='whiteAlpha.200'
                py={3}
                px={9}>
                    <ModalHeader>Create a new stake weight</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <CreateWeightProposalWidget dao={dao} tokenType={type}/>
                    </ModalBody>

                </ModalContent>
            </Modal>
            <Container maxW="80rem" centerContent>
                {
                    loading ?
                        <Spinner margin='0 auto' align='center'/>
                        // <Skeleton height='20px' isLoaded={loading}>
                        // </Skeleton>
                        :
                        <SimpleGrid columns={[1, 2]}>
                            {dataList.map(function (data) {
                                const {lock_time, weight} = data
                                const plus = lock_time === -1n
                                return (
                                    <Card
                                        key={lock_time}
                                        product={plus ? "New" : weight}
                                        summary={plus ? "Add new token type to stake" : `Lock time: ${formatTime(lock_time)}`}
                                        longLine={plus ? "..." : `Weight: ${weight}`}
                                        action={plus ? "Add" : "Delete"}
                                        actionCallback={() => {

                                            if (plus) {
                                                onOpen()
                                            }
                                        }}
                                    />
                                )
                            })}
                        </SimpleGrid>
                }
            </Container>

        </MainViewLayout>
    )
}

export default TypePage