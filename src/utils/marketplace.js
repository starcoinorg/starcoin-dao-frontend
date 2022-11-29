import { utils } from 'web3';
import { BOOSTS } from '../data/boosts';
import { MINIONS } from '../data/minions';
import { handleExtractBoosts } from './metadata';
import { hexVectorToStringArray } from './hex';

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

export const getPluginInfo = async plugin_type => {
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
