import {
    Button,
    Flex,
    FormControl, FormHelperText,
    Input,
    InputGroup,
    InputLeftAddon,
    NumberInput,
    NumberInputField,
    Spinner
} from "@chakra-ui/react";
import {useForm} from "react-hook-form";

import React, {
    useEffect,
    useState
} from 'react';
import TextBox from "./TextBox";

enum ItemType {
    Title,
    Input,
}

type Item = {
    title: string
    name: string
    defaultValue: any
    valueType: string
    type: ItemType
}

const parseTitle = (title) => {

    let nTitle = ""

    title.split("_").forEach((v, i) => {
        nTitle += i > 0 ? " " + v : v
    })

    return nTitle[0].toUpperCase() + nTitle.substring(1, nTitle.length)
}

const parseItems = (obj, prex, rules) => {
    const keys = Object.keys(obj)
    let items = Array<Item>()
    Object.values(obj).forEach((v: any, i) => {

        let name = prex ? prex + "." + keys[i] : keys[i]

        let valueType = typeof v

//        console.log(`${keys[i]} valueTypee ${valueTypee} ${valueTypee === "bigint"}`)

        if (valueType === "object") {
            let sub = parseItems(v, keys[i], rules)
            items = items.concat(keys[i] === "obj" ? sub : [{
                title: parseTitle(keys[i]),
                name: "",
                defaultValue: "",
                valueType: "",
                type: ItemType.Title
            }, ...sub])
        } else {
            if (v != "-") {
                items = items.concat({
                    title: parseTitle(keys[i]),
                    name: name,
                    defaultValue: v,
                    valueType: valueType,
                    type: ItemType.Input
                })
                console.log(items)
            }
        }
    })

    return items
}

const HookForm = (props) => {

    const {register, handleSubmit} = useForm();
    const [items, setItems] = useState<Array<any>>([])

    useEffect(() => {
        setItems([...parseItems(props.obj, "", props.rules)])
    }, [props.obj])

    return (
        <Flex
            as='form'
            onSubmit={handleSubmit(props.onSubmit)}
            direction='column'>
            {
                items.map((v, i) => {
                    return v.type === ItemType.Title
                        ? <TextBox key={i.toString()} size='xs' mb={2} mt={2}>
                            {v.title}
                        </TextBox>
                        : <FormControl key={i.toString()} id={v.name} mb={4}>
                            <InputGroup>
                                <InputLeftAddon bg='transparent' w='20%'>
                                    <TextBox size='sm'>
                                        {v.title}
                                    </TextBox>
                                </InputLeftAddon>
                                {   // BUG
                                    v.valueType === "bigint" || v.valueType === "number"
                                        ?
                                        <NumberInput w='100%'
                                                     defaultValue={v.defaultValue}
                                                     isReadOnly={props.rules ? props.rules.get(v.name) : false}>
                                            <NumberInputField
                                                ref={register({required: true})}
                                                name={v.name}
                                                borderTopStartRadius='0'
                                                borderBottomStartRadius='0'
                                            />
                                        </NumberInput>
                                        :
                                        <Input ref={register({required: true})}
                                               defaultValue={v.defaultValue}
                                               placeholder={v.title + "..."}
                                               isReadOnly={props.rules ? props.rules.get(v.name) : false}
                                               name={v.name}/>
                                }
                            </InputGroup>
                        </FormControl>
                })
            }
            {
                props.loading ?
                    <Spinner margin='0 auto'/> :
                    <Button type='submit' my={4}>
                        Submit
                    </Button>
            }

        </Flex>
    )
}

export default HookForm

