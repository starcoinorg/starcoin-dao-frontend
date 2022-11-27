import React from 'react'

import {
    Switch,
    Route,Redirect
} from 'react-router-dom'

import HomePage from '../pages/Home'

const Router = () => {
    return (<Switch>
        <Route exact path="/" component={() => <Redirect to="/home" />}/>
        <Route exact path="/home" component={() => <HomePage/>}/>
    </Switch>)
}

export default Router