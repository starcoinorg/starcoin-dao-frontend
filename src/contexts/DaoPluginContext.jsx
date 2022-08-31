import Garfish from 'garfish';
import React, { useContext, createContext, useEffect, useState } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { GarfishInit } from '../garfishInit';
import { useMetaData } from './MetaDataContext';

export const DaoPluginContext = createContext();

export const DaoPluginProvider = ({ children }) => {
  const { path } = useRouteMatch();
  const { daoid, daochain } = useParams();
  const { daoMetaData, customTerms, refetchMetaData } = useMetaData();

  const [loadedPlugins, setloadedPlugins] = useState([]);
  const [pluginMenus, setPluginMenus] = useState([]);
  const [pluginLoaded, setPluginLoaded] = useState(false);

  const registerApp = async app => {
    const activeWhen = `/newRegister${app.activeWhen}`;

    // 调用 Garfish.registerApp 动态注册子应用
    Garfish.registerApp({
      name: app.name,
      basename: '/examples',
      activeWhen: activeWhen,
      entry: 'cached',
    });

    pluginMenus.push({
      key: app.name,
      icon: <img src={app.icon} className='sidebar-item-icon' />,
      title: `【PluginApp】${app.name}`,
      path: activeWhen,
    });

    setPluginMenus(pluginMenus);
  };

  const adapterURI = res => {
    if (res.startsWith('ipfs:://')) {
      const ipfs_cid = res.substring(8);
      return `https://ipfs.filebase.io/ipfs/${ipfs_cid}`.toString();
    } else {
      return res.toString();
    }
  };

  const PluginOutlet = ({ name, props }) => {
    return <div id='submodule'>PluginOutlet</div>;
  };

  useEffect(async () => {
    if (!daoMetaData) {
      return;
    }

    if (pluginLoaded) {
      console.log('plugin already loaded!');
      return;
    }

    await GarfishInit(path);

    const ctx = {
      daoid,
      daochain,
      daoMetaData,
      loadedPlugins,
      registerApp,
      adapterURI,
    };

    const daoPlugins = daoMetaData.installedPlugins;
    for (const i in daoPlugins) {
      const plugin_info = daoPlugins[i];

      const app = await Garfish.preLoadApp(plugin_info.name, {
        entry: ctx.adapterURI(plugin_info.js_entry_uri),
      });

      const plugin = app?.cjsModules.exports;
      plugin?.setup(ctx);

      loadedPlugins.push(plugin);
    }

    setloadedPlugins(loadedPlugins);
    setPluginLoaded(true);
  }, [path, daoMetaData]);

  return (
    <DaoPluginContext.Provider
      value={{
        pluginLoaded,
        pluginMenus,
        PluginOutlet,
      }}
    >
      {children}
    </DaoPluginContext.Provider>
  );
};

export const useDaoPlugin = () => {
  const { pluginLoaded, pluginMenus, PluginOutlet } = useContext(
    DaoPluginContext,
  );

  return {
    pluginLoaded,
    pluginMenus,
    PluginOutlet,
  };
};
