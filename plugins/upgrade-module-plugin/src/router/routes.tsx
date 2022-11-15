import React from 'react'

import {
    Switch,
    Route,Redirect
} from 'react-router-dom'

import IndexPage from '../pages/Proposal';

const Router = () => {
    return (<Switch>
        <Route exact path="/" component={() => <Redirect to="/home" />}/>
        <Route exact path="/home" component={() => <IndexPage/>}/>
    </Switch>)
}

export default Router