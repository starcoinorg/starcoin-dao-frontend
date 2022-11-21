import React from "react"
import {
    Box,
    Text,
    Avatar,
    FormControl,
    InputGroup,
    InputLeftAddon, FormHelperText
} from '@chakra-ui/react';

import {
    AutoComplete,
    AutoCompleteInput,
    AutoCompleteItem,
    AutoCompleteList,
} from "@choc-ui/chakra-autocomplete";

import TextBox from "./TextBox";

const AutoCompleteInputWidget = (props) => {

    return (
        <FormControl mb={4}>
            <InputGroup>
                <InputLeftAddon bg='transparent' w='20%'>
                    <TextBox size='sm'>
                        {props.title}
                    </TextBox>
                </InputLeftAddon>

                <Box border='1px solid #E2E8F0' w='100%' h='40px'
                     borderTopEndRadius='5px'
                     borderBottomEndRadius='5px'
                >
                    <AutoComplete openOnFocus
                                  suggestWhenEmpty
                                  emptyState
                                  onChange={props.onChange}>
                        <AutoCompleteInput
                            h='38px'
                            variant="filled"
                            placeholder="Select..."
                            background='#03051b'
                            border=''
                            bordeer-color=''
                        />
                        <AutoCompleteList>
                            {props.options.map((t, i) => (
                                <AutoCompleteItem
                                    key={`option-${i}`}
                                    value={t}
                                    align="center"
                                >
                                    <Avatar size="sm" name={t}/>
                                    <Text ml="4">{t}</Text>
                                </AutoCompleteItem>
                            ))}
                        </AutoCompleteList>
                    </AutoComplete>
                </Box>
            </InputGroup>
            {
                props.helper ?
                    <FormHelperText>
                        {props.helper}
                    </FormHelperText> :
                    <div/>
            }
        </FormControl>
    )
}

export default AutoCompleteInputWidget