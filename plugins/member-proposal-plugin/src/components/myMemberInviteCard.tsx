import React, {useEffect, useState} from 'react';
import {Box, Flex, Button, HStack, Stack, Link, Text} from '@chakra-ui/react';

const MyMemberInviteCard = ({offer, onAcceptOffer}) => {

    const [address, setAddress] = useState()

    useEffect(() => {
        setAddress(window.starcoin.selectedAddress);
    }, [])

    return (
        <Box as={Link} w='60%' p='6' borderWidth='1px' borderColor='whiteAlpha.200' rounded='lg' color='mode.900'
             isExternal>
            <Stack spacing={4}>
                <Flex as={HStack} spacing={2} align='center'>
                    <Text color='white'>For:</Text>
                    <Text color='white' variant='value'>{offer.for_user}</Text>
                </Flex>
                <Flex as={HStack} spacing={2} align='center'>
                    <Text color='white' >To Address:</Text>
                    <Text color='white' variant='value'>{offer.to_address}</Text>
                </Flex>
                <Flex as={HStack} spacing={2} align='center'>
                    <Text color='white' >Init SBT:</Text>
                    <Text color='white' variant='value'>{offer.init_sbt}</Text>
                </Flex>
                <Flex as={HStack} spacing={2} align='center'>
                    <Text color='white' >Invite Time:</Text>
                    <Text color='white' variant='value'>{new Date(offer.time_lock * 1000).toLocaleString()}</Text>
                </Flex>
                {
                    address === offer.to_address ?
                        <Flex as={HStack} spacing={2} align='center'>
                            <Button
                                size='sm'
                                colorScheme='blue'
                                onClick={onAcceptOffer}
                            >
                                Accept
                            </Button>
                        </Flex>
                        : <></>}
            </Stack>
        </Box>
    );
};

export default MyMemberInviteCard;