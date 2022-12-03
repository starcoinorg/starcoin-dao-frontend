import React, {useEffect, useState} from 'react'
import {
    Flex,
    Button,
    FormControl,
    Input,
    InputGroup,
    InputLeftAddon,
    NumberInput,
    NumberInputField,
    InputRightAddon,
    Select,
    Box,
    FormHelperText,
} from '@chakra-ui/react'

import {useForm} from 'react-hook-form'
import MainViewLayout from '../components/mainViewLayout'
import TextBox from '../components/TextBox'
import {
    Action,
    createProposal, queryTokenInfo, QueryTokenInfoResult,
    queryWithdrawToken,
    QueryWithdrawTokenResult
} from "../utils/api"
import {useSubAppContext} from '../contexts/SubAppContext'
import {isValidateAddress} from "../utils/stcWalletSdk";

const From = (props) => {

    return (<FormControl id={props.name} mb={4}>
        <InputGroup>
            <InputLeftAddon bg='transparent' w='16%'>
                <TextBox size='sm'>
                    {props.title}
                </TextBox>
            </InputLeftAddon>
            {props.type == "number" ?
                <NumberInput w='100%' defaultValue={props.defaultValue}>
                    <NumberInputField
                        ref={props.reg}
                        name={props.name}
                        borderTopStartRadius='0'
                        borderBottomStartRadius='0'
                        borderTopEndRadius={props.right ? 0 : 5}
                        borderBottomEndRadius={props.right ? 0 : 5}
                    />
                </NumberInput> :
                <Input ref={props.reg}
                       defaultValue={props.defaultValue}
                       borderColor='white'
                       color='white'
                       onChange={v => {
                           if (props.onChange) {
                               props.onChange(v)
                           }
                       }}
                       placeholder={props.title + "..."}
                       autocomplete="off"
                       name={props.name}/>
            }
            {
                props.right ?
                    <InputRightAddon minW='30%'>
                        <TextBox size='sm' margin='0 auto'>
                            {props.right}
                        </TextBox>
                    </InputRightAddon> :
                    <></>
            }
        </InputGroup>

        {
            props.helper ?
                <FormHelperText>
                    props.helper
                </FormHelperText>
                :
                <></>
        }
    </FormControl>)
}

const HomePage = () => {

    const {dao} = useSubAppContext()
    const [loading, setLoading] = useState(false)
    const {register, handleSubmit} = useForm()
    const [action, setAction] = useState<Action>({
        dao_type: "-",
        title: "",
        introduction: "",
        action_delay: 5n,
    })

    const [withdrawTokens, setWithdrawTokens] = useState<Array<QueryWithdrawTokenResult>>([])
    const [withdrawToken, setWithdrawToken] = useState<QueryWithdrawTokenResult>()
    const [tokenInfos, setTokenInfos] = useState<Map<string, QueryTokenInfoResult>>(new Map())
    const [addressError, setAddressError] = useState(null)

    useEffect(() => {
        const fetch = async () => {
            const result = await queryWithdrawToken(dao.address)
            setWithdrawToken(result[0])
            setWithdrawTokens(result)

            await _queryTokenInfo(result[0].token)
        }

        fetch().catch(console.log).finally(() => setLoading(false))
    }, [])

    const _queryTokenInfo = async (token) => {
        try {
            const result = await queryTokenInfo(token)
            setTokenInfos(new Map(tokenInfos).set(token, result))
        } catch (e) {
            console.log(e)
        }
    }

    const onWithdrawTokenChange = async (v) => {
        const {target} = v
        const type = target.selectedOptions[0].value

        for (const i in withdrawTokens) {
            if (withdrawTokens[i].token === type) {
                setWithdrawToken(withdrawTokens[i])
                break
            }
        }

        await _queryTokenInfo(v)
    }
    const onSubmit = data => {

        setLoading(true)

        data.amount = Number(data.amount) * tokenInfos.get(withdrawToken.token).scaling_factor

        setAction(data)

        data.extend = "{}"
        data.action_delay = data.action_delay * 60 * 1000

        createProposal({...data, dao_type: dao.daoType}).then(v => {
        }).catch(e => {
            console.log(e)
        }).finally(() => setLoading(false))
    }

    return (
        <MainViewLayout
            header='Withdraw'
        >
            <Flex
                as='form'
                onSubmit={handleSubmit(onSubmit)}
                direction='column'
                w='100%'
            >

                <TextBox size='xs' mb={2} mt={2}>
                    Withdraw
                </TextBox>

                <FormControl id='amount' mb={4}>
                    <InputGroup>
                        <InputLeftAddon bg='transparent' w='16%'>
                            <TextBox size='sm'>
                                Amount
                            </TextBox>
                        </InputLeftAddon>
                        <NumberInput w='100%' defaultValue='0'>
                            <NumberInputField
                                ref={register({required: true})}
                                name='amount'
                                borderRadius='0'
                            />
                        </NumberInput> :
                        <InputRightAddon minW='30%'>
                            <TextBox size='sm'>
                                <Select w='100%' ref={register({required: true})} onChange={onWithdrawTokenChange}
                                        name='token_type' border=''
                                        _focus={{border: "black"}}>
                                    {withdrawTokens.map(value => (
                                        <Box as='option' w='100%' key={value.token}>
                                            {value.token}
                                        </Box>
                                    ))}
                                </Select>
                            </TextBox>
                        </InputRightAddon> :
                        <></>
                    </InputGroup>
                    {
                        withdrawToken ? <FormHelperText
                                mt='2'>
                                Blance: {withdrawToken.balance / tokenInfos.get(withdrawToken.token)?.scaling_factor} </FormHelperText>
                            : <></>
                    }
                </FormControl>

                <From
                    reg={register({required: true})}
                    defaultValue={action.receiver}
                    title='Receiver'
                    onChange={
                        v => {
                            if (!isValidateAddress(v)) {
                                setAddressError('Invalid address')
                            } else {
                                setAddressError(null)
                            }
                        }
                    }
                    helper={addressError}
                    name='receiver'/>

                <TextBox size='xs' mb={2} mt={2}>
                    Proposal
                </TextBox>

                <From
                    reg={register({required: true})}
                    defaultValue={action.title}
                    title='Title'
                    name='title'/>

                <From
                    reg={register({required: true})}
                    defaultValue={action.introduction}
                    title='Introduction'
                    name='introduction'/>

                <From
                    reg={register({required: true})}
                    defaultValue={action.action_delay}
                    type='number'
                    title='Action delay'
                    right='min'
                    name='action_delay'/>

                <Button type='submit' disabled={loading} my={4}>
                    Submit
                </Button>

            </Flex>
        </MainViewLayout>
    )
}

export default HomePage