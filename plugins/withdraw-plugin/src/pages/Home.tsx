import React, {useState} from 'react';
import {
    Flex,
    Button,
    FormControl,
    Input, InputGroup, InputLeftAddon, NumberInput, NumberInputField, FormLabel, Switch, useToast, InputRightAddon,
} from '@chakra-ui/react';

import {useForm} from 'react-hook-form';
import MainViewLayout from '../components/mainViewLayout';
import TextBox from '../components/TextBox';
import {Action, createProposal} from "../utils/memberPluginAPI";
import { useSubAppContext } from '../contexts/SubAppContext';

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
                        borderTopEndRadius={props.right?0:5}
                        borderBottomEndRadius={props.right?0:5}
                    />
                </NumberInput> :
                <Input ref={props.reg}
                       defaultValue={props.defaultValue}
                       placeholder={props.title + "..."}
                       name={props.name}/>
            }
            {
                props.right ? 
                <InputRightAddon>
                <TextBox size='sm'>
                                        {props.right}
                                     </TextBox>
                </InputRightAddon>:
                <></>
            }
        </InputGroup>
    </FormControl>)
}

const HomePage = () => {

    const toast = useToast();
    const {dao} = useSubAppContext()
    const [loading, setLoading] = useState(false);
    const {register, handleSubmit} = useForm();
    const [action, setAction] = useState<Action>({
        dao_type:"-",
        title: "",
        introduction: "",
        description: "",
        action_delay: 0n,
        package_hash: "",
        version: 1n,
        enforced: false,
    });

    const onSubmit = data => {
        setLoading(true);

        setAction(data);

        data.action_delay = data.action_delay * 60 * 1000

        createProposal({...data, dao_type:dao.daoType}).then(v=> {
            toast({
                title: 'Tips',
                description: "create upgrade proposa success",
                status: 'success',
                duration: 3000,
                position: 'top-right',
                isClosable: true,
            })
        }).catch(e => {
            console.log(e)
        })

        setLoading(false);
    }

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
                    Withdraw
                </TextBox>

                <From
                    reg={register({required: true})}
                    defaultValue={action.receiver}
                    title='Package hash'
                    name='package_hash'/>

                <From
                    reg={register({required: true})}
                    defaultValue={action.amount}
                    type='number'
                    title='Version'
                    name='version'/>

                <TextBox size='xs' mb={2} mt={2}>
                    Proposal
                </TextBox>

                <From
                    reg={register({required: true})}
                    defaultValue={action.action_delay}
                    type='number'
                    title='Action delay'
                    right='min'
                    name='action_delay'/>

                <Button type='submit' disabled={loading} my={4}>
                    Submit
                </Button>

            </Flex>
        </MainViewLayout>
    );
}

export default HomePage;