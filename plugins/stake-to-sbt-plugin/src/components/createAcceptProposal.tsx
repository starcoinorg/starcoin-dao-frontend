import React, {useState} from 'react'
import {Flex} from '@chakra-ui/react'
import HookForm from "./hookForm"
import {
    newCreateTokenAcceptProposalParams,
    createTokenAcceptProposal,
} from '../utils/api'

const CreateAcceptPropoalWidget = (props) => {
//    const toast = useToast({
//        title: 'Tips',
//        duration: 3000,
//        position: 'top-right',
//        isClosable: true,
//    });
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState()
    const [tokenType, setTokenType] = useState()

    const verifyTokenType = (v) => {
        if (v.split("::").length !== 3) {
            setErrors(new Map().set("token_type", "Invalid token type"))
            return
        }
        setErrors(null)
    }

    const onSubmit = data => {

        if (errors) {
            return
        }

        setLoading(true)

        data.propsal.extend = "{}"
        data.propsal.action_delay = data.propsal.action_delay * 60 * 1000

        createTokenAcceptProposal({
            ...data,
            dao_type: props.dao.daoType,
        }).then((v) => {
//            toast({
//                description: `create token accept proposa success \n tx: ${v}`,
//                status: 'success',
//            })
            setLoading(false)
        }).catch((e: any) => {
            console.log(e)
//            toast({
//                description: `${e.toString()}`,
//                status: 'error',
//            })
            setLoading(false)
        })
    }

    return (
        <Flex
            direction='column'
        >
            <HookForm
                onChange={
                    (v) => {
                        if (v.id === 'token_type') {
                            setTokenType(v.value)
                            verifyTokenType(v.value)
                        }
                    }
                }
                obj={newCreateTokenAcceptProposalParams(`Apply new stake token type ${tokenType}`)}
                loading={loading}
                onSubmit={onSubmit}
                formHelperText="asd"
                startW='22%'
                rules={new Map().set("propsal.title", true)}
                helpers={errors
                }
                rightAddon={new Map().set("propsal.action_delay", "min")}
            />
        </Flex>
    )
}

export default CreateAcceptPropoalWidget