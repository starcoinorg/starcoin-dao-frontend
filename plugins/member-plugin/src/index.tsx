import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './root';
import { IDAO } from './extpoints/dao_app';

// 在首次加载和执行时会触发该函数
export const provider = (props) => {
   const root = props.dom
     ? props.dom.querySelector("#root")
     : document.querySelector("#root");

   return {
     render() {
       ReactDOM.render(<RootComponent {...props} />, root);
     },
     destroy({ dom }) {
       ReactDOM.unmountComponentAtNode(
         dom ? dom.querySelector("#root") : document.querySelector("#root")
       );
     },
   };
};

export const setup = (dao: IDAO) => {
  console.log("plugin setup")

  dao.registerApp({
    name: "member_app",
    activeWhen: "/members",
    provider: provider({
      basename: "/members",
      dao: dao,
    }),
  })
}

export const teardown = () => {
  console.log("plugin teardown")
}

// 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
if (!window.__GARFISH__) {
  const dao = {
    name: "test_dao",
    address: "0x7dA9Cd8048A4620fda9e22977750C517", 
    registerApp: (app) => {
      console.log("register app", app)
    }
  }

  ReactDOM.render(
    <RootComponent
      basename={
        process.env.NODE_ENV === 'production' ? '/examples/subapp/react16' : '/'
      }

      dao={dao}
    />,
    document.querySelector('#root'),
  );
}
