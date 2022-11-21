import React, {useState} from 'react'
import {Flex, useToast} from '@chakra-ui/react'
import HookForm from "./hookForm"
import {
    newCreateTokenAcceptProposalParams,
    createTokenAcceptProposal,
} from '../utils/stakeSBTPluginAPI'

const CreateAcceptPropoalWidget = (props) => {
    const toast = useToast({
        title: 'Tips',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
    });
    const [loading, setLoading] = useState(false);

    const onSubmit = async data => {

        if (data.token_type.split("::").lenght != 2) {
            toast({
                description: "Invalid token type",
                status: 'error',
            })
            return
        }

        setLoading(true)

        data.propsal.action_delay = data.propsal.action_delay * 60
        createTokenAcceptProposal({
            ...data,
            dao_type: props.dao.daoType,
        }).then((v) => {
            toast({
                description: "create token accept proposa success",
                status: 'success',
            })
            setLoading(false)
        }).catch((e: any) => {
            console.log(e)
            toast({
                description: `${e.toString()}`,
                status: 'error',
            })
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
                startW='22%'
                rightAddon={new Map().set("propsal.action_delay", "min")}
            />
        </Flex>
    )
}

export default CreateAcceptPropoalWidget