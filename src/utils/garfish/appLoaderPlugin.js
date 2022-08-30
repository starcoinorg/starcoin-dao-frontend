
import { getRenderNode } from '@garfish/utils';

export function AppLoader(_args) {
  return function (garfish) {
    garfish.preLoadApp = async function (
      appName,
      options,
    ) {
      const app = await garfish.loadApp(appName, {
        cache: true,
        preCompiled: true,
        entry: options?.entry,
        ...options
      })
      const rets = await app?.compileAndRenderContainer();
      if (rets) {
        await rets.asyncScripts
      }
      
      return app
    }

    return {
      name: 'app-loader',
      version: "v0.1.0",
      afterLoad(appInfo, appInstance) {
        if (!appInfo.preCompiled || appInstance == undefined) {
          return
        }

        appInstance.compiled = false
        const originCompileAndRenderContainer = appInstance.compileAndRenderContainer
        appInstance.compileAndRenderContainer = async function() {
          if (this.compiled) {
            const wrapperNode = await getRenderNode(this.appInfo.domGetter);
            if (typeof wrapperNode.appendChild === 'function') {
              wrapperNode.appendChild(this.appContainer);
            }

            return {
              asyncScripts: this.asyncScripts,
            }
          }

          const promise = originCompileAndRenderContainer.call(this)
          const { asyncScripts } = await promise;
          this.compiled = true
          this.asyncScripts = asyncScripts;

          return {
            asyncScripts: asyncScripts,
          }
        }
      },
    }
  };
}
