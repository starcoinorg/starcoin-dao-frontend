import React from 'react';
import ReactDOM from 'react-dom';
import RootComponent from './root';
import { IDAO } from './extpoints/dao_app';

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
    name: "plugins",
    activeWhen: "/plugin_management",
    icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAABmJLR0QA/wD/AP+gvaeTAAAEdElEQVRYhcXZW6hVRRgH8N8xI5M0IQ1KzGNlV8misMRKSwmiHorsghkWFfnQQ5kWvpRGF0ywy0Pli/RgkFEgIZIPXS26YD1YWUSUXdAyjxeisjR3DzObNc5Ze+91jntv/zCstb6Z75uPWd/Mdxka41SsxI84gFrWDsS+F+PYI4qZ2Ku/ko3aHlzRDcV6SmgnYzNOiN+/Ywv2Z+OOxrkYHb/7cB62tV/N5litWLlXMKzJ2GFYk4xf3XHtMkzDwTj5NoyI9Bl4GV9iA0YlPCPi2FrkndYtZYfgM8VqzYu05/W32Rsy3nlJ36bI13HcnUz6sWDfj2SK/ok3cXzG2xN56uPu6rSyo7AjTvYfpmAM/o60f3EHjmoiY0rkreE3h5pN2/G0YnVWRdptCW15RTmrEp4VbdbxEOxSbJrxkfZQMvlVFeWMV2zavjbriGJzbIzPHsyJ7+uF3f8RPqgob47ibN/YbODh4nTsU2ysUwYhYyz+iDL+wRlt0y7B0Pj8Ds9hEYbjCcwdoKxlOC6+P4Nvs/4JuFEwm6H6Y69w0rwhxCktMRLbDc4BNHI4BLN7XHGCtGpfY1LViW9PGKs6gCFxbOpwUiytqGjatuOkKgrnDmBRBZ4Hk/F1h1PH+YrQdB8W4CwhHM3bdGGj1mW91kjBHFPwocLO1uMTYSOlOAaX4Or4fUAwjU8T2e/i8vh9H56N7xfgUsW5/1ekj8BXGBe/Z+LtMsVzLDCwX3gwKpTi5qT/i7gAY/FWxvtYBb5KuF6Ig1spuwXXZbzD8VMy5kqciB9K+O/JeHvwXtJ/b1WF68y9gn3Nytr02FdmVulGq9viSwnte8zH5AbzTlbYfp8iSegIegWbrMVnr2Cbdce0Q1jtVkjD2hc6omnEymSipZF2UUJbWVHOaGF1a8Jqj6NLgbaQF9ZzwncGKaPWJl36ocwkCAnqrAHIKTWJsg2TokeIAcYJWXKK/fhZsfNTLMXD8f11zB6AogSHs0lIGHbhTOxsxTQb36jm+/Mcr+xYq4pBHWsPVFA0b/dnMlIHsFl1B3BLwtfPcVRxzesEd1mGSbgmvg/ENTfCSKGUUNk158HPwqx/jPC7UyxKxrcKfhZqHPzMEDKbpsFPjrL6wnAswS+RvhunJTytwsslBm5e21QIL8sqOKMyZert2oy3VQD/qPIKaKPY5JxGSqa/b5kQ2xLKUnOFutlNkbYP7wsH/3Ihg0ixGrfG96eErDvF+CirV/kG3CMkvOtUSJEmCvFuTUgkxwpnX33VduDsFjLyJHRiq0kPB2sVv2RxpM1PaPmR1QiLE561bdbxENSDjLSQsjCZfGpFOR0vpNSxQqFcvVQ1WrDLJ7V24XV0rVSVp/gXD0LGhbpYDCSUSPMzuCpyh3Nn27UrwRDBrTZyAM2Q1jM+170421TFpvlV/8J1GXKHc1nHtGuA9FJmjeaXMsfi1WR8xy9lqlx79QkRVNm116Rk3E4h2+36tRfhknCP6sHKbiHaOqKYIORSWzW+ut0q5F4TuqXU/5s+6CLofxZzAAAAAElFTkSuQmCC",
    provider: (props) => {
      props.dao = {
        name: dao.name,
        address: dao.address,
        daoType: dao.daoType,
      }

      return provider(props)
    },
  })
}

export const teardown = () => {
  console.log("plugin teardown")
}

// 这能够让子应用独立运行起来，以保证后续子应用能脱离主应用独立运行，方便调试、开发
if (!window.__GARFISH__) {
  const dao = {
    name: "StarcoinDAO",
    address: "0x00000000000000000000000000000001", 
    daoType: '0x00000000000000000000000000000001::StarcoinDAO::StarcoinDAO',
    registerApp: function(appInfo) {
      console.log("register App:", appInfo);
      
      const provider = appInfo.provider({
        basename: process.env.NODE_ENV === 'production' ? '/plugins/install-plugin-proposal-plugin' : '/',
        dom: document,
      });

      provider.render();
    }
  }

  setup(dao);

  window.starcoin.request({
    method: 'stc_requestAccounts',
  })
}
