import { LinkError } from 'apollo-link/lib/linkUtils';
import { utils } from 'web3';
import { MINION_TYPES } from './proposalUtils';

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

export const listDaos = async () => {
  const daoEntrys = await window.starcoin.request({
    method: 'state.list_resource',
    params: [
      '0x1',
      {
        resource_types: [
          '0x00000000000000000000000000000001::DAORegistry::DAORegistryEntry',
        ],
        decode: true,
        start_index: 0,
        max_size: 10,
      },
    ],
  });

  let daos = [];
  for (const key in daoEntrys.resources) {
    const daoId = key.substring(key.indexOf('<') + 1, key.indexOf('>'));
    const dao = await getDaoDetail(daoId);
    daos.push(dao);
  }

  return daos;
};

export const getDao = async daoAddress => {
  const daoInfo = await window.starcoin.request({
    method: 'state.get_resource',
    params: [
      daoAddress,
      '0x00000000000000000000000000000001::DAOSpace::DAO',
      {
        decode: true,
      },
    ],
  });

  return {
    id: daoInfo.json.id,
    name: utils.hexToString(daoInfo.json.name),
    description: utils.hexToString(daoInfo.json.description),
    dao_address: daoAddress,
  };
};

export const getDaoDetail = async daoId => {
  const daoTypeTag = daoId;
  const daoAddress = daoId.substring(0, daoId.indexOf('::'));
  const daoInfo = await getDao(daoAddress);

  const resourceType = `0x00000000000000000000000000000001::DAOSpace::DAOExt<${daoTypeTag}>`;
  const daoExt = await window.starcoin.request({
    method: 'state.get_resource',
    params: [
      daoAddress,
      resourceType,
      {
        decode: true,
      },
    ],
  });

  let tags = ['DAO'];
  if (daoExt.json.ext.tags) {
    for (const i in daoExt.json.ext.tags) {
      const encodedTag = daoExt.json.ext.tags[i];
      const tag = utils.hexToString(encodedTag);
      tags.push(tag);
    }
  }

  let links = {};
  if (daoExt.json.ext.links) {
    for (const i in daoExt.json.ext.links) {
      const encodedLink = daoExt.json.ext.links[i];
      const link = utils.hexToString(encodedLink);
      const token = link.split('=');
      if (token.length == 2) {
        links[token[0]] = token[1];
      }
    }
  }

  let plugins = [];
  if (daoExt.json.ext.installed_web_plugins) {
    for (const i in daoExt.json.ext.installed_web_plugins) {
      const encodedPlugin = daoExt.json.ext.installed_web_plugins[i];
      const plugin = utils.hexToString(encodedPlugin);
      plugins.push(plugin);
    }
  }

  let long_description = '';
  if (daoExt.json.ext.long_description) {
    long_description = utils.hexToString(daoExt.json.ext.long_description);
  }

  return {
    daoId: daoTypeTag,
    name: daoInfo.name,
    description: daoInfo.description,
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
