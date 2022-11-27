import {providers, utils, bcs} from "@starcoin/starcoin"
import {hexlify} from '@ethersproject/bytes'
import {nodeUrlMap} from "./consts";
import { utils as web3Utils } from 'web3'

export interface IVersion {
  number: number,
  tag: string,
  implement_extpoints?: Array<string>,
  depend_extpoints?: Array<string>,
  js_entry_uri?: string,
  created_at?: number
}

export interface IPlugin {
  id: string,
  type: string,
  name: string,
  description: string,
  labels: Array<string>,
  version_number?: number,
  versions?: Array<IVersion>,
  star_count: number,
  created_at?: number,
  updated_at?: number,
}

export const hexVectorToStringArray = (vec):Array<string> => {
  let rets = new Array<string>();

  for (const i in vec) {
    const item = web3Utils.hexToString(vec[i]);
    rets.push(item);
  }

  return rets;
};

export const getDaoInstalledPluginIds = async (provider: providers.JsonRpcProvider, daoId: string): Promise<Array<string>> => {
  if (!daoId) {
    return new Array<string>();
  }

  const daoAddress = daoId.substring(0, daoId.indexOf('::'));

  const installedPluginInfos = await provider.send('state.list_resource', [
    daoAddress,
    {
      resource_types: [
        '0x00000000000000000000000000000001::DAOSpace::InstalledPluginInfo',
      ],
      decode: true,
    },
  ]);

  let pluginIds = new Array<string>();
  for (const key in installedPluginInfos.resources) {
    const pluginType = key.substring(key.indexOf('<') + 1, key.indexOf('>'));
 
    if (pluginType) {
      pluginIds.push(pluginType);
    }
  }

  return pluginIds;
};

export const getDaoInstalledPlugins = async (provider: providers.JsonRpcProvider, daoId: string): Promise<Array<IPlugin>> => {
  const pluginIds = await getDaoInstalledPluginIds(provider, daoId);

  let plugins = new Array<IPlugin>();
  for (const i in pluginIds) {
    const plugin = await getPluginInfo(provider, pluginIds[i]);

    if (plugin && plugin.versions && plugin.versions.length > 0) {
      plugins.push(plugin);
    }
  }

  return plugins;
};

const decodePluginVersion = (version): IVersion => {
  return {
    number: version.number,
    tag: web3Utils.hexToString(version.tag),
    implement_extpoints: hexVectorToStringArray(version.implement_extpoints),
    depend_extpoints: hexVectorToStringArray(version.depend_extpoints),
    js_entry_uri: web3Utils.hexToString(version.js_entry_uri),
    created_at: version.created_at * 1000,
  };
}

const decodePlugin = (pluginType, plugin): IPlugin => {
  let plugin_info = {
    id: plugin.id,
    type: pluginType,
    name: web3Utils.hexToString(plugin.name),
    description: web3Utils.hexToString(plugin.description),
    labels: new Array<string>(),
    versions: new Array<IVersion>(),
    star_count: plugin.star_count,
    created_at: plugin.created_at * 1000,
    updated_at: plugin.updated_at * 1000,
  };

  let labels = new Array<string>();
  if (plugin.labels) {
    if (plugin_info.name.startsWith("0x1::")) {
      labels.push("inner");
    }

    const otherLabels = hexVectorToStringArray(plugin.labels);
    if (otherLabels) {
      labels = labels.concat(otherLabels);
    }
  }
  plugin_info.labels = labels;

  if (plugin.next_version_number == 1) {
    return plugin_info;
  }

  let versions = new Array<IVersion>();
  for (let v in plugin.versions) {
    versions.push(decodePluginVersion(plugin.versions[v]));
  }
  plugin_info.versions = versions;

  return plugin_info;
}

export const getPluginInfo = async (provider: providers.JsonRpcProvider, plugin_type: string): Promise<IPlugin|null> => {
  try {
    const resp = await provider.send('state.get_resource', [
      `0x1`,
      `0x1::DAOPluginMarketplace::PluginEntry<${plugin_type}>`,
      {
        decode: true,
      },
    ]);

    const plugin = resp.json;
    return decodePlugin(plugin_type, plugin);
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const listPlugins = async (provider: providers.JsonRpcProvider, startIndex:number, count: number) => {
  const pluginEntrys = await provider.send('state.list_resource', [
    '0x1',
    {
      resource_types: [
        '0x1::DAOPluginMarketplace::PluginEntry',
      ],
      decode: true,
      start_index: startIndex,
      max_size: count,
    },
  ]);

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
  provider: providers.JsonRpcProvider,
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

      const nodeUrl = nodeUrlMap[provider.network.chainId];
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
      console.log("starcoinProvider:", provider);
      const transactionHash = await provider.getSigner().sendUncheckedTransaction(txParams)
      return transactionHash
  } catch (error) {
      console.log("installPluginProposal error:", error);
      throw error
  }
}

export async function executeInstallPluginProposal(
  provider: providers.JsonRpcProvider,
  daoType:string,
  pluginType: string,
  proposalId: string,
) :Promise<string>  {
  try {
      const functionId = '0x1::InstallPluginProposalPlugin::execute_proposal_entry'
      const tyArgs = [daoType, pluginType]
      const args = [
        proposalId,
      ]

      console.log("createMemberProposal tyArgs:", tyArgs);
      console.log("createMemberProposal args:", args);

      const nodeUrl = nodeUrlMap[provider.network.chainId];
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
      console.log("starcoinProvider:", provider);
      const transactionHash = await provider.getSigner().sendUncheckedTransaction(txParams)
      return transactionHash
  } catch (error) {
      console.log("installPluginProposal error:", error);
      throw error
  }
}

export async function starPlugin(
  provider: providers.JsonRpcProvider,
  pluginType: string,
) :Promise<string>  {
  try {
      const functionId = `0x1::DAOPluginMarketplace::star_plugin_entry`
      const tyArgs = [pluginType]
      const args = []

      console.log("createMemberProposal tyArgs:", tyArgs);
      console.log("createMemberProposal args:", args);

      const nodeUrl = nodeUrlMap[provider.network.chainId];
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
      const transactionHash = await provider.getSigner().sendUncheckedTransaction(txParams)
      return transactionHash
  } catch (error) {
      console.log("installPluginProposal error:", error);
      throw error
  }
}

export async function unstarPlugin(
  provider: providers.JsonRpcProvider,
  pluginType: string,
) :Promise<string>  {
  try {
      const functionId = `0x1::DAOPluginMarketplace::unstar_plugin_entry`
      const tyArgs = [pluginType]
      const args = []

      console.log("createMemberProposal tyArgs:", tyArgs);
      console.log("createMemberProposal args:", args);

      const nodeUrl = nodeUrlMap[provider.network.chainId];
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
      const transactionHash = await provider.getSigner().sendUncheckedTransaction(txParams)
      return transactionHash
  } catch (error) {
      console.log("installPluginProposal error:", error);
      throw error
  }
}

export async function hasStarPlugin(provider: providers.JsonRpcProvider, walletAddress, pluginType: string): Promise<boolean> {
  try {
    const resp = await provider.send('state.get_resource', [
      walletAddress,
      `0x1::DAOPluginMarketplace::Star<${pluginType}>`,
      {
        decode: true,
      },
    ]);

    return resp;
  } catch (e) {
    console.log(e);
    throw new Error('get star info error');
  }
}