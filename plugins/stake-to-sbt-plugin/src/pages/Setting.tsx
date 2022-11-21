import React, { useEffect, useState } from 'react';
import {
    SimpleGrid, Container, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure
} from '@chakra-ui/react';

import {useHistory} from 'react-router-dom'

import MainViewLayout from '../components/mainViewLayout';
import Back from "../components/back";
import { useSubAppContext } from '../contexts/SubAppContext'
import CreateAcceptProposalWidget from '../components/createAcceptProposal'
import CreateWeightProposalWidget from "../components/createWeightProposal";
import Card from '../components/card';
import { queryStakeTokenType, QueryStakeTypeResult } from '../utils/stakeSBTPluginAPI';

const SettingPage = () => {
    const {dao} = useSubAppContext()
    const history = useHistory()
    const [loading, setLoading] = useState(true)
    const [dataList, setDataList] = useState<Array<QueryStakeTypeResult>>([])
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        const fetchData = async () => {
            let result = await queryStakeTokenType(dao.address, dao.daoType)
            result.push({
                title: "-",
                type: "-"
            })
            setDataList(result)
            setLoading(false)
    }

        fetchData().catch(console.log)  
    },[])

    return (
        <MainViewLayout
            header='Stake SBT Setting'
            headerEl={Back('Back')}
        >
            <Modal isOpen={isOpen} onClose={onClose} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a new stake Token</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* <Lorem count={2} /> */}
            <CreateAcceptProposalWidget dao={dao}/>
          </ModalBody>

        </ModalContent>
      </Modal>
           <Container maxW="80rem" centerContent>
        <SimpleGrid columns={[1, 2]}>
          {dataList.map(function (data) {
            const { title, type } = data;
            const plus = title == "-"
            return (
              <Card
                key={type}
                product={plus ? "New" : title}
                summary={plus? "Add new token type to stake":type}
                longLine="..."
                action={plus?"Add":"Detail"}
                actionCallback = {() => {
                    if (plus) {
                        onOpen()
                    } else {
                        history.push(`/detail/${type}`)
                    }
                }}
              />
            )
          })}
        </SimpleGrid>
      </Container>

        </MainViewLayout>
    )
}

export default SettingPage;