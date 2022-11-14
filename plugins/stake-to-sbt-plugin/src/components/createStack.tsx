import React from 'react';
import {useForm} from 'react-hook-form';
import {Flex, FormControl, Input, InputGroup, InputLeftAddon} from "@chakra-ui/react";
import TextBox from "./TextBox";

const CreateStake = () => {

    const {register, handleSubmit} = useForm();

    return (
        <Flex
            as='form'
            onSubmit={handleSubmit(onSubmit)}
            direction='column'
            w='50%'
        >
            <FormControl id={props.name} mb={4}>
                <InputGroup>
                    <InputLeftAddon bg='transparent' w='16%'>
                        <TextBox size='sm'>
                            {props.title}
                        </TextBox>
                    </InputLeftAddon>
                    <Input ref={props.reg}
                        defaultValue={props.defaultValue}
                        placeholder={props.title + "..."}
                        name={props.name}/>
                </InputGroup>
            </FormControl>

        </Flex>
    )
}

export default CreateStake