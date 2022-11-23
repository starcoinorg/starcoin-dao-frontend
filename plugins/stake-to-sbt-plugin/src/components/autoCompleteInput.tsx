import React from "react"
import {
    Box,
    Text,
    Avatar,
    FormControl,
    InputGroup,
    InputLeftAddon,
    FormHelperText
} from '@chakra-ui/react'

import {
    AutoComplete,
    AutoCompleteInput,
    AutoCompleteItem,
    AutoCompleteList,
} from "@choc-ui/chakra-autocomplete"

import TextBox from "./TextBox"

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
                    <AutoComplete
                        key={props.title}
                        openOnFocus
                        onChange={props.onChange}>
                        <AutoCompleteInput
                            h='38px'
                            variant="filled"
                            placeholder={props.placeholder ? props.placeholder : "Select..."}
                            background='#03051b'
                            _selected={{bg: "#EB8A23"}}
                            _focus={{bg: "#EB8A23"}}
                            _hover={{bg: "#EB8A23"}}
                            border='0'
                            borderTopStartRadius='0'
                            borderBottomStartRadius='0'
                            borderTopEndRadius='5px'
                            borderBottomEndRadius='5px'
                        />
                        <AutoCompleteList>

                            {props.options.map((t, i) => (
                                <AutoCompleteItem
                                    key={`option-${i}`}
                                    value={t}
                                    background='#03051b'
                                    _selected={{bg: "#EB8A23"}}
                                    _focus={{bg: "#EB8A23"}}
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