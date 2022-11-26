import React from "react";
import {
    Box,
    Text,
    Link,
    Button,
    Stack, Skeleton
} from "@chakra-ui/react";

function Card(props) {
    const {product, summary, longLine, action, actionCallback} = props;

    return (
        <Box
            p={4}
            display={{md: "flex"}}
            maxWidth="32rem"
            borderWidth={1}
            margin={2}
            borderRadius='5'
        >
            <Stack
                align={{base: "center", md: "stretch"}}
                textAlign={{base: "center", md: "left"}}
                mt={{base: 4, md: 0}}
                ml={{md: 6}}
            >
                {
                    product ?
                        <Text
                            fontWeight="bold"
                            textTransform="uppercase"
                            fontSize="lg"
                            letterSpacing="wide"
                            color="#EB8A23"
                        >
                            {product}
                        </Text> :
                        <Skeleton h='20px' w='100px'/>
                }
                {
                    summary ? <Link
                            my={1}
                            display="block"
                            fontSize="md"
                            lineHeight="normal"
                            fontWeight="semibold"
                            href="#"
                        >
                            {summary}
                        </Link> :
                        <Skeleton h='20px' w='200px'/>
                }
                {
                    longLine ?
                        <Text my={2} color="gray.500">
                            {longLine}
                        </Text> :
                        <Skeleton h='20px' w='200px'/>
                }
                {
                    action?
                    <Button w="200px" my={2} onClick={actionCallback} disabled={action === "Delete"}>
                        {action}
                    </Button>:
                    <Skeleton h='38px' w='200px'/>
                }
            </Stack>
        </Box>
    );
}

export default Card;
