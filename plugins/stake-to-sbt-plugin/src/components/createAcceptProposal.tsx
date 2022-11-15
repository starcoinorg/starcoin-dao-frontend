import React, {useState} from 'react'
import {Flex, useToast} from '@chakra-ui/react'
import HookForm from "./hookForm"
import {
    newCreateTokenAcceptProposalParams,
    createTokenAcceptProposal,
} from '../utils/stakeSBTPluginAPI'

const CreateAcceptPropoalWidget = (props) => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const onSubmit = async data => {
        setLoading(true)
        toast({
            title: 'Tips',
            description: "create token accept proposa success",
            status: 'success',
            duration: 3000,
            position: 'top-right',
            isClosable: true,
        })
        data.propsal.action_delay =  data.propsal.action_delay * 60 *1000
        createTokenAcceptProposal({
            ...data,

            dao_type: props.dao.daoType,
        }).then((v) => {
            toast({
                title: 'Tips',
                description: "create token accept proposa success",
                status: 'success',
                duration: 3000,
                position: 'top-right',
                isClosable: true,
            })
            setLoading(false)
        }).catch((v) => {
            console.log(v)
            setLoading(false)
        })
    }

    return (
        <Flex
            direction='column'
        >
            <HookForm
                obj={newCreateTokenAcceptProposalParams()}
                loading={loading}
                onSubmit={onSubmit}
                rightAddon={new Map().set("propsal.action_delay", "min")}
            />
        </Flex>
    )
}

export default CreateAcceptPropoalWidget