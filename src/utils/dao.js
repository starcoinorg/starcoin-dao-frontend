import { utils } from 'web3';
import { bcs } from '@starcoin/starcoin';
import { MINION_TYPES } from './proposalUtils';
import { hexlify } from '@ethersproject/bytes';
import { getPluginInfo } from './marketplace';
import { nodeUrlMap } from './consts';

const orderDaosByNetwork = (userHubDaos, userNetwork) => ({
  currentNetwork: userHubDaos.find(dao => dao.networkID === userNetwork) || [],
  otherNetworks: userHubDaos.filter(dao => dao.networkID !== userNetwork)
    ?.length
    ? [...userHubDaos.filter(dao => dao.networkID !== userNetwork)]
    : [],
});
const excludeVersionsBelow = (daos, version) =>
  daos.filter(dao => dao.meta && dao.meta.version >= version);
const excludeEmptyNetworks = networks =>
  networks.filter(network => network?.data?.length);

export const getDaosByNetwork = (userHubDaos, userNetwork, version = 2) =>
  orderDaosByNetwork(
    excludeEmptyNetworks(
      userHubDaos.map(network => ({
        ...network,
        data: excludeVersionsBelow(network.data, version),
      })),
    ),
    userNetwork,
  );

export const combineDaoDataForHub = userHubDaos => {
  return userHubDaos.reduce(
    (activities, network) => {
      network.data.forEach(dao => {
        activities.proposals = [
          ...activities.proposals,
          ...dao.moloch.proposals
            .filter(prop => prop.activityFeed.unread)
            .map(activity => {
              return { ...activity, daoData: dao.meta };
            }),
        ];
        activities.rageQuits = [
          ...activities.rageQuits,
          ...dao.moloch.rageQuits
            .filter(rage => {
              const now = new Date() / 1000 || 0;
              return +rage.createdAt >= now - 1209600;
            })
            .map(activity => {
              return { ...activity, daoData: dao.meta };
            }),
        ];
      });

      return activities;
    },
    { proposals: [], rageQuits: [] },
  );
};

