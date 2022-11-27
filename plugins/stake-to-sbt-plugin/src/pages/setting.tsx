import React from 'react'
import MainViewLayout from "../components/mainViewLayout"
import Back from "../components/back"
import SettingWeight from "../components/setting"

const SettingPage = () => {

    return (
        <MainViewLayout
            header='Stake SBT Setting'
            headerEl={Back('Back')}
        >
           <SettingWeight/>

        </MainViewLayout>
    )
}

export default SettingPage