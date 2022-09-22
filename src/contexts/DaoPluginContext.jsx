import Garfish from 'garfish';
import React, {
  useContext,
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
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

  const adapterURI = res => {
    if (res.startsWith('ipfs://')) {
      const ipfs_cid = res.substring(7);
      return `https://ipfs.filebase.io/ipfs/${ipfs_cid}/`.toString();
    } else if (res.startsWith('inner-plugin://')) {
      const plugin_name = res.substring(15);
      return `/plugins/${plugin_name}/`.toString();
    } else {
      return res.toString();
    }
  };

  class PluginContext {
    constructor(appInstance, name, address, daoType) {
      this.appInstance = appInstance;
      this.name = name;
      this.address = address;
      this.daoType = daoType;
    }

    registerApp = async appInfo => {
      const basename = `/dao/${daochain}/${daoid}/plugins`;
      const activeWhen = `${appInfo.activeWhen}`;
      const path = `${basename}${activeWhen}/home`;
      console.log(`registerApp ${appInfo.name}, path: ${path}`);

      if (appInfo.provider) {
        this.appInstance.cjsModules.exports = {
          provider: appInfo.provider,
        };
      }

      // 调用 Garfish.registerApp 动态注册子应用
      Garfish.registerApp({
        name: this.name,
        basename: basename,
        activeWhen: activeWhen,
        entry: 'cached',
      });

      pluginMenus.push({
        key: this.name,
        icon: <img src={appInfo.icon} className='sidebar-item-icon' />,
        title: `${appInfo.name}`,
        path: path,
      });
    };
  }

  const PluginOutlet = ({ children }) => {
    return (
      <div>
        <div>{children}</div>
        <div id='submodule'></div>
      </div>
    );
  };

  const loadDaoPlugins = useCallback(async () => {
    if (!daoMetaData) {
      return;
    }

    if (pluginLoaded) {
      console.log('plugin already loaded!');
      return;
    }

    await GarfishInit(path);

    const daoPlugins = daoMetaData.installedPlugins;
    for (const i in daoPlugins) {
      const plugin_info = daoPlugins[i];
      console.log('plugin_info:', plugin_info);

      const app = await Garfish.loadApp(plugin_info.name, {
        cache: true,
        preCompiled: true,
        entry: adapterURI(plugin_info.js_entry_uri),
      });

      const plugin = app?.cjsModules.exports;

      const ctx = new PluginContext(
        app,
        plugin_info.name,
        daoMetaData.daoAddress,
        daoMetaData.daoId,
      );
      plugin?.setup(ctx);

      loadedPlugins.push(plugin);
    }

    setloadedPlugins(loadedPlugins);
    setPluginMenus(pluginMenus);
    setPluginLoaded(true);
  }, [daoMetaData]);

  useEffect(() => {
    loadDaoPlugins();
  }, [loadDaoPlugins]);

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
