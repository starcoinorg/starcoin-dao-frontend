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
import PluginApp from '../pages/PluginApp';

export const DaoPluginContext = createContext();

export const DaoPluginProvider = ({ children }) => {
  const { path } = useRouteMatch();
  const { daoid, daochain } = useParams();
  const { daoMetaData, customTerms, refetchMetaData } = useMetaData();

  const [loadedPlugins, setloadedPlugins] = useState([]);
  const [pluginMenus, setPluginMenus] = useState([]);
  const [pluginLoaded, setPluginLoaded] = useState(false);

  class PluginContext {
    constructor(name) {
      this.name = name;
    }

    registerApp = async app => {
      const basename = `/`;
      const activeWhen = `/dao/${daochain}/${daoid}/plugins${app.activeWhen}`;

      // 调用 Garfish.registerApp 动态注册子应用
      Garfish.registerApp({
        name: this.name,
        basename: basename,
        activeWhen: activeWhen,
        entry: 'cached',
      });

      pluginMenus.push({
        key: this.name,
        icon: <img src={app.icon} className='sidebar-item-icon' />,
        title: `${app.name}`,
        path: activeWhen,
      });

      setPluginMenus(pluginMenus);
    };

    adapterURI = res => {
      if (res.startsWith('ipfs:://')) {
        const ipfs_cid = res.substring(8);
        return `https://ipfs.filebase.io/ipfs/${ipfs_cid}/`.toString();
      } else {
        return res.toString();
      }
    };
  }

  const PluginOutlet = ({ name, props }) => {
    return (
      <PluginApp>
        <div id='submodule'></div>
      </PluginApp>
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

      const ctx = new PluginContext(plugin_info.name);
      const app = await Garfish.preLoadApp(plugin_info.name, {
        entry: ctx.adapterURI(plugin_info.js_entry_uri),
      });

      const plugin = app?.cjsModules.exports;
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
