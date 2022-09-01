import { utils } from 'web3';
import { BOOSTS } from '../data/boosts';
import { MINIONS } from '../data/minions';
import { handleExtractBoosts } from './metadata';

export const devBoostList = {
  name: 'DEV Boosts',
  id: 'dev',
  types: Object.values(BOOSTS).reduce((arr, boost) => {
    if (boost.dev) {
      return [...arr, boost];
    }
    return arr;
  }, []),
};

export const generateLists = (daoMetaData, daoOverview, dev) => {
  const daoBoosts = handleExtractBoosts({ daoMetaData });

  const lists = [
    {
      name: 'Boosts',
      id: 'boosts',
      types: daoBoosts,
    },
    {
      name: 'Minions',
      id: 'minions',
      types:
        daoOverview?.minions.map(minion => ({
          title: minion.details,
          description: minion.minionType,
          id: minion.minionAddress,
          data: MINIONS[minion.minionType],
        })) || [],
    },
  ];
  if (dev && devBoostList.types.length) {
    return [devBoostList, ...lists];
  }
  return lists;
};

export const getSettingsLink = (settings, params) => {
  if (settings.appendToDaoPath) {
    return `/dao/${params.daochain}/${params.daoid}/${settings.appendToDaoPath}`;
  }
};

export const PluginMarketplace_Address = '0x7dA9Cd8048A4620fda9e22977750C517';

export const hexVectorToStringArray = vec => {
  let rets = new Array();

  for (const i in vec) {
    const item = utils.hexToString(vec[i]);
    rets.push(item);
  }

  return rets;
};

export const getPluginInfo = async (plugin_id, version_id) => {
  try {
    const registry = await window.starcoin.request({
      method: 'state.get_resource',
      params: [
        `${PluginMarketplace_Address}`,
        `${PluginMarketplace_Address}::PluginMarketplace::PluginRegistry`,
        {
          decode: true,
        },
      ],
    });

    for (const plugin of registry.json.plugins) {
      if (plugin.id === plugin_id) {
        const plugin_info = {
          id: plugin.id,
          name: utils.hexToString(plugin.name),
          describe: utils.hexToString(plugin.describe),
          git_repo: utils.hexToString(plugin.git_repo),
        };

        for (const version of plugin.versions) {
          if (version.number === version_id) {
            return {
              ...plugin_info,
              version_number: version.number,
              version: utils.hexToString(version.version),
              required_caps: hexVectorToStringArray(version.required_caps),
              export_caps: hexVectorToStringArray(version.export_caps),
              implement_extpoints: hexVectorToStringArray(
                version.implement_extpoints,
              ),
              depend_extpoints: hexVectorToStringArray(
                version.depend_extpoints,
              ),
              contract_module: utils.hexToString(version.contract_module),
              js_entry_uri: utils.hexToString(version.js_entry_uri),
              created_at: version.created_at,
            };
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }

  return null;
};
