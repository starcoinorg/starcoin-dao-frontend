import React, {
    useEffect,
    useState
} from 'react'
import {
    SimpleGrid,
    Container,
    Flex,
    List,
    ListItem,
    Box,
    Button,
    Skeleton,
    Text,
} from '@chakra-ui/react'

import {rgba} from 'polished'
import Card from '../components/card'
import {useSubAppContext} from '../contexts/SubAppContext'
import CreateAcceptProposalWidget from '../components/createAcceptProposal'
import {
    queryStakeTokenType,
    QueryStakeTypeResult, queryTokenStakeLimit, QueryTokenStakeLimitResult
} from '../utils/api'
import TextBox from "../components/TextBox"
import {formatLockTime} from "../utils/formt"
import CreateWeightProposalWidget from "../components/createWeightProposal"

const SettingWeight = () => {
    const {dao} = useSubAppContext()
    const [currentToken, setCurrentToken] = useState<QueryStakeTypeResult>()
    const [tokenList, setTokenList] = useState<Array<QueryStakeTypeResult>>([])
    const [fetchingTokenList, setFetchingTokenList] = useState(true)
    const [fetchingTokenStakeLimit, setFetchingTokenStakeLimit] = useState(true)
    const [tokenStakeLimits, setTokenStakeLimits] = useState<Map<string, QueryTokenStakeLimitResult>>(new Map())
    const [createNewToken, setCreateNewToken] = useState(false)
    const [createTokenLimit, setCreateTokenLimit] = useState(false)

    useEffect(() => {
        const fetchTokenList = async () => {
            let _tokenList = await queryStakeTokenType(dao.address, dao.daoType)

            setTokenList(_tokenList)
            setFetchingTokenList(false)

            setCurrentToken(_tokenList[0])

            let tokenStakeLimit = await queryTokenStakeLimit(dao.address, dao.daoType, _tokenList[0].type)

            if (tokenStakeLimit.length === 0) {
                setCreateTokenLimit(true)
            }

            setTokenStakeLimits(new Map(tokenStakeLimits).set(_tokenList[0].type, tokenStakeLimit))

            setFetchingTokenStakeLimit(false)
        }

        fetchTokenList()
            .catch(console.log)
            .finally(() => {
                setFetchingTokenList(false)
                setFetchingTokenStakeLimit(false)
            })
    }, [])

    const onTokenChange = async (v: QueryStakeTypeResult) => {

        setCreateTokenLimit(false)
        setCreateNewToken(false)
        setCurrentToken(v)

        if (!tokenStakeLimits.has(v.type)) {

            setFetchingTokenStakeLimit(true)

            try {
                const tokenStakeLimit = await queryTokenStakeLimit(dao.address, dao.daoType, v.type)

                if (tokenStakeLimit.length === 0) {
                    setCreateTokenLimit(true)
                }

                setTokenStakeLimits(new Map(tokenStakeLimits).set(v.type, tokenStakeLimit))
                setFetchingTokenStakeLimit(false)
            } catch (e) {
                console.log(e)
            }
            return
        }

        if (tokenStakeLimits.get(v.type).length === 0) {
            setCreateTokenLimit(true)
        }
    }

    return (
        <Flex direction='row'>
            <Box
                minW='20%'
                mr='6'
            >
                <List spacing={6}>
                    {
                        fetchingTokenList ? <>
                                <Skeleton height='38px' w='100%' isLoaded={false}/>
                                <Skeleton height='38px' w='100%' isLoaded={false}/>
                                <Skeleton height='38px' w='100%' isLoaded={false}/>
                            </> :
                            <>
                                {
                                    tokenList.map((v) => {
                                        return <ListItem>
                                            <Button w='100%'
                                                    background={currentToken ? currentToken.title === v.title && !createNewToken ?
                                                        '#EB8A23' : rgba('#EB8A23', 0.8) : rgba('#EB8A23', 0.8)}
                                                    onClick={() => onTokenChange(v)}>
                                                <TextBox w='100%'>{v.title}</TextBox>
                                            </Button>
                                        </ListItem>
                                    })
                                }
                                <Button w='100%' background={createNewToken ? '#EB8A23' : rgba('#EB8A23', 0.8)}
                                        onClick={() => {
                                            setCreateNewToken(true)
                                            setCreateTokenLimit(false)
                                        }}>
                                    Create New Token
                                </Button>
                            </>
                    }
                </List>
            </Box>
            <Box border='0.5px dashed grey'
                 margin={2}
                 borderRadius='5'
                 w='1px'></Box>
            <Flex direction='column' w='100%' background='balck'>
                <Flex direction='row' align='center' justify={['space-between', null, null, 'flex-start']}>
                    {
                        createNewToken ? <></> :
                            <Text
                                ms='6'
                                fontWeight="bold"
                                textTransform="uppercase"
                                fontSize="lg"
                                cursor={setCreateTokenLimit ? 'pointer' : 'default'}
                                letterSpacing="wide"
                                decoration={createTokenLimit ? 'underline' : ''}
                                color={createTokenLimit ? '#EB8A23' : 'white'}
                                onClick={() => {
                                    if (createTokenLimit) {
                                        setCreateTokenLimit(false)
                                    }
                                }}
                            >
                                {currentToken ? currentToken.title + ' Weight List ' : ' '}
                            </Text>
                    }
                    <Text
                        ms={createNewToken ? '6' : '1'}
                        fontWeight="bold"
                        textTransform="uppercase"
                        fontSize="lg"
                        letterSpacing="wide"

                    >
                        {createNewToken ? 'Add new Token' : createTokenLimit ? '/ Add new Token Weight' : ''}
                    </Text>
                </Flex>
                {
                    createNewToken ? <Box ms='6' mt='6' w='80%'><CreateAcceptProposalWidget dao={dao}/></Box> :
                        <>
                            {
                                createTokenLimit ?
                                    <Box ms='6' mt='6' w='80%'><CreateWeightProposalWidget
                                        dao={dao}
                                        tokenType={currentToken.type}/>
                                    </Box> :
                                    <Container maxW='100%'>
                                        <SimpleGrid columns={[1, 2]}>{
                                            fetchingTokenStakeLimit ? <Card/> :
                                                <>
                                                    {
                                                        tokenStakeLimits.get(currentToken.type).map(function (data) {
                                                            const {lock_time, weight} = data
                                                            const plus = lock_time === -1n
                                                            return (
                                                                <Card
                                                                    key={lock_time}
                                                                    product={plus ? "New" : `Weight: ${weight}`}
                                                                    summary={plus ? "Add new token type to stake" : `Lock time: ${formatLockTime(lock_time)}`}
                                                                    longLine='...'
                                                                    action={plus ? "Add" : "Delete"}

                                                                />
                                                            )
                                                        })
                                                    }
                                                    <Card
                                                        key='add'
                                                        product={"New"}
                                                        summary={"Add new token weight to stake"}
                                                        longLine='...'
                                                        action={"Add"}
                                                        actionCallback={() => {
                                                            setCreateTokenLimit(true)
                                                        }}
                                                    />
                                                </>
                                        }
                                        </SimpleGrid>
                                    </Container>
                            }
                        </>
                }
            </Flex>
        </Flex>
    )
}

export default SettingWeight