import React, {useState} from 'react';
import {
    Flex,
    Button,
    FormControl,
    Input, InputGroup, InputLeftAddon, NumberInput, NumberInputField, FormLabel, Switch, useToast,
} from '@chakra-ui/react';

import {useForm} from 'react-hook-form';
import MainViewLayout from '../components/mainViewLayout';
import TextBox from '../components/TextBox';
import {createUpgradeProposal, Action} from "../utils/memberPluginAPI";

const From = (props) => {

    return (<FormControl id={props.name} mb={4}>
        <InputGroup>
            <InputLeftAddon bg='transparent' w='16%'>
                <TextBox size='sm'>
                    {props.title}
                </TextBox>
            </InputLeftAddon>
            {props.type == "number" ?
                <NumberInput w='100%' defaultValue={props.defaultValue}>
                    <NumberInputField
                        ref={props.reg}
                        name={props.name}
                        borderTopStartRadius='0'
                        borderBottomStartRadius='0'
                    />
                </NumberInput> :
                <Input ref={props.reg}
                       defaultValue={props.defaultValue}
                       placeholder={props.title + "..."}
                       name={props.name}/>
            }
        </InputGroup>
    </FormControl>)
}

const Proposal = () => {

    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const {register, handleSubmit} = useForm();
    const [action, setAction] = useState<Action>({
        title: "",
        introduction: "",
        description: "",
        action_delay: 0n,
        package_hash: "",
        version: 1n,
        enforced: false,
    });

    const onSubmit = async data => {
        setLoading(true);

        setAction(data);

//        await createUpgradeProposal(data)

        setLoading(false);

        toast({
            title: 'Tips',
            description: "create upgrade proposa success",
            status: 'success',
            duration: 3000,
            position: 'top-right',
            isClosable: true,
        })
    }

//    const values = Object.values(action)
//    Object.keys(action).forEach((v, i) => {
//        let name = ""
//        v.split("_").forEach((v, i) => {
//            name += i > 0 ? " " + v : v
//        })
//
//        name = name[0].toUpperCase() + name.substring(1, name.length)
//        const s = typeof values[i]
//
//        console.log(s)
//    })
    return (
        <MainViewLayout
            header='Upgrade'
        >
            <Flex
                as='form'
                onSubmit={handleSubmit(onSubmit)}
                direction='column'
                w='100%'
            >
                <TextBox size='xs' mb={2} mt={2}>
                    Info
                </TextBox>

                <From
                    reg={register({required: true})}
                    defaultValue={action.title}
                    title='Title'
                    name='title'/>

                <From
                    reg={register({required: true})}
                    defaultValue={action.introduction}
                    title='Introduction'
                    name='introduction'/>

                <From
                    reg={register({required: true})}
                    defaultValue={action.description}
                    title='Description'
                    name='description'/>

                <TextBox size='xs' mb={2} mt={2}>
                    Proposal
                </TextBox>

                <From
                    reg={register({required: true})}
                    defaultValue={action.action_delay}
                    type='number'
                    title='Action delay'
                    name='action_delay'/>

                <TextBox size='xs' mb={2} mt={2}>
                    Package
                </TextBox>

                <From
                    reg={register({required: true})}
                    defaultValue={action.package_hash}
                    title='Package hash'
                    name='package_hash'/>

                <From
                    reg={register({required: true})}
                    defaultValue={action.version}
                    type='number'
                    title='Version'
                    name='version'/>

                <FormControl
                    id='enforced'
                    display='flex'
                    alignItems='center'>
                    <FormLabel
                        htmlFor='enforced-upgrade'
                        mb='0'>
                        Enforced to upgrade?
                    </FormLabel>
                    <Switch
                        ref={register}
                        defaultChecked={action.enforced}
                        name='enforced'/>
                </FormControl>

                <Button type='submit' disabled={loading} my={4}>
                    Submit
                </Button>

            </Flex>
        </MainViewLayout>
    );
}

export default Proposal;