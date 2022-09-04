import Garfish from 'garfish';
import React, {
  useContext,
  createContext,
  useEffect,
  useState,
  useCallback,
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
    if (res.startsWith('ipfs:://')) {
      const ipfs_cid = res.substring(8);
      return `https://ipfs.filebase.io/ipfs/${ipfs_cid}/`.toString();
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
      const basename = `/`;
      const activeWhen = `/dao/${daochain}/${daoid}/plugins${appInfo.activeWhen}`;
      console.log(`registerApp ${appInfo.name}, path: ${activeWhen}`);

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
        path: activeWhen,
      });

      setPluginMenus(pluginMenus);
    };
  }

  const PluginOutlet = ({ children }) => {
    return <div id='submodule'>{children}</div>;
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
