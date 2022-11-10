import {utils, bcs} from "@starcoin/starcoin"
import {hexlify} from '@ethersproject/bytes'
import {getProvder} from "./stcWalletSdk";
import {nodeUrlMap} from "./consts";
import { utils as web3Utils } from 'web3'

export interface IPlugin {
  id: string,
  type: string,
  name: string,
  description: string,
  version_number?: number,
  version?: string,
  star: number,
  implement_extpoints?: Array<string>,
  depend_extpoints?: Array<string>,
  js_entry_uri?: string,
  created_at?: number,
}

export const hexVectorToStringArray = (vec):Array<string> => {
  let rets = new Array<string>();

  for (const i in vec) {
    const item = web3Utils.hexToString(vec[i]);
    rets.push(item);
  }

  return rets;
};

export const getDaoInstalledPluginIds = async (daoId): Promise<Array<string>> => {
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

  let pluginIds = new Array<string>();
  for (const key in installedPluginInfos.resources) {
    const pluginType = key.substring(key.indexOf('<') + 1, key.indexOf('>'));
 
    if (pluginType) {
      pluginIds.push(pluginType);
    }
  }

  return pluginIds;
};

export const getDaoInstalledPlugins = async (daoId): Promise<Array<IPlugin>> => {
  const pluginIds = await getDaoInstalledPluginIds(daoId);

  let plugins = new Array<IPlugin>();
  for (const i in pluginIds) {
    const plugin = await getPluginInfo(pluginIds[i]);

    if (plugin && plugin.js_entry_uri) {
      plugins.push(plugin);
    }
  }

  return plugins;
};

const decodePlugin = (pluginType, plugin): IPlugin => {
  const plugin_info = {
    id: plugin.id,
    type: pluginType,
    name: web3Utils.hexToString(plugin.name),
    description: web3Utils.hexToString(plugin.description),
    star: 0,
  };

  if (plugin.next_version_number == 1) {
    return plugin_info;
  }

  const version = plugin.versions[plugin.next_version_number - 2];

  return {
    ...plugin_info,
    version_number: version.number,
    version: web3Utils.hexToString(version.tag),
    star: version.star,
    implement_extpoints: hexVectorToStringArray(version.implement_extpoints),
    depend_extpoints: hexVectorToStringArray(version.depend_extpoints),
    js_entry_uri: web3Utils.hexToString(version.js_entry_uri),
    created_at: version.created_at,
  };
}

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
    return decodePlugin(plugin_type, plugin);
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const listPlugins = async (startIndex:number, count: number) => {
  const pluginEntrys = await window.starcoin.request({
    method: 'state.list_resource',
    params: [
      '0x1',
      {
        resource_types: [
          '0x1::DAOPluginMarketplace::PluginEntry',
        ],
        decode: true,
        start_index: startIndex,
        max_size: count,
      },
    ],
  });

  let plugins = new Array<IPlugin>();
  for (const key in pluginEntrys.resources) {
    const plugin = pluginEntrys.resources[key];
    const pluginType = key.substring(key.indexOf('<') + 1, key.indexOf('>'));
    plugins.push(decodePlugin(pluginType, plugin.json));
  }

  return plugins;
};

export const isPluginInstalled = (installedPluginIds: Array<string>, pluginId: string): boolean => {
  return installedPluginIds.indexOf(pluginId) >= 0;
}

export async function installPluginProposal(
  daoType:string,
  pluginType: string,
  title: string,
  introduction: string,
  description: string, 
  action_delay: number,
) :Promise<string>  {
  try {
      const tokens = pluginType.split('::');
      const functionId = `${tokens[0]}::${tokens[1]}::install_plugin_proposal_entry`
      const tyArgs = [daoType]
      const args = [
        title,
        introduction,
        description,
        action_delay,
      ]

      console.log("createMemberProposal tyArgs:", tyArgs);
      console.log("createMemberProposal args:", args);
      console.log("window.starcoin:", window.starcoin);

      const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
      console.log("nodeUrl:", nodeUrl);

      const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)
      // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
      const payloadInHex = (function () {
          const se = new bcs.BcsSerializer()
          scriptFunction.serialize(se)
          return hexlify(se.getBytes())
      })()

      const txParams = {
          data: payloadInHex,
          expiredSecs: 10
      }

      console.log("txParams:", txParams);
      const starcoinProvider = await getProvder();

      console.log("starcoinProvider:", starcoinProvider);
      const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
      return transactionHash
  } catch (error) {
      console.log("installPluginProposal error:", error);
      throw error
  }
}

