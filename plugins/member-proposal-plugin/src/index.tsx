import React from 'react';
import ReactDOM from 'react-dom';
import { FaUsers } from "react-icons/fa";
import RootComponent from './root';
import { IDaoPluginContext } from './extpoints/dao_app';
import MemberProposalAction from './actions/member_proposal_action';

// 在首次加载和执行时会触发该函数
export const provider = (props) => {
   const root = props.dom
     ? props.dom.querySelector("#root")
     : document.querySelector("#root");

   console.log("provider props:", props);

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

export const setup = (ctx: IDaoPluginContext) => {
  console.log("plugin setup")

  ctx.registerApp({
    name: "member_app",
    activeWhen: "/members",
    icon: FaUsers,
    provider: (props) => {
      props.dao = {
        name: ctx.name,
        address: ctx.address,
        daoType: ctx.daoType,
      }

      return provider(props)
    },
  })

  ctx.registerAction(new MemberProposalAction(ctx))
}

export const teardown = () => {
  console.log("plugin teardown")
}

// 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
if (!window.__GARFISH__) {
  const dao = {
    name: "TestDAO",
    address: "0x4e375BB50D5B32a965B6E783E55a7cef", 
    daoType: '0x4e375BB50D5B32a965B6E783E55a7cef::TESTDAO::TESTDAO',
    registerApp: function(appInfo) {
      console.log("register App:", appInfo);
      
      const provider = appInfo.provider({
        basename: process.env.NODE_ENV === 'production' ? '/plugins/member-proposal-plugin' : '/',
        dom: document,
      });

      provider.render();
    },
    registerAction: async function(action): Promise<string> {
      console.log("register Action:", action);
      return "ok"
    }
  }

  setup(dao);

  window.starcoin.request({
    method: 'stc_requestAccounts',
  })
}
