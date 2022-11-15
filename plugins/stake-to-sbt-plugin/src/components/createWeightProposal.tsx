import React, {useState, useEffect} from 'react'
import {Flex, useToast} from '@chakra-ui/react'
import HookForm from "./hookForm"
import {
    newCreateWeightProposalParams,
    createWeightProposal,
    queryStakeTokenType,
    QueryStakeTypeResult
} from '../utils/stakeSBTPluginAPI'
import AutoCompleteInputWidget from './autoCompleteInput'

const CreateWeightProposalWidget = (props) => {

    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [tokenType, setTokenType] = useState("")
    const [tokenTypeOptions, setTokenTypeOptions] = useState<Array<QueryStakeTypeResult>>([])

    useEffect(() => {
        if (tokenTypeOptions.length == 0) {
            console.log(props.dao.daoType)
            queryStakeTokenType(props.dao.address, props.dao.daoType).then((v) => {
                setTokenTypeOptions([...v])
                console.log(v)
            }).catch(
                console.log
            ).finally(()=>setLoading(false))
        }
    }, [])

    const onSubmit = async data => {

        setLoading(true)
        createWeightProposal({
            ...data,
            dao_type: props.dao.daoType,
            plugin_type: tokenType
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
            <AutoCompleteInputWidget
                options={tokenTypeOptions.map(v => v.type)}
                onChange={setTokenType}
            />
            <HookForm
                obj={newCreateWeightProposalParams()}
                loading={loading}
                onSubmit={onSubmit}
                rightAddon={new Map().set("action_delay", "min")}
            />
        </Flex>
    )
}

export default CreateWeightProposalWidget