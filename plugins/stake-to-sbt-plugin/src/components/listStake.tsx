import React, {useState} from 'react'

import {
    Table,
    Thead,
    Tbody,
    Button,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
     Spinner,
     AlertDialog,
     AlertDialogBody,
     AlertDialogFooter,
     AlertDialogHeader,
     AlertDialogContent,
     AlertDialogOverlay,
     Box,
     AlertDialogCloseButton,
     useDisclosure,
} from '@chakra-ui/react'

import {Skeleton} from '@chakra-ui/react'
import TextBox from './TextBox'

const title = [
    'id',
    'stake time',
    'token',
    'lock time',
    'weight',
    'sbt',
    'expire time',
    'option',
]

const ListStake = (props) => {

    const [actionLoading, setActionLoading] = useState<Map<String, boolean>>(new Map())

    const onItemClick = (v :any, fouce?:boolean) => {

        console.log("onItemClick")
        setActionLoading(new Map(actionLoading.set(v.id, true)))
        console.log(actionLoading)

        props.onItemClick(v.id).finally(() => {
            console.log("onItemClick finally")
            setActionLoading(new Map(actionLoading.set(v.id, false)))
        })
    }

    const formatTime = (time) => {
        
        const now = new Date()

        console.log(now.getDate())    

        const date = new Date(time * 1000)

        if (now.getUTCDate() === date.getUTCDate()) {
            return `Today ${date.toLocaleTimeString()}`
        } else if (now.getUTCDate() - date.getUTCDate() === 1) {
            return `Yesterday ${date.toLocaleTimeString()}`
        } else {
            return date.toLocaleString()
        }
    }

    const formatExpire = (time:number, lock_time:number) => {

        const now = new Date()
        
        const expire = new Date(time * 1000)
        expire.setSeconds(lock_time)

        if (now.getTime() > expire.getTime()) {
            return "Expired"
        } else {
            return expire.toLocaleString()
        }
    }

    return (

<TableContainer>
            <Table variant='simple'>
                    <TableCaption> 
                        <TextBox>
                        {props.data ? `Time zone ${Intl.DateTimeFormat().resolvedOptions().timeZone}` : '' }
                        </TextBox>
                    </TableCaption>
                <Thead>
                    <Tr>
                        {
                            title.map((v, i) => (
                                <Th key={`!${i.toString()}`}>{v}</Th>
                            ))
                        }
                    </Tr>
                </Thead>
                <Tbody>
                    {props.data
                        ?
                        props.data.items.map((v, i) => (
                            <Tr key={`#${v.id.toString()}`}>
                            <Td>{v.id}</Td>
                            <Td>{formatTime(v.stake_time)}</Td>
                            <Td>{v.token.value}</Td>
                            <Td>{v.lock_time}</Td>
                            <Td>{v.weight}</Td>
                            <Td>{v.sbt_amount}</Td>
                            <Td>{formatExpire(v.stake_time, v.lock_time)}</Td>
                            <Td>
                                <Button w='46%' disabled={formatExpire(v.stake_time, v.lock_time) != "Expired"} onClick={() => {
                                    onItemClick(v)
                                }}>
                                    {actionLoading.get(v.id) ? <Spinner margin='0 auto'/> : "unstake"}
                                </Button>
                            </Td>
                        </Tr>
                        ))
                        :
                        <Tr>
                            {
                                title.map((v, i) => (
                                    <Td key={`@${i.toString()}`}>
                                        <Skeleton height='20px' isLoaded={props.data}/>
                                    </Td>
                                ))
                            }
                        </Tr>
                    }
                </Tbody>
            </Table>
        </TableContainer>
    )
}

export default ListStake