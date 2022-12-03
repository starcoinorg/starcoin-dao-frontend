import React, {useEffect, useState} from 'react'
import {
    Box,
    Select,
    FormControl,
    InputGroup,
    InputLeftAddon, FormHelperText,
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
import TextBox from "../components/TextBox";
import {formatLockTime} from "../utils/formt";

const StakePage = () => {

    const {dao} = useSubAppContext()

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
    const [amount, setAmount] = useState(0);

    useEffect(() => {
        setFetchingType(true)

        const fetch = async () => {
            const result = await queryStakeTokenType(dao.address, dao.daoType)
            setTokenTypeOptions([...result])

            setTokenType(result[0].type)
            await fetchTypeCfg(result[0].type)
        }

        fetch().catch(console.log)

        setFetchingType(false)
    }, [])

    const fetchTypeCfg = async (type) => {
        setFetchingTypeCfg(true)

        try {
            const _tokenStakeLimit = await queryTokenStakeLimit(dao.address, dao.daoType, type)
            setTokenTypeLimit(_tokenStakeLimit[0])
            setTokenTypeLimits(new Map(tokenTypeLimits).set(type, _tokenStakeLimit))

            const tokenInfo = await queryTokenInfo(type)
            setTokenInfos(new Map().set(type, tokenInfo))

            if (_tokenStakeLimit[0]) {
                updateExpectSBT(amount, _tokenStakeLimit[0])
            } else {
                console.log("aalll")
                updateExpectSBT(amount, _tokenStakeLimit[0], "-")
            }

        } catch (e) {
            console.log(e)
        }

        setFetchingTypeCfg(false)
    }

    const onTokenTypeChange = async v => {

        const {target} = v
        const type = target.selectedOptions[0].value

        setTokenType(type)

        await fetchTypeCfg(type)
    }

    const onSubmit = async data => {

        setLoading(true)

        if (!tokenTypeLimit) {
            return
        }

        const params = {
            amount: BigInt(data.amount * tokenInfos.get(tokenType).scaling_factor),
            lock_time: tokenTypeLimit?.lock_time,
            dao_type: dao.daoType,
            token_type: tokenType
        }

        try {
            const result = await stakeSBT(params)
//            toast({
//                description: `create upgrade proposa success\n tx: ${result}`,
//                status: 'success',
//            })
        } catch (e) {
            console.log(e)
//            toast({
//                description: `create upgrade proposa error \n err: ${e}`,
//                status: 'error',
//            })
        }
        setLoading(false)
    }

    const buildStakeCfgOptions = (): Array<any> => {
        if (tokenTypeLimits.get(tokenType)) {
            return tokenTypeLimits.get(tokenType)?.map(v => {
                return v
            })
        }
        return []
    }

    const onStakeCfgChange = v => {
        const {target} = v
        const type = target.selectedOptions[0].value
        const limit = tokenTypeLimits.get(tokenType)[type]
        setTokenTypeLimit(limit)
        updateExpectSBT(amount, limit)
    }

    const updateExpectSBT = (v, limit?, def?) => {

        let weight = 0
        if (limit) {
            weight = limit.weight
        } else {
            weight = tokenTypeLimit?.weight
        }

        setExpectSBT(new Map().set("amount", `Expect sbt ${def ? def : v * Number(weight)}`))
    }

    return (
        <MainViewLayout
            header='Stake SBT'
            headerEl={Back('Back')}
        >
            <Box w='50%' margin='0 auto'>

                <FormControl>
                    <InputGroup>
                        <InputLeftAddon bg='transparent' w='20%'>
                            <TextBox size='sm'>
                                Token
                            </TextBox>
                        </InputLeftAddon>
                        <Select
                            onChange={onTokenTypeChange}
                            borderTopStartRadius='0'
                            borderBottomStartRadius='0'
                            borderColor='white'
                            color='white'
                        >
                            {
                                tokenTypeOptions?.map((v, i) => (
                                    <option key={i.toString()} value={v.type}>{v.type}</option>
                                ))
                            }
                        </Select>
                    </InputGroup>
                </FormControl>

                <FormControl mt='4' mb='4'>
                    <InputGroup>
                        <InputLeftAddon bg='transparent' w='20%'>
                            <TextBox size='sm'>
                                Stake config
                            </TextBox>
                        </InputLeftAddon>
                        <Select
                            onChange={onStakeCfgChange}
                            borderTopStartRadius='0'
                            borderBottomStartRadius='0'
                            borderColor='white'
                            color='white'
                        >
                            {
                                buildStakeCfgOptions()?.map((v, i) => (
                                    <option key={i.toString()}
                                            value={i}>{`Lock time: ${formatLockTime(v.lock_time)}, Weight: ${v.weight}`}</option>
                                ))
                            }
                        </Select>
                    </InputGroup>
                    {
                        tokenTypeLimit ? <></> : <FormHelperText>
                            There is no weight
                        </FormHelperText>
                    }
                </FormControl>

                <HookForm
                    obj={{amount: 0n}}
                    loading={loading}
                    onChange={(v) => {
                        if (v.id === 'amount') {
                            setAmount(v.value)
                            updateExpectSBT(v.value)
                        }
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