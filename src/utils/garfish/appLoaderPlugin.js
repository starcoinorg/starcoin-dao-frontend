import { getRenderNode } from '@garfish/utils';
import { ca } from 'date-fns/locale';

export function AppLoader() {
  return function(garfish) {
    const originloadApp = garfish.loadApp;
    garfish.loadApp = async function(appName, options) {
      const app = await originloadApp.call(this, appName, {
        entry: options?.entry,
        ...options,
      });

      if (options?.preCompiled) {
        const rets = await app?.compileAndRenderContainer();
        if (rets) {
          await rets.asyncScripts;
        }
      }

      return app;
    };

    garfish.unloadApps = async function() {
      const apps = this.cacheApps;
      for (const appName in apps) {
        const app = apps[appName];

        if (app) {
          try {
            await app.unmount();
          } catch (e) {
            console.log('Error in unmount app, error:', e);
          }
        }
      }
    };

    return {
      name: 'app-loader',
      version: 'v0.1.0',

      afterLoad(appInfo, appInstance) {
        if (!appInfo.preCompiled || appInstance == undefined) {
          return;
        }

        appInstance.compiled = false;
        const originCompileAndRenderContainer =
          appInstance.compileAndRenderContainer;
        appInstance.compileAndRenderContainer = async function() {
          if (this.compiled) {
            const wrapperNode = await getRenderNode(this.appInfo.domGetter);
            if (typeof wrapperNode.appendChild === 'function') {
              wrapperNode.appendChild(this.appContainer);
            }

            return {
              asyncScripts: this.asyncScripts,
            };
          }

          const promise = originCompileAndRenderContainer.call(this);
          const { asyncScripts } = await promise;
          this.compiled = true;
          this.asyncScripts = asyncScripts;

          return {
            asyncScripts: asyncScripts,
          };
        };

        window.currentGarfishApp = appInstance;
      },
    };
  };
}
