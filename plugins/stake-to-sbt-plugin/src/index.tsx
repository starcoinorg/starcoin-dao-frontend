import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './root';
import { IDaoPluginContext, IAction } from './extpoints/dao_app';
import { providers } from "@starcoin/starcoin"
import ProposalAction from './actions/index';
import {VscPackage} from 'react-icons/vsc';

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
    name: "StakeSBT",
    activeWhen: "/stake_sbt",
    icon: VscPackage,
    provider: (props) => {
      props.theme = ctx.theme;  
      props.dao = {
        name: ctx.name,
        address: ctx.address,
        daoType: ctx.daoType,
      };

      props.getInjectedProvider = function() {
        return ctx.getInjectedProvider();
      };

      props.getWalletAddress = async function() {
        return await ctx.getWalletAddress();
      };

      return provider(props)
    },
  })

    ctx.registerAction(new ProposalAction(ctx.daoType))
}

export const teardown = () => {
  console.log("plugin teardown")
}

// 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
if (!window.__GARFISH__) {

  const ctx = {
    name: "StarcoinDAO",
//    address: "0x00000000000000000000000000000001",
//    daoType: '0x00000000000000000000000000000001::StarcoinDAO::StarcoinDAO',
     address: "0xae3d8bba513cb51486a50ec41d08b564",
     daoType: '0xae3d8bba513cb51486a50ec41d08b564::TESTDAOA::TESTDAOA',
    registerApp: function(appInfo) {
      console.log("register App:", appInfo);
      
      const provider = appInfo.provider({
        basename: process.env.NODE_ENV === 'production' ? '/plugins/install-plugin-proposal-plugin' : '/',
        dom: document,
      });

      provider.render();
    },
    registerAction: function(action: IAction) {
      
    },
    getInjectedProvider: function(): providers.JsonRpcProvider|undefined {
      return new providers.Web3Provider(window.starcoin);
    },
    getWalletAddress: async function(): Promise<string> {
      const newAccounts = await window.starcoin.request({
        method: 'stc_requestAccounts',
      });

      return newAccounts[0];
    }
  }

  setup(ctx);
}
