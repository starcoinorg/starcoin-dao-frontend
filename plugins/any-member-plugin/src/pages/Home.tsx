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
        fetch()
    }, [])

    const fetch = async () => {
        setLoading(true)

        try {
            const s = await getMemberNFT(dao.daoType, window.starcoin.selectedAddress);
            if (s) {
                setEx(true)
            }
        } catch (e) {
            console.log(e)
        }

        setLoading(false)
    }

    const onSubmit = () => {
        join(dao.daoType, "", "").catch(e => {
            console.log(e)
        })
    }

    return (
        <MainViewLayout
            header='Any Member'
            headerEl={<Button
                size='md'
                title='refresh'
                onClick={() => {
                    fetch()
                }}
            >
                Refresh
            </Button>}
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