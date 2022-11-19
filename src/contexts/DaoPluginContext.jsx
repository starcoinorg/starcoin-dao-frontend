import {
  useContext,
  createContext,
  useEffect,
  useState,
  useCallback,
  memo,
} from 'react';
import Garfish from 'garfish';
import { useParams, useRouteMatch } from 'react-router-dom';
import { GarfishInit } from '../garfishInit';
import { useMetaData } from './MetaDataContext';
import { useDaoAction } from './DaoActionContext';
import { useCustomTheme } from './CustomThemeContext';
import { useInjectedProvider } from './InjectedProviderContext';

export const SupportInnerPluginNames = [
  'inner-plugin://install-plugin-proposal-plugin',
  'inner-plugin://member-proposal-plugin',
  'inner-plugin://stake-to-sbt-plugin',
];

export const DaoPluginContext = createContext();

const PluginOutlet = memo(() => {
  return <div id='submodule'></div>;
});

export const DaoPluginProvider = ({ children }) => {
  const { path } = useRouteMatch();
  const { daochain, daoid } = useParams();
  const { daoMetaData, customTerms, refetchMetaData } = useMetaData();
  const { injectedProvider, address } = useInjectedProvider();
  const { theme } = useCustomTheme();
  const { registerAction } = useDaoAction();

  const [garfishInstance, setGarfishInstance] = useState(null);
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
    constructor(garfishInstance, appInstance, name, address, daoType, theme) {
      this.garfishInstance = garfishInstance;
      this.appInstance = appInstance;
      this.name = name;
      this.address = address;
      this.daoType = daoType;
      this.theme = theme;
    }

    registerApp = async appInfo => {
      const basename = `/dao/${daochain}/${daoid}/plugins`;
      const activeWhen = `${appInfo.activeWhen}`;
      const path = `${basename}${activeWhen}/home`;
      console.log(`registerApp ${appInfo.name}, path: ${path}`);

      let appIcon = appInfo.icon;
      if (typeof appInfo.icon === 'string') {
        appIcon = props => <img src={appInfo.icon} {...props} />;
      }

      if (appInfo.provider) {
        this.appInstance.cjsModules.exports = {
          provider: appInfo.provider,
        };
      }

      // 调用 Garfish.registerApp 动态注册子应用
      this.garfishInstance.registerApp({
        name: this.name,
        basename: basename,
        activeWhen: activeWhen,
        entry: 'cached',
      });

      pluginMenus.push({
        key: this.name,
        icon: appIcon,
        title: `${appInfo.name}`,
        path: path,
      });
    };

    registerAction = async action => {
      registerAction(action);
    };

    getInjectedProvider() {
      return injectedProvider;
    }

    getWalletAddress() {
      return address;
    }
  }

  const loadDaoPlugins = async () => {
    const garfishInstance = await GarfishInit(path);

    const daoPlugins = daoMetaData.installedPlugins;
    for (const i in daoPlugins) {
      const plugin_info = daoPlugins[i];
      console.log('plugin_info:', plugin_info);

      if (
        plugin_info.js_entry_uri.startsWith('inner-plugin://') &&
        SupportInnerPluginNames.indexOf(plugin_info.js_entry_uri) < 0
      ) {
        continue;
      }

      try {
        const app = await garfishInstance.loadApp(plugin_info.name, {
          cache: true,
          preCompiled: true,
          entry: adapterURI(plugin_info.js_entry_uri),
        });

        const plugin = app?.cjsModules.exports;

        const ctx = new PluginContext(
          garfishInstance,
          app,
          plugin_info.name,
          daoMetaData.daoAddress,
          daoMetaData.daoId,
          theme,
        );
        plugin?.setup(ctx);

        loadedPlugins.push(plugin);
      } catch (e) {
        console.error(`Error in load plugin ${plugin_info.name}`, e);
      }
    }

    setGarfishInstance(garfishInstance);
    setloadedPlugins(loadedPlugins);
    setPluginMenus(pluginMenus);
    setPluginLoaded(true);
  };

  const unloadAllDaoPlugins = async () => {
    if (garfishInstance) {
      garfishInstance.apps.forEach(app => {
        garfishInstance.unloadApp(app.name);
      });
    }

    setGarfishInstance(null);
    setloadedPlugins([]);
    setPluginMenus([]);
    setPluginLoaded(false);
  };

  useEffect(() => {
    if (!daoMetaData) {
      return;
    }

    if (pluginLoaded) {
      console.log('plugin already loaded!');
      return;
    }

    loadDaoPlugins();

    return () => {
      unloadAllDaoPlugins();
    };
  }, [daochain, daoid, daoMetaData]);

  return (
    <DaoPluginContext.Provider
      value={{
        garfishInstance,
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
  const {
    garfishInstance,
    pluginLoaded,
    pluginMenus,
    PluginOutlet,
  } = useContext(DaoPluginContext);

  return {
    garfishInstance,
    pluginLoaded,
    pluginMenus,
    PluginOutlet,
  };
};