export async function unInstallPluginProposal(
  daoType:string,
  pluginType: string,
  description: string, 
  action_delay: number,
) :Promise<string>  {
  try {
      const tokens = pluginType.split('::');
      const functionId = `${tokens[0]}::${tokens[1]}::install_plugin_proposal_entry`
      const tyArgs = [daoType]
      const args = [
        description,
        action_delay,
      ]

      console.log("createMemberProposal tyArgs:", tyArgs);
      console.log("createMemberProposal args:", args);
      console.log("window.starcoin:", window.starcoin);

      const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
      console.log("nodeUrl:", nodeUrl);

      const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)
      // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
      const payloadInHex = (function () {
          const se = new bcs.BcsSerializer()
          scriptFunction.serialize(se)
          return hexlify(se.getBytes())
      })()

      const txParams = {
          data: payloadInHex,
          expiredSecs: 10
      }

      console.log("txParams:", txParams);
      const starcoinProvider = await getProvder();

      console.log("starcoinProvider:", starcoinProvider);
      const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
      return transactionHash
  } catch (error) {
      console.log("installPluginProposal error:", error);
      throw error
  }
}

export async function starPlugin(
  pluginType: string,
) :Promise<string>  {
  try {
      const functionId = `0x1::DAOPluginMarketplace::star_plugin`
      const tyArgs = [pluginType]
      const args = []

      console.log("createMemberProposal tyArgs:", tyArgs);
      console.log("createMemberProposal args:", args);
      console.log("window.starcoin:", window.starcoin);

      const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
      console.log("nodeUrl:", nodeUrl);

      const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)
      // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
      const payloadInHex = (function () {
          const se = new bcs.BcsSerializer()
          scriptFunction.serialize(se)
          return hexlify(se.getBytes())
      })()

      const txParams = {
          data: payloadInHex,
          expiredSecs: 10
      }

      console.log("txParams:", txParams);
      const starcoinProvider = await getProvder();

      console.log("starcoinProvider:", starcoinProvider);
      const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
      return transactionHash
  } catch (error) {
      console.log("installPluginProposal error:", error);
      throw error
  }
}

export async function unstarPlugin(
  pluginType: string,
) :Promise<string>  {
  try {
      const functionId = `0x1::DAOPluginMarketplace::unstar_plugin`
      const tyArgs = [pluginType]
      const args = []

      console.log("createMemberProposal tyArgs:", tyArgs);
      console.log("createMemberProposal args:", args);
      console.log("window.starcoin:", window.starcoin);

      const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
      console.log("nodeUrl:", nodeUrl);

      const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)
      // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
      const payloadInHex = (function () {
          const se = new bcs.BcsSerializer()
          scriptFunction.serialize(se)
          return hexlify(se.getBytes())
      })()

      const txParams = {
          data: payloadInHex,
          expiredSecs: 10
      }

      console.log("txParams:", txParams);
      const starcoinProvider = await getProvder();

      console.log("starcoinProvider:", starcoinProvider);
      const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
      return transactionHash
  } catch (error) {
      console.log("installPluginProposal error:", error);
      throw error
  }
}

export async function hasStarPlugin(pluginType: string,) {
  try {
    const function_id = '0x1::DAOPluginMarketplace::has_star_plugin';
    const type_args = [pluginType];
    const args = [];

    const starcoinProvider = await getProvder();
    const result = await starcoinProvider.callV2({
      function_id,
      type_args,
      args,
    });

    return web3Utils.hexToString(result[0]);
  } catch (error) {
    console.log('provider.callV2 error:', error);
    throw error;
  }
}