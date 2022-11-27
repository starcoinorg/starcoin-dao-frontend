import React from 'react'
import {
    Button,
} from '@chakra-ui/react'

import MainViewLayout from '../components/mainViewLayout'
import {useSubAppContext} from '../contexts/SubAppContext'
import {join} from "../utils/api"

const HomePage = () => {

    const {dao} = useSubAppContext()

    const onSubmit = () => {
        join(dao.daoType, "", "").catch(e => {
            console.log(e)
        })
    }

    return (
        <MainViewLayout
            header='Any Member'
        >
            <Button onClick={onSubmit}>
                Join
            </Button>

        </MainViewLayout>
    )
}

export default HomePage