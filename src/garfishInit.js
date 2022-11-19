import React from 'react';
import * as ReactDom from 'react-dom';
import * as ReactRouterDom from 'react-router-dom';
import { GarfishEsModule } from '@garfish/es-module';
import { GarfishCssScope } from '@garfish/css-scope';
import Garfish from '@garfish/core';
import { GarfishRouter } from '@garfish/router';
import { GarfishBrowserVm } from '@garfish/browser-vm';
import { GarfishBrowserSnapshot } from '@garfish/browser-snapshot';
import { def, warn, hasOwn, inBrowser, __GARFISH_FLAG__ } from '@garfish/utils';
import { AppLoader } from './utils/garfish/appLoaderPlugin';

export const GarfishInit = basename => {
  const garfishInstance = new Garfish({
    plugins: [GarfishRouter(), GarfishBrowserVm(), GarfishBrowserSnapshot()],
  });

  garfishInstance.setExternal({
    react: React,
    'react-dom': ReactDom,
    'react-router-dom': ReactRouterDom,
    starcoin: window.starcoin,
  });

  garfishInstance.channel.on('event', msg => {
    console.log(`主应用收到消息：${msg}`);
  });

  const config = {
    basename,
    domGetter: '#submodule',
    disablePreloadApp: true,
    sandbox: {
      strictIsolation: false,
      modules: [
        () => ({
          override: {
            localStorage: window.localStorage,
          },
        }),
      ],
      snapshot: false,
    },
    autoRefreshApp: true,
    protectVariable: [
      'MonitoringInstance',
      'Garfish',
      '__GARFISH_GLOBAL_APP_LIFECYCLE__',
    ],
    plugins: [GarfishEsModule(), GarfishCssScope(), AppLoader()],
  };

  try {
    if (inBrowser()) {
      def(window, '__GARFISH__', true);
    }

    return garfishInstance.run(config);
  } catch (error) {
    console.log('garfish init error', error);
    return null;
  }
};
