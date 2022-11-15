
import { Box, Flex, Spinner } from "@chakra-ui/react"
import {useHistory} from 'react-router-dom'
import React,{ useEffect, useState }  from "react"
import { useSubAppContext } from "../contexts/SubAppContext"
import { queryStakeTokenType } from "../utils/stakeSBTPluginAPI"
import CreateAcceptPropoalWidget from "../components/createAcceptProposal"
import MainViewLayout from "../components/mainViewLayout"
import TextBox from "../components/TextBox"

const IndexPage = () => {
    const {dao} = useSubAppContext()
    const [loading, setLoading] = useState()
    const history= useHistory()
    const [init, setInit] = useState(false)

    useEffect(() => {
        queryStakeTokenType(dao.address, dao.daoType)
        .then(v => {
            if (v.length > 0) {
               history.replace('/list')
            } else {
                setInit(true)
            }
        })
        .catch()
        .finally()
    }, [])

    return(<>
        <MainViewLayout
        header='Init Stake SBT Plugin'
        headerEl={<></>}
        >
        
            <Flex direction='column'>
            {
            loading || !init ? 
                <Spinner margin='0 auto'/>
        :
                <Flex direction='column'>
                    <TextBox mb={6}>
                    Initializes a token type
                </TextBox>
                <CreateAcceptPropoalWidget dao = {dao}/>
                </Flex>
        }

            </Flex>
            </MainViewLayout>
    </>)
}

export default IndexPage