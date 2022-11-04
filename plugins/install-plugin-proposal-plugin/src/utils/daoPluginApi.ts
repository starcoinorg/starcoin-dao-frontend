import { utils } from 'web3';

export interface IPlugin {
  id: string,
  name: string,
  description: string,
  version_number?: number,
  version?: string,
  implement_extpoints?: Array<string>,
  depend_extpoints?: Array<string>,
  js_entry_uri?: string,
  created_at?: number,
}

export const hexVectorToStringArray = (vec):Array<string> => {
  let rets = new Array<string>();

  for (const i in vec) {
    const item = utils.hexToString(vec[i]);
    rets.push(item);
  }

  return rets;
};

export const getDaoInstalledPlugins = async (daoId): Promise<Array<IPlugin>> => {
  const daoAddress = daoId.substring(0, daoId.indexOf('::'));

  const installedPluginInfos = await window.starcoin.request({
    method: 'state.list_resource',
    params: [
      daoAddress,
      {
        resource_types: [
          '0x00000000000000000000000000000001::DAOSpace::InstalledPluginInfo',
        ],
        decode: true,
      },
    ],
  });

  let plugins = new Array<IPlugin>();
  for (const key in installedPluginInfos.resources) {
    const pluginType = key.substring(key.indexOf('<') + 1, key.indexOf('>'));
    const plugin = await getPluginInfo(pluginType);

    if (plugin && plugin.js_entry_uri) {
      plugins.push(plugin);
    }
  }

  return plugins;
};

export const getPluginInfo = async (plugin_type): Promise<IPlugin|null> => {
  try {
    const resp = await window.starcoin.request({
      method: 'state.get_resource',
      params: [
        `0x1`,
        `0x1::DAOPluginMarketplace::PluginEntry<${plugin_type}>`,
        {
          decode: true,
        },
      ],
    });

    const plugin = resp.json;
    const plugin_info = {
      id: plugin.id,
      name: utils.hexToString(plugin.name),
      description: utils.hexToString(plugin.description),
    };

    if (plugin.next_version_number == 1) {
      return plugin_info;
    }

    const version = plugin.versions[plugin.next_version_number - 2];

    return {
      ...plugin_info,
      version_number: version.number,
      version: utils.hexToString(version.tag),
      implement_extpoints: hexVectorToStringArray(version.implement_extpoints),
      depend_extpoints: hexVectorToStringArray(version.depend_extpoints),
      js_entry_uri: utils.hexToString(version.js_entry_uri),
      created_at: version.created_at,
    };
  } catch (error) {
    console.error(error);
  }

  return null;
};
