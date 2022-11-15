import React, {useEffect, useState} from 'react';
import {
    Box,
    useToast,
} from '@chakra-ui/react';

import MainViewLayout from '../components/mainViewLayout';
import HookForm from "../components/hookForm";
import Back from "../components/back";
import {
    queryStakeTokenType,
    QueryStakeTypeResult,
    stakeSBT, queryTokenStakeLimit, QueryTokenStakeLimitResult
} from "../utils/stakeSBTPluginAPI";
import { useSubAppContext } from '../contexts/SubAppContext'
import AutoCompleteInputWidget from "../components/autoCompleteInput";

const Stake = () => {

    const {dao} = useSubAppContext();
    const toast = useToast({
        title: 'Tips',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
    });

    const [loading, setLoading] = useState(false);

    const [tokenTypeOptions, setTokenTypeOptions] = useState<Array<QueryStakeTypeResult>>([])
    const [tokenType, setTokenType] = useState("")
    const [tokenTypeLimits, setTokenTypeLimits] = useState<Map<string, QueryTokenStakeLimitResult>>(new Map())

    useEffect(() => {
        setLoading(true)
        queryStakeTokenType(dao.daoType)
            .then(v => setTokenTypeOptions([...v]))
            .catch(console.log)
            .finally(() => setLoading(false))
    }, [])

    const onTokenTypeChange = type => {
        setTokenType(type)
        queryTokenStakeLimit(dao.daoType, type).then(limit => {
            setTokenTypeLimits(new Map(tokenTypeLimits).set(type, limit))
        })
    }

    const onSubmit = data => {
        setLoading(true);
        stakeSBT({
            ...data,
            lock_time: 60000n,
            dao_type: dao.daoType,
            plugin_type: tokenType
        }).then(v => {
            console.log(v)
            toast({
                description: `create upgrade proposa success\n tx: ${v}`,
                status: 'success',
            })
        }).catch(e => {
            toast({
                description: `create upgrade proposa error \n err: ${e}`,
                status: 'error',
            })
        }).finally(() => setLoading(false))
    }

    let helper = ""

    if (tokenTypeLimits.get(tokenType)) {
        helper = `Lock Time ${tokenTypeLimits.get(tokenType)?.lock_time}, Weight ${tokenTypeLimits.get(tokenType)?.weight}`
    }

    return (
        <MainViewLayout
            header='Stake SBT'
            headerEl={Back('Back')}
        >
            <Box w='50%' margin='0 auto'>

                <AutoCompleteInputWidget
                    options={tokenTypeOptions.map(v => v.type)}
                    onChange={onTokenTypeChange}
                    helper={helper}
                />

                <HookForm obj={{amount: 0n}} loading={loading} onSubmit={onSubmit}/>
            </Box>
        </MainViewLayout>
    )
}

export default Stake;