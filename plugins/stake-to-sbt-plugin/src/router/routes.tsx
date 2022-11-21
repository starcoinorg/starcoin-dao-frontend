import React from 'react'
import {
    Switch,
    Route, Redirect
} from 'react-router-dom'
import IndexPage from '../pages/index'
import HomePage from "../pages/home"
import SettingPage from "../pages/setting"
import TypePage from '../pages/detail'
import StakePage from '../pages/stake'

const Router = () => {
    return (
        <Switch>
            <Route exact path="/" component={() => <Redirect to="/home"/>}/>
            <Route exact path="/home" component={() => <IndexPage/>}/>
            <Route exact path="/stake" component={() => <StakePage/>}/>
            <Route exact path="/list" component={() => <HomePage/>}/>
            <Route exact path="/setting" component={() => <SettingPage/>}/>
            <Route exact path="/detail/:type" component={() => <TypePage/>}/>
        </Switch>
    )
}
export default Router