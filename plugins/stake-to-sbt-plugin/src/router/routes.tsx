import React from 'react'

import {
    Switch,
    Route,Redirect
} from 'react-router-dom'

import HomePage from "../pages/home";
import Stake from "../pages/stake";
import Setting from "../pages/setting";
import IndexPage from '../pages/index';

const Router = () => {
    return (<Switch>
        <Route exact path="/" component={() => <Redirect to="/home" />}/>
        <Route exact path="/list" component={() => <HomePage/>}/>
        <Route exact path="/home" component={() => <IndexPage/>}/>
        <Route exact path="/stake" component={() => <Stake/>}/>
        <Route exact path="/setting" component={() => <Setting/>}/>
    </Switch>)
}

export default Router