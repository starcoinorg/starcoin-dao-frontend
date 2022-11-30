import React, {
    useState
} from 'react'
import {
    Flex,
    useToast
} from '@chakra-ui/react'

import HookForm from "./hookForm"
import {
    newCreateWeightProposalParams,
    createWeightProposal,
} from '../utils/api'

const CreateWeightProposalWidget = (props) => {

    const {daoType} = props.dao
    const {tokenType} = props

    const toast = useToast()
    const [loading, setLoading] = useState(false)

    const onSubmit = async data => {
        data.sbt.lock_time = data.sbt.lock_time * 60
        data.propsal.action_delay = data.propsal.action_delay * 60 * 1000
        data.propsal.extend = "{}"
        
        setLoading(true)
        createWeightProposal({
            ...data,
            dao_type: daoType,
            token_type: tokenType
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
                obj={newCreateWeightProposalParams(`Apply new Token Weight in ${tokenType}`)}
                loading={loading}
                onSubmit={onSubmit}
                startW='22%'
                rightAddon={new Map().set("propsal.action_delay", "min").set("sbt.lock_time", "min")}
            />
        </Flex>
    )
}

export default CreateWeightProposalWidget