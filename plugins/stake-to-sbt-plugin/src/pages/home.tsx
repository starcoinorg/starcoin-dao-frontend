import React, {
    useEffect,
    useState
} from 'react'
import {
    Flex,
    Button,
    Heading,
    Select,
    HStack,
    Spinner,
} from '@chakra-ui/react'
import {MdAdd} from 'react-icons/md'
import {GoSettings} from 'react-icons/go'
import {useHistory} from 'react-router-dom'

import {
    queryStakeList,
    unstakeSBT,
    unstakeAllSBT,
    nweUnstakeParams,
    queryStakeTokenType,
    QueryStakeTypeResult, queryTokenInfo, QueryTokenInfoResult
} from "../utils/api"
import TextBox from "../components/TextBox"
import ListStake from "../components/listStake"
import MainViewLayout from '../components/mainViewLayout'
import {useSubAppContext} from '../contexts/SubAppContext'

const HomePage = () => {
    const {dao} = useSubAppContext()

//    const toast = useToast({
//        title: 'Tips',
//        duration: 3000,
//        position: 'top-right',
//        isClosable: true,
//    })

    const history = useHistory()

    const [loading, setLoading] = useState(true)
    const [unStakeloading, setUnStakeloading] = useState(false)
//    const [listPages, setListPages] = useState({
//        total: 0,
//        index: 0,
//        limitCount: 6,
//    })

    const [tokenType, setTokenType] = useState<string>("")
    const [tokenTypes, setTokenTypes] = useState<Array<QueryStakeTypeResult>>()
    const [listData, setListData] = useState<any>()
    const [refreshLoading, setRefreshLoading] = useState(false)
    const [tokenInfos, setTokenInfos] = useState<Map<String, QueryTokenInfoResult>>(new Map())

    useEffect(() => {
        const initFetch = async () => {
            const result = await queryStakeTokenType(dao.address, dao.daoType)
            setTokenTypes(result)

            const defaultToken = result[0].type
            setTokenType(defaultToken)
            await fetchData(defaultToken)
        }

        initFetch().catch(console.log).finally(() => setLoading(false))
    }, [])

    const fetchData = async (tokenType: string) => {
        try {

            const tokenInfo = await queryTokenInfo(tokenType)
            setTokenInfos(new Map().set(tokenType, tokenInfo))

            const stakeList = await queryStakeList(
                dao.address,
                {
                    dao_type: dao.daoType,
                    token_type: tokenType
                },
            )

            setListData(stakeList)
        } catch (e) {
            console.log(e)
        }
    }

    const onRefresh = async () => {

        setRefreshLoading(true)
        await fetchData(tokenType)
        setRefreshLoading(false)
    }

    const onStakeTokenTypeChange = async (v) => {
        const {target} = v
        const type = target.selectedOptions[0].value

        setLoading(true)
        setListData(undefined)
        setTokenType(type)

        await fetchData(type)

        setLoading(false)
    }

    const unStakeAll = async () => {
        try {
            setUnStakeloading(true)
            await unstakeAllSBT({dao_type: dao.daoType, token_type: tokenType})
        } catch (e) {
            console.log(e)
        }
        setUnStakeloading(false)
    }

    const unStake = async (id) => {
        try {
            const v = await unstakeSBT(nweUnstakeParams(dao.daoType, tokenType, id))
//            toast({
//                status: 'success',
//                description: `Unstake of id ${id} is success \n tx: ${v}`,
//            })
            await fetchData(tokenType)
        } catch (e) {
            console.log(e)
//            toast({
//                status: 'error',
//                description: `error ${e}`,
//            })
        }
    }

    return (
        <MainViewLayout
            header='Stake SBT List'
            headerEl={
                <Flex direction='row'>
                    <Button
                        size='md'
                        rightIcon={<MdAdd/>}
                        title='Stake'
                        onClick={() => {
                            history.push('/stake')
                        }}
                    >
                        Stake
                    </Button>
                    <Button
                        ms='4'
                        rightIcon={<GoSettings/>}
                        title='Setting'
                        onClick={() => {
                            history.push('/setting')
                        }}
                    >
                        Setting
                    </Button>
                </Flex>
            }
        >
            <HStack spacing={6} mb={6}>
                <HStack>
                    <TextBox>Token</TextBox>
                    <Select onChange={onStakeTokenTypeChange}>
                        {
                            tokenTypes?.map((v, i) => (
                                <option key={i.toString()} value={v.type}>{v.title}</option>
                            ))
                        }
                    </Select>
                </HStack>
                <HStack>
                    <TextBox>CreateAt</TextBox>
                    <Select placeholder='All'>
                    </Select>
                </HStack>
                <HStack>
                    <TextBox>Expire</TextBox>
                    <Select placeholder='All'>
                    </Select>
                </HStack>
                {
                    listData ? <Button
                        disabled={unStakeloading}
                        onClick={unStakeAll}>
                        {unStakeloading ? <Spinner margin='0 auto'/> : "Unstake all"}
                    </Button> : <></>
                }
                <Button onClick={onRefresh}>
                    {refreshLoading ? <Spinner margin='0 auto'/> : "Refresh"}
                </Button>
            </HStack>
            {
                !loading && !listData
                    ?
                    <Flex direction='column' mt={20}>
                        <Heading margin='0 auto'>You haven't stake.</Heading>
                        <TextBox margin='0 auto' mt={4}>
                            Welcome 👏 Let's get stared.
                        </TextBox>
                        <Button
                            w='15%'
                            margin='0 auto'
                            mt={6}
                            onClick={() => history.push(`/stake`)}
                        >
                            Stake Your First SBT
                        </Button>
                    </Flex>
                    :
                    <Flex direction='column'>
                        <ListStake
                            data={listData}
                            tokenInfo={tokenInfos.get(tokenType)}
                            onItemClick={unStake}/>
                        <Flex justifyContent="space-between" m={4} alignItems="center">

                        </Flex>
                    </Flex>
            }
        </MainViewLayout>
    )
}

export default HomePage