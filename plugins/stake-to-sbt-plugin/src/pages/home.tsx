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
    useToast,
} from '@chakra-ui/react'
import {MdAdd} from 'react-icons/md'
import {GoSettings} from 'react-icons/go'
import {useHistory} from 'react-router-dom'

import {
    queryStakeCount,
    queryStakeList,
    unstakeSBT,
    unstakeAllSBT,
    nweUnstakeParams,
    queryStakeTokenType,
    QueryStakeTypeResult
} from "../utils/api"
import TextBox from "../components/TextBox"
import ListStake from "../components/listStake"
import MainViewLayout from '../components/mainViewLayout'
import {useSubAppContext} from '../contexts/SubAppContext'

const HomePage = () => {
    const {dao} = useSubAppContext()

    const toast = useToast({
        title: 'Tips',
        duration: 3000,
        position: 'top-right',
        isClosable: true,
    })

    const history = useHistory()

    const [loading, setLoading] = useState(true)
    const [unStakeloading, setUnStakeloading] = useState(false)
    const [listPages, setListPages] = useState({
        total: 0,
        index: 0,
        limitCount: 10,
    })

    const [tokenType, setTokenType] = useState<string>("")
    const [tokenTypes, setTokenTypes] = useState<Array<QueryStakeTypeResult>>()
    const [listData, setListData] = useState<any>()
    const [refreshLoading, setRefreshLoading] = useState(false)

    useEffect(() => {
        queryStakeTokenType(dao.address, dao.daoType)
            .then(v => {
                setTokenTypes(v)
                setTokenType(v[0].type)
                fetch(v[0].type)
            })
            .catch(e => {
                console.log(e)
                setLoading(false)
            })
    }, [])

    const fetch = (tokenType: string) => {
        console.log(`fetch ${tokenType}`)
        queryStakeCount({
            dao_type: dao.daoType,
            token_type: tokenType
        }).then(v => {
            setListPages({
                ...listPages,
                total: v[0]
            })
            queryStakeList({
                dao_type: dao.daoType,
                token_type: tokenType
            }).then(setListData)
                .finally(() => {
                    setLoading(false)
                    setRefreshLoading(false)
                })
        }).catch(e => {
            console.log(e)
            setLoading(false)
            setRefreshLoading(false)
        })
    }

    const unStakeAll = async () => {
        try {
            const result = await unStakeAll()
        } catch (e) {
            console.log(e)
        }
    }

    const unStake = async (id) => {
        try {
            const v = await unstakeSBT(nweUnstakeParams(dao.daoType, tokenType, id))
            toast({
                status: 'success',
                description: `Unstake of id ${id} is success \n tx: ${v}`,
            })
            fetch(tokenType)
        } catch (e) {
            console.log("haha")
            toast({
                status: 'error',
                description: `error ${e}`,
            })
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
                            onClick={() => {
                                history.push(`/stake`)
                            }}
                        >
                            Stake Your First SBT
                        </Button>
                    </Flex>
                    :
                    <Flex direction='column'>
                        {
                            listData ? <HStack spacing={6} mb={6}>
                                <HStack>
                                    <TextBox>Token</TextBox>
                                    <Select>
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
                                <Button
                                    disabled={unStakeloading}
                                    onClick={
                                        () => {
                                            setUnStakeloading(true)
                                            unstakeAllSBT({dao_type: dao.daoType, token_type: tokenType})
                                                .catch(console.log)
                                                .finally(() => setUnStakeloading(false))
                                        }
                                    }>
                                    {unStakeloading ? <Spinner margin='0 auto'/> : "Unstake all"}
                                </Button>
                                <Button onClick={() => {
                                    setRefreshLoading(true)
                                    fetch(tokenType)
                                }}>
                                    {refreshLoading ? <Spinner margin='0 auto'/> : "Refresh"}

                                </Button>
                            </HStack> : <div/>
                        }
                        <ListStake data={listData} onItemClick={unStake}/>
                    </Flex>
            }

        </MainViewLayout>
    )
}

export default HomePage;