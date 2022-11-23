import React, {useEffect, useState} from 'react'
import {
    Box,
    useToast,
} from '@chakra-ui/react'

import Back from "../components/back"
import HookForm from "../components/hookForm"
import MainViewLayout from '../components/mainViewLayout'
import {useSubAppContext} from '../contexts/SubAppContext'
import AutoCompleteInputWidget from "../components/autoCompleteInput"
import {
    stakeSBT,
    queryStakeTokenType,
    QueryStakeTypeResult,
    queryTokenStakeLimit,
    QueryTokenStakeLimitResult,
    queryTokenInfo,
    QueryTokenInfoResult
} from "../utils/api"

const StakePage = () => {

    const {dao} = useSubAppContext()
    const toast = useToast({
        title: 'Tips',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
    })

    const [loading, setLoading] = useState(false)
    // Todo loading?
    const [fetchingType, setFetchingType] = useState(true)
    const [fetchingTypeCfg, setFetchingTypeCfg] = useState(true)

    const [tokenTypeOptions, setTokenTypeOptions] = useState<Array<QueryStakeTypeResult>>([])
    const [tokenType, setTokenType] = useState<string>("")
    const [tokenTypeLimit, setTokenTypeLimit] = useState<QueryTokenStakeLimitResult>()
    const [tokenTypeLimits, setTokenTypeLimits] = useState<Map<string, Array<QueryTokenStakeLimitResult>>>(new Map())
    const [expectSBT, setExpectSBT] = useState(new Map().set("amount", `Expect sbt -`))
    const [tokenInfos, setTokenInfos] = useState<Map<String, QueryTokenInfoResult>>(new Map())

    useEffect(() => {
        setFetchingType(true)

        const fetch = async () => {
            queryStakeTokenType(dao.address, dao.daoType)
                .then(v => setTokenTypeOptions([...v]))
                .catch(console.log)
        }

        fetch().catch(() => setFetchingType(false))
    }, [])

    const onTokenTypeChange = async type => {
        console.log(type)
        setTokenType(type)
        setFetchingTypeCfg(true)

        try {
            const tokenStakeLimit = await queryTokenStakeLimit(dao.address, dao.daoType, type)
            console.log(tokenStakeLimit)
            setTokenTypeLimits(new Map(tokenTypeLimits).set(type, tokenStakeLimit))

            const tokenInfo = await queryTokenInfo(type)
            setTokenInfos(new Map().set(type, tokenInfo))
        } catch (e) {
            console.log(e)
        }

        setFetchingTypeCfg(false)
    }

    const onSubmit = async data => {
        console.log(tokenInfos)
        console.log(tokenInfos.get(tokenType))

        setLoading(true)
        const params = {
            amount: BigInt(data.amount * tokenInfos.get(tokenType).scaling_factor),
            lock_time: tokenTypeLimit?.lock_time,
            dao_type: dao.daoType,
            token_type: tokenType
        }

        try {
            const result = await stakeSBT(params)
            toast({
                description: `create upgrade proposa success\n tx: ${result}`,
                status: 'success',
            })
        } catch (e) {
            console.log(e)
            toast({
                description: `create upgrade proposa error \n err: ${e}`,
                status: 'error',
            })
        }
        setLoading(false)
    }

    const buildStakeCfgOptions = (): Array<string> => {
        if (tokenTypeLimits.get(tokenType)) {
            return tokenTypeLimits.get(tokenType)?.map(v => {
                return `Lock time: ${v.lock_time}, Weight: ${v.weight}`
            })
        }
        return []
    }

    const onStakeCfgChange = (v: string) => {
        let arr = v.trim().split(",")

        const lock_time = BigInt(arr[0].trim().split(":")[1])
        const weight = BigInt(arr[1].trim().split(":")[1])
        tokenTypeLimits.get(tokenType)?.map(v => {
            if (v.lock_time.toString() === lock_time.toString()) {
                setTokenTypeLimit({
                    lock_time: lock_time,
                    weight: weight
                })
            }
        })
    }

    return (
        <MainViewLayout
            header='Stake SBT'
            headerEl={Back('Back')}
        >
            <Box w='50%' margin='0 auto'>

                <AutoCompleteInputWidget
                    title="Token"
                    placeholder="first step"
                    options={tokenTypeOptions.map(v => v.type)}
                    onChange={onTokenTypeChange}
                />

                <AutoCompleteInputWidget
                    title="Stake config"
                    placeholder="after select"
                    options={buildStakeCfgOptions()}
                    onChange={onStakeCfgChange}
                />

                <HookForm
                    obj={{amount: 0n}}
                    loading={loading}
                    onChange={(k, v: number) => {
                        setExpectSBT(new Map().set("amount", `Expect sbt ${v * Number(tokenTypeLimit?.weight)}`))
                    }}
                    onSubmit={onSubmit}
                    helpers={expectSBT}
                    rightAddon={new Map().set("amount", `${tokenType === "" ? "" : tokenType.split("::")[2]}`)}
                />
            </Box>
        </MainViewLayout>
    )
}

export default StakePage