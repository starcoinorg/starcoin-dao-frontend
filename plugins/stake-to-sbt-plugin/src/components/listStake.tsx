import React, {useEffect, useState} from 'react'

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
    'lock status',
    'option',
]

const ListStake = (props) => {

    const [actionLoading, setActionLoading] = useState<Map<String, boolean>>(new Map())
    const [data, setData] = useState()

    const onItemClick = (v: any, fouce?: boolean) => {

        setActionLoading(new Map(actionLoading.set(v.id, true)))
        console.log(actionLoading)

        props.onItemClick(v.id).finally(() => {
            setActionLoading(new Map(actionLoading.set(v.id, false)))
        })
    }

    const formatTime = (time) => {
        const now = new Date()
        const date = new Date(time * 1000)

        if (now.getUTCDate() === date.getUTCDate()) {
            return `Today ${date.toLocaleTimeString()}`
        } else if (now.getUTCDate() - date.getUTCDate() === 1) {
            return `Yesterday ${date.toLocaleTimeString()}`
        } else {
            return date.toLocaleString()
        }
    }

    const formatExpire = (time: number, lock_time: number) => {
        const now = new Date()
        const expire = new Date(time * 1000)
        expire.setSeconds(lock_time)

        if (now.getTime() > expire.getTime()) {
            return `Unlocked`
        } else {
            return `Locking ${expire.toLocaleString()}`
        }
    }

    const formatLockTime = (time: number) => {

        let remain = time
        let c = ""

        const hour = 60 * 60
        if (remain > hour) {
            const s = Math.floor((remain / hour))
            c += `${s} hours `
            remain = remain - s * hour
        }

        const minute = 60
        if (remain > minute) {
            const s = Math.floor((remain / minute))
            c += `${s} minutes `
            remain = remain - s * minute
        }

        if (remain > 0) {
            c += `${remain} seconds`
        }

        return c
    }

    const formatAmount = (amount: number) => {
        if (amount < 100) {
            return amount
        }

        let nAmount = amount.toString()
        let length = nAmount.length

        let s = Math.floor(length / 3)

        for (let i = 1; i <= s; i++) {
            const p = nAmount.substring(0, i * 3 + i - 1)
            const b = nAmount.substring(i * 3 + i - 1, nAmount.length)
            if (b == "") {
                continue
            }
            nAmount = p + "," + b
        }

        return nAmount
    }

    const countAmount = () => {
        let v = 0

        if (props.data) {

            for (const i in props.data.items) {
                v += props.data.items[i].token.value / props.tokenInfo.scaling_factor
                console.log(props.data.items[i].sbt_amount)
            }

        }

        return v
    }

    const countSbt = () => {
        let v = 0

        if (props.data) {

            for (const i in props.data.items) {
                v += props.data.items[i].token.value / props.tokenInfo.scaling_factor
                console.log(props.data.items[i].sbt_amount)
            }

        }

        return v
    }

    useEffect(() => {
        if (!props.data) {
            return
        }

        let countToken = 0
        let countSbt = 0
        const items = props.data.items.map(v => {
            countToken += v.token.value
            countSbt += v.sbt_amount

            return {
                id: v.id,
                stake_time: formatTime(v.stake_time),
                token: formatAmount(v.token.value / props.tokenInfo.scaling_factor),
                weight: v.weight,
                lock_time: formatLockTime(v.lock_time),
                sbt_amount: formatAmount(v.sbt_amount),
                lock_status: formatExpire(v.stake_time, v.lock_time)
            }
        })

        setData({
            sbt: countSbt,
            token: countToken / props.tokenInfo.scaling_factor,
            items: items
        })

    }, [props.data])

    return (
        <TableContainer>
            <Table variant='simple'>
                <TableCaption>
                    <TextBox>
                        {props.data ? `Time zone ${Intl.DateTimeFormat().resolvedOptions().timeZone}` : ''}
                    </TextBox>
                    <TextBox mt='4'>
                        {data ? `Total stake token ${data.token} - Results total sbt ${data.sbt}` : ''}
                    </TextBox>
                </TableCaption>
                <Thead>
                    <Tr>
                        {
                            title.map((v, i) => {
//                                if (i === 2) {
//                                    return <Th key={`!${i.toString()}`}>{`${v} (${data ? data.token : 0})`}</Th>
//                                } else if (i === 5) {
//                                    return <Th key={`!${i.toString()}`}>{`${v} (${data ? data.sbt : 0})`}</Th>
//                                }

                                return <Th key={`!${i.toString()}`}>{v}</Th>
                            })
                        }
                    </Tr>
                </Thead>
                <Tbody>
                    {data
                        ?
                        data.items.map((v, i) => (
                            <Tr key={`#${v.id.toString()}`}>
                                <Td>{v.id}</Td>
                                <Td>{v.stake_time}</Td>
                                <Td>{v.token}</Td>
                                <Td>{v.lock_time}</Td>
                                <Td>{v.weight}</Td>
                                <Td>{v.sbt_amount}</Td>
                                <Td>{v.lock_status}</Td>
                                <Td>
                                    <Button w='46%'

                                            onClick={() => {
                                                onItemClick(v)
                                            }}>
                                        {actionLoading.get(v.id) ? <Spinner margin='0 auto'/> : "Unstake"}
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