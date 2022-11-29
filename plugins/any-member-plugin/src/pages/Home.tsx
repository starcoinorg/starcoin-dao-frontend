import React, {useEffect, useState} from 'react'
import {
    Center,
    Button, Text, Spinner,
} from '@chakra-ui/react'

import MainViewLayout from '../components/mainViewLayout'
import {useSubAppContext} from '../contexts/SubAppContext'
import {getMemberNFT, join} from "../utils/api"

const HomePage = () => {

    const {dao} = useSubAppContext()
    const [loading, setLoading] = useState(true);
    const [ex, setEx] = useState(false)

    useEffect(() => {
        setLoading(true)
        const fetch = async () => {
            const s = await getMemberNFT(dao.daoType, window.starcoin.selectedAddress);
            console.log(s)
            if (s) {
                setEx(true)
            }
        }
        fetch().catch(e => console.log(e)).finally(() => setLoading(false))
    }, [])

    const onSubmit = () => {
        join(dao.daoType, "", "").catch(e => {
            console.log(e)
        })
    }

    return (
        <MainViewLayout
            header='Any Member'
        >
            <Center mt='100px' w='100%'>
                {
                    loading ? <Spinner/> : <> {
                        ex ? <Text>
                                Your Joind
                            </Text>
                            : <Button onClick={onSubmit}>
                                Join
                            </Button>
                    }</>
                }
            </Center>

        </MainViewLayout>
    )
}

export default HomePage