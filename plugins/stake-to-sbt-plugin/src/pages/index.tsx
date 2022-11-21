import React, {
    useEffect,
    useState
} from "react"
import {
    Flex,
    Spinner,
    useToast
} from "@chakra-ui/react"
import {useHistory} from 'react-router-dom'

import {useSubAppContext} from "../contexts/SubAppContext"
import {queryStakeTokenType} from "../utils/stakeSBTPluginAPI"
import CreateAcceptPropoalWidget from "../components/createAcceptProposal"
import MainViewLayout from "../components/mainViewLayout"
import TextBox from "../components/TextBox"

const IndexPage = () => {

    const {dao} = useSubAppContext()

    const [loading, setLoading] = useState(true)
    const history = useHistory()
    const [init, setInit] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            let result = await queryStakeTokenType(dao.address, dao.daoType)

            if (result.length > 0) {
                history.replace("/list")
            } else {
                setInit(false)
            }

            setLoading(false)
        }

        fetchData().catch(console.log)

    }, [])

    return (<>
        <MainViewLayout
            header='Init Stake SBT Plugin'
            headerEl={<></>}
        >
            <Flex direction='column'>
                {
                    loading
                        ?
                        <Spinner margin='0 auto'/>
                        :
                        init
                            ?
                            <></>
                            :
                            <Flex direction='column'>
                                <TextBox mb={6}>
                                    Initializes a token type
                                </TextBox>
                                <CreateAcceptPropoalWidget dao={dao}/>
                            </Flex>
                }

            </Flex>
        </MainViewLayout>
    </>)
}

export default IndexPage