import React, {useEffect, useState} from 'react'
import {
    Box,
    Spinner,
    useToast,
} from '@chakra-ui/react'

import Back from "../components/back"
import HookForm from "../components/hookForm"
import MainViewLayout from '../components/mainViewLayout'
import { useSubAppContext } from '../contexts/SubAppContext'
import AutoCompleteInputWidget from "../components/autoCompleteInput"
import {
    stakeSBT,
    queryStakeTokenType,
    QueryStakeTypeResult,
    queryTokenStakeLimit,
    QueryTokenStakeLimitResult,
    queryTokenInfo,
    queryTokenInfoResult
} from "../utils/stakeSBTPluginAPI"


const StakePage = () => {

    const {dao} = useSubAppContext()
    const toast = useToast({
        title: 'Tips',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
    })

    const [loading, setLoading] = useState(false)
    const [fetchingType, setFetchingType] = useState(true)
    const [fetchingTypeCfg, setFetchingTypeCfg] = useState(true)

    const [tokenTypeOptions, setTokenTypeOptions] = useState<Array<QueryStakeTypeResult>>([])
    const [tokenType, setTokenType] = useState("")
    const [tokenTypeLimit, setTokenTypeLimit] = useState<QueryTokenStakeLimitResult>()
    const [tokenTypeLimits, setTokenTypeLimits] = useState<Map<string, Array<QueryTokenStakeLimitResult>>>(new Map())
    const [expectSBT, setExpectSBT] = useState()
    const [tokenInfos, setTokenInfos] = useState<Map<String, queryTokenInfoResult>>(new Map())

    useEffect(() => {
        setFetchingType(true)

        queryStakeTokenType(dao.address, dao.daoType)
            .then(v => setTokenTypeOptions([...v]))
            .catch(console.log)
            .finally(() => setFetchingType(false))
    
        queryTokenInfo().then(v => setTokenInfos(v)).catch(console.log)
    }, [])

    const onTokenTypeChange = type => {
        setTokenType(type)
        setFetchingTypeCfg(true)
        queryTokenStakeLimit(dao.address, dao.daoType, type).then(limit => {
            setFetchingTypeCfg(false)
            console.log(limit)
            setTokenTypeLimits(new Map(tokenTypeLimits).set(type, limit))
        })
    }

    const onSubmit = data => {
        setLoading(true)
        stakeSBT({
            amount: BigInt(data.amount * tokenInfos.get(tokenType).scaling_factor),
            lock_time: tokenTypeLimit?.lock_time,
            dao_type: dao.daoType,
            token_type: tokenType
        }).then(v => {
            console.log(v)
            toast({
                description: `create upgrade proposa success\n tx: ${v}`,
                status: 'success',
            })
        }).catch(e => {
            console.log(e)
            toast({
                description: `create upgrade proposa error \n err: ${e}`,
                status: 'error',
            })
        }).finally(() => setLoading(false))
    }

    return (
        <MainViewLayout
            header='Stake SBT'
            headerEl={Back('Back')}
        >
            <Box w='50%' margin='0 auto'>

                    <AutoCompleteInputWidget
                    title="Token"
                    options={tokenTypeOptions.map(v => v.type)}
                    onChange={onTokenTypeChange}
                />

                    <AutoCompleteInputWidget
                    title="Stake config"
                    options={
                        tokenTypeLimits.get(tokenType) ?
                        tokenTypeLimits.get(tokenType)?.map(v => `Lock time: ${v.lock_time}, Weight: ${v.weight}`)
                        : []
                    }
                    onChange={
                        (v:string) => {

                            let arr= v.trim().split(",")

                            const lock_time = BigInt(arr[0].trim().split(":")[1])
                            const weight = BigInt(arr[1].trim().split(":")[1])
                            tokenTypeLimits.get(tokenType)?.map(v=> {
                                if (v.lock_time.toString() === lock_time.toString()) {
                                    setTokenTypeLimit({
                                        lock_time:lock_time,
                                        weight:weight
                                    })
                                }
                            })
                        }
                    }
                    />

                <HookForm
                obj={{amount: 0n}}
                 loading={loading}
                  onChange={(k, v:number) => {

                    setExpectSBT(new Map().set("amount", `Expect sbt ${v * Number(tokenTypeLimit?.weight)}`))
                }}
                onSubmit={onSubmit}
                helpers={expectSBT}
                />
            </Box>
        </MainViewLayout>
    )
}

export default StakePage