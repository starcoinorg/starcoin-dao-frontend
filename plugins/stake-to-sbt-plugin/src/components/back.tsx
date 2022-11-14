
import React, {Button} from "@chakra-ui/react"

import {MdArrowBackIos} from 'react-icons/md'

import {useHistory} from 'react-router-dom'

const Back = (text:any) => {

    const history = useHistory();

    return ( <Button
        size='md'
        leftIcon={<MdArrowBackIos/>}
        title='home'
        onClick={() => {
            history.goBack()
        }}
        >
        {text?text:"Back"}
    </Button>)
}

export default Back