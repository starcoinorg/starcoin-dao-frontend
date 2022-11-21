import React,{useEffect, useState} from 'react';
import {
    SimpleGrid, Container, Spinner, Modal, useDisclosure, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button
} from '@chakra-ui/react';

import {Skeleton} from '@chakra-ui/react'
import { useParams } from 'react-router-dom';
import MainViewLayout from '../components/mainViewLayout';
import Back from "../components/back";
import Card from '../components/card';
import { useSubAppContext } from '../contexts/SubAppContext'
import CreateAcceptProposalWidget from '../components/createAcceptProposal'
import CreateWeightProposalWidget from "../components/createWeightProposal";
import { queryTokenStakeLimit, QueryTokenStakeLimitResult } from '../utils/stakeSBTPluginAPI';

const TypePage = (props) => {
    const {dao} = useSubAppContext()
    const {type} = useParams()
    const [dataList, setDataList] = useState<Array<QueryTokenStakeLimitResult>>([])
    const [loading, setLoading] = useState(true)
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        const fetchData = async () => {
            let result = await queryTokenStakeLimit(dao.address, dao.daoType, type)
            result.push({
                lock_time: 0n,
                weight: 0n
            })
            setDataList(result)
            setLoading(false)
    }

        fetchData().catch(console.log)  
    },[])

    const formatTime = (t) => {
        if (t>60*60) {
            return `${(t / (60*60)).toFixed(2)} 小时`
        } else {
            return `${t / 60} 分钟`
        }
    }

    return (
        <MainViewLayout
            header='Token Detail'
            headerEl={Back('Back')} 
        >
            <Modal isOpen={isOpen} onClose={onClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new stake weight</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <Lorem count={2} /> */}
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
                    const { lock_time, weight } = data;
                    const plus = lock_time === 0n
                    return (
                      <Card
                        key={lock_time}
                        product={plus ? "New" : weight}
                        summary={plus? "Add new token type to stake":`Lock time: ${formatTime(lock_time)}`}
                        longLine={plus? "...":`Weight: ${weight}`}
                        action={plus?"Add":"Delete"}
                        actionCallback = {() => {

                            if (plus) {
                                onOpen()
                            }

                            // history.push(`/detail/${type}`)
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

export default TypePage;