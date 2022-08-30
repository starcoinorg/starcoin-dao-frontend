import Garfish from 'garfish';
import React from 'react';
import * as ReactDom from 'react-dom';
import * as ReactRouterDom from 'react-router-dom';
import { GarfishEsModule } from '@garfish/es-module';
import { AppLoader } from './utils/garfish/appLoaderPlugin';

export const GarfishInit = async basename => {
  Garfish.setExternal({
    react: React,
    'react-dom': ReactDom,
    'react-router-dom': ReactRouterDom,
  });

  Garfish.channel.on('event', msg => {
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
    plugins: [GarfishEsModule(), AppLoader()],
  };

  try {
    Garfish.run(config);
  } catch (error) {
    console.log('garfish init error', error);
  }
};
