import React from "react";
import {
    Box,
    Text,
    Link,
    Button,
    Stack
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
                <Text
                    fontWeight="bold"
                    textTransform="uppercase"
                    fontSize="lg"
                    letterSpacing="wide"
                    color="teal.600"
                >
                    {product}
                </Text>
                <Link
                    my={1}
                    display="block"
                    fontSize="md"
                    lineHeight="normal"
                    fontWeight="semibold"
                    href="#"
                >
                    {summary}
                </Link>
                <Text my={2} color="gray.500">
                    {longLine}
                </Text>
                <Button maxWidth="100px" my={2} onClick={actionCallback} disabled={action==="Delete"}>
                    {action}
                </Button>
            </Stack>
        </Box>
    );
}

export default Card;
