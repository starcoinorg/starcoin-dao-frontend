import React, { useEffect, useState } from 'react';
import { Switch, Route, NavLink, useLocation } from 'react-router-dom';
import { Layout } from '@arco-design/web-react';
import logo from './logo.svg';
import './App.less';
import Sandbox from './sandbox';
import { SubAppContext } from './root';

const Content = Layout.Content;

const Index = () => {
  return <div style={{ marginBottom: '30px' }}>This is Home Page.</div>;
};

const About = () => {
  return <div style={{ marginBottom: '30px' }}>This is About Page. </div>;
};

const App = () => {
  const location = useLocation();
  const [isActive, setIsActive] = useState('home');

  useEffect(() => {
    setIsActive(location.pathname.includes('about') ? 'about' : 'home');
  }, [location.pathname]);

  return (
    <SubAppContext.Consumer>
      {(appInfo) => {
        return (
          <Content>
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                  Thank you for the React applications use garfish.
                  <span style={{ color: 'aqua' }}> This is React16. </span>
                </p>
                <p>
                  Edit <code>src/App.js</code> and save to reload.
                </p>

                <ul>
                  <li onClick={() => setIsActive('home')}>
                    <NavLink
                      to="/"
                      className={isActive === 'home' ? 'tabActive' : ''}
                    >
                      Home
                    </NavLink>
                  </li>
                  <li onClick={() => setIsActive('about')}>
                    <NavLink
                      to="/about"
                      className={isActive === 'about' ? 'tabActive' : ''}
                    >
                      About
                    </NavLink>
                  </li>
                  <li onClick={() => setIsActive('about')}>
                    <NavLink
                      to="/vm-sandbox"
                      className={isActive === 'about' ? 'tabActive' : ''}
                    >
                      vm sandbox
                    </NavLink>
                  </li>
                </ul>
                <Switch>
                  <Route path="/home" exact component={Index}></Route>
                  <Route path="/about" exact component={About}></Route>
                  <Route path="/vm-sandbox" exact component={Sandbox}></Route>
                </Switch>
              </header>
            </div>
          </Content>
        );
      }}
    </SubAppContext.Consumer>
  );
};

export default App;
