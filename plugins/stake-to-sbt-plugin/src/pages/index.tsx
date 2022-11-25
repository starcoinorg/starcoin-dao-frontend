import React, {
    useEffect,
    useState
} from "react"
import {
    Button,
    Flex,
    Spinner,
} from "@chakra-ui/react"
import {useHistory} from 'react-router-dom'

import {useSubAppContext} from "../contexts/SubAppContext"
import {queryStakeTokenType, queryTokenStakeLimit} from "../utils/api"
import CreateAcceptPropoalWidget from "../components/createAcceptProposal"
import MainViewLayout from "../components/mainViewLayout"
import TextBox from "../components/TextBox"
import SettingWeight from "../components/setting"

const IndexPage = () => {

    const {dao} = useSubAppContext()

    const [loading, setLoading] = useState(true)
    const history = useHistory()
    const [initToken, setInitToken] = useState(true)
    const [initTokenLimit, setInitTokenLimit] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            await fetch()
        }

        fetchData().catch(console.log)

    }, [])

    const fetch = async () => {
        setLoading(true)

        try {
            let result = await queryStakeTokenType(dao.address, dao.daoType)

            if (result.length > 0) {
                let next = false
                for (const i in result) {
                    const cfg = await queryTokenStakeLimit(dao.address, dao.daoType, result[i].type)
                    if (cfg.length > 0) {
                        next = true
                        break
                    }
                }

                if (next) {
                    history.replace("/list")
                } else {
                    setInitTokenLimit(false)
                }
            } else {
                setInitToken(false)
            }

        } catch (e) {
            console.log(e)
        }

        setLoading(false)
    }

    return (
        <MainViewLayout
            header='Init Stake SBT Plugin'
            headerEl={<Button
                size='md'
                title='refresh'
                onClick={() => {
//                    window.location.reload()
                    fetch()
                }}
            >
                Refresh
            </Button>}
        >
            <Flex direction='column'>
                {
                    loading
                        ?
                        <Spinner margin='0 auto'/>
                        :
                        initToken
                            ?
                            initTokenLimit
                                ? <></>
                                : <Flex direction='column'>
                                    <TextBox mb={6} w='100%' text-align='center'>
                                        Your do not have a weight available. Configure one first
                                    </TextBox>
                                    <SettingWeight/>
                                </Flex>
                            :
                            <Flex direction='column'>
                                <TextBox mb={6}>
                                    Your do not have a token available. Configure one first
                                </TextBox>
                                <CreateAcceptPropoalWidget dao={dao}/>
                            </Flex>
                }

            </Flex>
        </MainViewLayout>
    )
}

export default IndexPage