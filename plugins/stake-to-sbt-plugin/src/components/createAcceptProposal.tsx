import React, {useState} from 'react'
import {Flex, useToast} from '@chakra-ui/react'
import HookForm from "./hookForm"
import {
    newCreateTokenAcceptProposalParams,
    createTokenAcceptProposal,
} from '../utils/api'

const CreateAcceptPropoalWidget = (props) => {
    const toast = useToast({
        title: 'Tips',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
    });
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState()

    const onSubmit = data => {

        console.log(data.token_type.split("::").length)
        if (data.token_type.split("::").length !== 3) {
            setErrors(new Map().
            set("token_type", "Invalid token type"))
            return
        }

        setErrors(undefined)

        setLoading(true)

        data.propsal.action_delay = data.propsal.action_delay * 60 * 1000

        createTokenAcceptProposal({
            ...data,
            dao_type: props.dao.daoType,
        }).then((v) => {
            toast({
                description: `create token accept proposa success \n tx: ${v}`,
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
                formHelperText="asd"
                startW='22%'
                helpers={errors
                    }
                rightAddon={new Map().set("propsal.action_delay", "min")}
            />
        </Flex>
    )
}

export default CreateAcceptPropoalWidget