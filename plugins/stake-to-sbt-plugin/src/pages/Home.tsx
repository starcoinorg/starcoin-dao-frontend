import React, {useEffect, useState} from 'react'
import {
    Flex,
    Button,
    Heading, Switch, Select, HStack, useToast,
} from '@chakra-ui/react'

import {MdAdd} from 'react-icons/md'
import {GoSettings} from 'react-icons/go'

import {useHistory} from 'react-router-dom'

import ListStake from "../components/listStake"
import MainViewLayout from '../components/mainViewLayout'
import {
    queryStakeCount,
    queryStakeList,
    unstakeSBT,
    nweUnstakeParams,
    queryStakeTokenType,
    QueryStakeTypeResult
} from "../utils/stakeSBTPluginAPI"
import TextBox from "../components/TextBox";
import { useSubAppContext } from '../contexts/SubAppContext'
import DaoProvider from 'src/contexts/DaoContext'

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
    const [listPages, setListPages] = useState({
        total: 0,
        index: 0,
        limitCount: 10,

    })
    const [tokenType, setTokenType] = useState<string>("")
    const [tokenTypes, setTokenTypes] = useState<Array<QueryStakeTypeResult>>()
    const [listData, setListData] = useState<any>()

    console.log(dao)

    useEffect(() => {
        queryStakeTokenType(dao.daoType)
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
            plugin_type: tokenType
        }).then(v => {
            setListPages({
                ...listPages,
                total: v[0]
            })
            queryStakeList({
                dao_type: dao.daoType,
                plugin_type: tokenType
            }).then(setListData)
            .finally(() => setLoading(false))
        }).catch(e => {
            console.log(e)
            setLoading(false)
        })
    }

    const unStake = async (id) => {
        try {
           const v =  await unstakeSBT(nweUnstakeParams(dao.daoType, tokenType, id))
           toast({
               status: 'success',
               description: `unStake of id ${id} success \n tx: ${v}`,
           })
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
                            history.push(`/stake`)
                        }}
                    >
                        Stake
                    </Button>
                    <Button
                        ms='4'
                        rightIcon={<GoSettings/>}
                        title='Setting'
                        onClick={() => {
                            history.push(`/setting`)
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
                    <Flex direction='column'>
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
                            listData?<HStack spacing={6} mb={6}>
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
                            <HStack w='10%'>
                                <TextBox>CreateAt</TextBox>
                                <Select placeholder='All'>
                                </Select>
                            </HStack>
                            <HStack w='10%'>
                                <TextBox>Expire</TextBox>
                                <Select placeholder='All'>
                                </Select>
                            </HStack>
                            <Button>
                                Unstake all
                            </Button>
                        </HStack>:<div/>
                        }
                        <ListStake data={listData}  onItemClick={unStake}/>
                    </Flex>
            }

        </MainViewLayout>
    )
}

export default HomePage;