export const filterDAOsByName = (network, searchTerm) => ({
  ...network,
  data: network?.data?.length
    ? network.data.filter(dao =>
        dao.meta.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [],
});

export const getActiveMembers = members =>
  members.filter(member => +member.shares > 0 || +member.loot > 0);

export const hasMinion = (minions, minionType) => {
  if (Object.values(MINION_TYPES).includes(minionType)) {
    const filteredMinions = minions?.filter(
      minion => minion.minionType === minionType,
    );
    return filteredMinions?.length > 0;
  }
  return false;
};

export const getDaoNFTImage = async (provider, daoType) => {
  const nftTypeInfo = await provider.send('state.get_resource', [
    '0x1',
    `0x00000000000000000000000000000001::NFT::NFTTypeInfoV2<0x00000000000000000000000000000001::DAOSpace::DAOMember<${daoType}>>`,
    {
      decode: true,
    },
  ]);

  const ntfMeta = nftTypeInfo ? nftTypeInfo.json.meta : null;
  if (ntfMeta) {
    if (ntfMeta.image && ntfMeta.image != '0x') {
      return utils.hexToString(ntfMeta.image);
    } else {
      return utils.hexToString(ntfMeta.image_data);
    }
  }

  return null;
};

export const getDaoQuantity = async provider => {
  const result = await provider.send('state.list_resource', [
    '0x1',
    {
      resource_types: [
        '0x00000000000000000000000000000001::DAORegistry::DAORegistry',
      ],
      decode: true,
    },
  ]);

  console.log(result);

  return (
    result.resources[Object.keys(result.resources)[0]].json.next_dao_id - 1
  );
};

export const listDaos = async (provider, index, offset, _opts) => {
  const opts = {
    ..._opts,
  };

  const daoEntrys = await provider.send('state.list_resource', [
    '0x1',
    {
      resource_types: [
        '0x00000000000000000000000000000001::DAORegistry::DAORegistryEntry',
      ],
      decode: true,
      start_index: index * offset,
      max_size: offset,
    },
  ]);

  let daos = [];
  for (const key in daoEntrys.resources) {
    const daoId = key.substring(key.indexOf('<') + 1, key.indexOf('>'));
    const dao = await getDaoDetail(
      provider,
      daoId,
      opts.withLogo,
      opts.withPlugins,
      opts.withConfig,
    );
    daos.push(dao);
  }

  return daos;
};

export const getDao = async (provider, daoAddress) => {
  const daoInfo = await provider.send('state.get_resource', [
    daoAddress,
    '0x00000000000000000000000000000001::DAOSpace::DAO',
    {
      decode: true,
    },
  ]);

  return {
    id: daoInfo.json.id,
    name: utils.hexToString(daoInfo.json.name),
    description: utils.hexToString(daoInfo.json.description),
    dao_address: daoAddress,
  };
};

export const getDaoInstalledPlugins = async (provider, daoId) => {
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

  let plugins = [];
  for (const key in installedPluginInfos.resources) {
    const pluginType = key.substring(key.indexOf('<') + 1, key.indexOf('>'));
    const pluginId = installedPluginInfos.resources[key].json.plugin_id;

    plugins.push({
      pluginId,
      pluginType,
    });
  }

  return plugins;
};

export const getDaoConfig = async (provider, daoId) => {
  const daoAddress = daoId.substring(0, daoId.indexOf('::'));

  const daoConfig = await provider.send('state.get_resource', [
    daoAddress,
    '0x00000000000000000000000000000001::Config::Config<0x00000000000000000000000000000001::DAOSpace::DAOConfig>',
    {
      decode: true,
    },
  ]);

  if (daoConfig) {
    return {
      min_action_delay: daoConfig.json.payload.min_action_delay,
      min_proposal_deposit: daoConfig.json.payload.min_proposal_deposit,
      voting_delay: daoConfig.json.payload.voting_delay,
      voting_period: daoConfig.json.payload.voting_period,
      voting_quorum_rate: daoConfig.json.payload.voting_quorum_rate,
    };
  }

  return null;
};

export const getDaoDetail = async (
  provider,
  daoId,
  withLogo = true,
  withPlugins = true,
  withConfig = false,
) => {
  const daoTypeTag = daoId;
  const daoAddress = daoId.substring(0, daoId.indexOf('::'));
  const daoInfo = await getDao(provider, daoAddress);

  let tags = ['DAO'];
  let links = {};
  let long_description = '';

  let daoLogo = '';
  if (withLogo) {
    daoLogo = await getDaoNFTImage(provider, daoTypeTag);
  }

  let plugins = [];

  if (withPlugins) {
    let installed_web_plugins = await getDaoInstalledPlugins(provider, daoId);
    if (installed_web_plugins) {
      for (const i in installed_web_plugins) {
        const plugin_info = installed_web_plugins[i];
        const plugin = await getPluginInfo(plugin_info.pluginType);

        if (plugin && plugin.js_entry_uri) {
          plugins.push(plugin);
        }
      }
    }
  }

  let daoConfig = {};
  if (withConfig) {
    daoConfig = await getDaoConfig(provider, daoId);
  }

  return {
    daoId: daoTypeTag,
    name: daoInfo.name,
    avatarImg: daoLogo,
    description: daoInfo.description,
    daoAddress: daoAddress,
    longDescription: long_description,
    purposeId: null,
    tags: tags.join(','),
    communityLinksTwitter: links['twitter'],
    communityLinksDiscord: links['discord'],
    communityLinksTelegram: links['telegram'],
    logoUrl: null,
    installedPlugins: plugins,
    moreTags: null,
    sequenceId: 1,
    daoTypeTag: daoTypeTag,
    onChainAddress: null,
    deactivated: null,
    daoConfig: daoConfig,
    createdBy: null,
    updatedBy: null,
    createdAt: null,
    updatedAt: null,
    createdOnChain: null,
  };
};

export const isChainDAO = async daoId => {
  let isChainDao = false;

  if (daoId && daoId.startsWith('0x')) {
    isChainDao = true;
  }

  return isChainDao;
};

export const getDAOAccountCap = async (provider, address) => {
  const cap = await provider.send('state.get_resource', [
    address,
    '0x00000000000000000000000000000001::DAOAccount::DAOAccountCap',
    {
      decode: true,
    },
  ]);

  return cap ? cap.json : null;
};

export const getMemberNFT = async (provider, daoId, address) => {
  const identifierNFT = await provider.send('state.get_resource', [
    address,
    `0x00000000000000000000000000000001::IdentifierNFT::IdentifierNFT<0x00000000000000000000000000000001::DAOSpace::DAOMember<${daoId}>, 0x00000000000000000000000000000001::DAOSpace::DAOMemberBody<${daoId}>>`,
    {
      decode: true,
    },
  ]);

  if (identifierNFT) {
    return {
      id: identifierNFT.json.nft.vec[0].id,
      nft_name: utils.hexToString(identifierNFT.json.nft.vec[0].base_meta.name),
      image_data: utils.hexToString(
        identifierNFT.json.nft.vec[0].base_meta.image_data,
      ),
      init_sbt: identifierNFT.json.nft.vec[0].body.sbt.value,
    };
  }

  return null;
};

export const listUserDaoTypes = async (provider, address) => {
  const daoEntrys = await provider.send('state.list_resource', [
    address,
    {
      resource_types: [
        '0x00000000000000000000000000000001::IdentifierNFT::IdentifierNFT',
      ],
      decode: true,
      start_index: 0,
      max_size: 1000,
    },
  ]);

  let daoTypes = [];
  for (const key in daoEntrys.resources) {
    const nftTypeArgs = key
      .substring(key.indexOf('<') + 1, key.lastIndexOf('>'))
      .split(',');

    if (nftTypeArgs.length > 1) {
      const daoMemberTypeArg = nftTypeArgs[0];

      if (
        daoMemberTypeArg.startsWith(
          '0x00000000000000000000000000000001::DAOSpace::DAOMember',
        )
      ) {
        const daoId = daoMemberTypeArg.substring(
          daoMemberTypeArg.indexOf('<') + 1,
          daoMemberTypeArg.lastIndexOf('>'),
        );

        const daoName = daoId.split('::')[2];
        daoTypes.push({
          daoId: daoId,
          daoName: daoName,
        });
      }
    }
  }

  return daoTypes;
};

const parseOffer = offer => {
  console.log('offer', offer);
  const { offered, time_lock } = offer;

  return {
    for_user: offer.for,
    offered_image_data: offered.image_data,
    offered_image_url: offered.image_url,
    init_sbt: offered.init_sbt,
    to_address: offered.to_address,
    time_lock,
  };
};

export const listUserOffers = async (daoId, address) => {
  const daoAddress = daoId.substring(0, daoId.indexOf('::'));

  const globalCheckpoints = await window.starcoin.request({
    method: 'state.get_resource',
    params: [
      daoAddress,
      `0x00000000000000000000000000000001::Offer::Offers<0x00000000000000000000000000000001::DAOSpace::MemeberOffer<${daoId}>>`,
      {
        decode: true,
      },
    ],
  });

  let offers = [];

  if (globalCheckpoints && globalCheckpoints.json.offers) {
    for (const offer of globalCheckpoints.json.offers) {
      if (offer.for === address) {
        offers.push(parseOffer(offer));
      }
    }
  }

  return offers.reverse();
};

export const doAccecptOffer = async (provider, daoType) => {
  try {
    const functionId = '0x1::DAOSpace::accept_member_offer_entry';
    const tyArgs = [daoType];
    const args = [];

    console.log('doAccecptOffer tyArgs:', tyArgs);
    console.log('doAccecptOffer args:', args);
    console.log('window.starcoin:', window.starcoin);

    const nodeUrl = nodeUrlMap[window.starcoin.networkVersion];
    console.log('nodeUrl:', nodeUrl);

    const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(
      functionId,
      tyArgs,
      args,
      nodeUrl,
    );

    // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
    const payloadInHex = (function() {
      const se = new bcs.BcsSerializer();
      scriptFunction.serialize(se);
      return hexlify(se.getBytes());
    })();
    const txParams = {
      data: payloadInHex,
      expiredSecs: 10,
    };

    console.log('txParams:', txParams);

    console.log('starcoinProvider:', provider);
    const transactionHash = await provider
      .getSigner()
      .sendUncheckedTransaction(txParams);
    return transactionHash;
  } catch (error) {
    console.log('doAccecptOffer error:', error);
    throw error;
  }
};
