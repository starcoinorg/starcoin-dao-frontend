import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { ExploreContextProvider } from '../contexts/ExploreContext';
import FourOhFour from '../pages/404';
import Dao from '../pages/Dao';
import Explore from '../pages/Explore';
import Hub from '../pages/Hub';
import HubBalances from '../pages/HubBalances';
import Haus from '../pages/Haus';
import Register from '../pages/Register';
import Summon from '../pages/Summon';
import SummonPartyFavor from '../pages/SummonPartyFavor';
import Layout from '../components/layout';

const BaseRouter = () => {
  return (
    <Switch>
      <Route exact path='/dao/:dao(\b0x[0-9a-f]{10,40}\b)'>
        <Redirect to='/' />
      </Route>
      <Route exact path='/dao/:dao(\b0x[0-9a-f]{10,40}\b)/*'>
        <Redirect to='/' />
      </Route>
      <Route exact path='/'>
        <Hub />
      </Route>
      <Route exact path='/explore'>
        <ExploreContextProvider>
          <Explore />
        </ExploreContextProvider>
      </Route>
      <Route
        path={`/plugins/:pluginname`}
        render={routeProps => {
          // 首字母大写
          const ComponentName =
            routeProps.match.params.pluginname.charAt(0).toUpperCase() +
            routeProps.match.params.pluginname.slice(1);
          const Component = require(`../pages/plugins/daos/${routeProps.match.params.pluginname}/index.jsx`)
            .default;
          return (
            <Layout>
              <Component />
            </Layout>
          );
        }}
      />
      <Route exact path='/summon'>
        <Summon />
      </Route>
      <Route exact path='/summon-party-favor/:poapId'>
        <SummonPartyFavor />
      </Route>
      <Route exact path='/register/:registerchain/:daoid'>
        <Register />
      </Route>
      <Route exact path='/hub-balances'>
        <HubBalances />
      </Route>
      <Route exact path='/haus'>
        <Haus />
      </Route>
      <Route
        path='/dao/:daochain/:daoid'
        render={routeProps => {
          return <Dao key={routeProps.match.params.daoid} {...routeProps} />;
        }}
      />
      <Route path='*' component={FourOhFour} />
    </Switch>
  );
};

export default BaseRouter;
