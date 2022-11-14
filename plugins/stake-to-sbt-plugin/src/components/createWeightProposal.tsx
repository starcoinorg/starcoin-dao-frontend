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
            queryStakeTokenType(props.dao.dao_type).then((v) => {
                setTokenTypeOptions([...v])
                setLoading(false)
            }).catch(e => {
                console.log(e)
                setLoading(false)
            })
        }
    }, [])

    const onSubmit = async data => {

        console.log(`data ${data}`)

        console.log(newCreateWeightProposalParams())
        console.log(data)

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
            />
        </Flex>
    )
}

export default CreateWeightProposalWidget