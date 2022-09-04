import React from 'react';
import ReactDOM from 'react-dom';
import { reactBridge } from '@garfish/bridge-react';
import RootComponent from './root';
import ErrorBoundary from './ErrorBoundary';
import { Message } from '@arco-design/web-react';
import { IDAO } from './extpoints/dao_app';

// 在首次加载和执行时会触发该函数
// export const provider = (props) => {
//   const root = props.dom
//     ? props.dom.querySelector("#root")
//     : document.querySelector("#root");

//   return {
//     render() {
//       ReactDOM.render(<RootComponent {...props} />, root);
//     },
//     destroy({ dom }) {
//       ReactDOM.unmountComponentAtNode(
//         dom ? dom.querySelector("#root") : document.querySelector("#root")
//       );
//     },
//   };
// };

export const provider = reactBridge({
  el: '#root',
  rootComponent: RootComponent,
  errorBoundary: () => <ErrorBoundary />,
});

export const setup = (dao: IDAO) => {
  console.log("plugin setup")
  Message.info("plugin setup")

  dao.registerApp({
    name: "proposal_app",
    activeWhen: "/proposal",
    provider: provider,
  })
}

export const teardown = () => {
  console.log("plugin teardown")
  Message.info("plugin teardown")
}

// 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
if (!window.__GARFISH__) {
  ReactDOM.render(
    <RootComponent
      basename={
        process.env.NODE_ENV === 'production' ? '/examples/subapp/react16' : '/'
      }
    />,
    document.querySelector('#root'),
  );
}
