import { LinkError } from 'apollo-link/lib/linkUtils';
import { utils } from 'web3';
import { MINION_TYPES } from './proposalUtils';
import { getPluginInfo } from './marketplace';

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

export const listDaos = async (provider, _opts) => {
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
      start_index: 0,
      max_size: 3,
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

export const getDaoDetail = async (
  provider,
  daoId,
  withLogo = true,
  withPlugins = true,
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
