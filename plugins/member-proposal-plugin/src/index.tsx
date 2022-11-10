import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './root';
import { IDAO } from './extpoints/dao_app';
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

export const setup = (dao: IDAO) => {
  console.log("plugin setup")

  dao.registerApp({
    name: "member_app",
    activeWhen: "/members",
    icon: "data:image/png;base64,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",
    provider: (props) => {
      props.dao = {
        name: dao.name,
        address: dao.address,
        daoType: dao.daoType,
      }

      return provider(props)
    },
  })

  dao.registerAction(new MemberProposalAction(dao))
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
