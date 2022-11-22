import * as web3 from 'web3';
import { providers, utils, bcs } from '@starcoin/starcoin';
import { hexlify } from '@ethersproject/bytes';
import { nodeUrlMap } from './consts';

export const ProposalState = {
  PENDING: 1,
  ACTIVE: 2,
  REJECTED: 3,
  DEFEATED: 4,
  AGREED: 5,
  QUEUED: 6,
  EXECUTABLE: 7,
  EXTRACTED: 8,
};

export async function get_access_path(provider, daoType, userAddress) {
  try {
    const function_id = '0x1::SnapshotUtil::get_access_path';
    const type_args = [daoType];
    const args = [userAddress];

    const result = await provider.callV2({
      function_id,
      type_args,
      args,
    });

    return web3.utils.hexToString(result[0]);
  } catch (error) {
    console.log('provider.callV2 error:', error);
    throw error;
  }
}

export async function get_proposal_state(provider, daoType, proposalId) {
  try {
    const function_id = '0x1::DAOSpace::proposal_state';
    const type_args = [daoType];
    const args = ['' + proposalId];

    const result = await provider.callV2({
      function_id,
      type_args,
      args,
    });

    return result[0];
  } catch (error) {
    console.log('provider.callV2 error:', error);
    throw error;
  }
}

export async function get_proposal_state_text(provider, daoType, proposalId) {
  const state = await get_proposal_state(provider, daoType, proposalId);

  switch (state) {
    case ProposalState.PENDING:
      return 'Pending';
    case ProposalState.ACTIVE:
      return 'Active';
    case ProposalState.REJECTED:
      return 'Rejected';
    case ProposalState.DEFEATED:
      return 'Defeated';
    case ProposalState.AGREED:
      return 'Agreed';
    case ProposalState.QUEUED:
      return 'Queued';
    case ProposalState.EXECUTABLE:
      return 'Executable';
    case ProposalState.EXTRACTED:
      return 'Extracted';
    default:
      return 'Unknown';
  }
}

export async function get_with_proof_by_root_raw(
  network,
  access_path,
  state_root,
) {
  let nodeURL = nodeUrlMap[network];
  let provider = new providers.JsonRpcProvider(nodeURL);

  const result = await provider.send('state.get_with_proof_by_root_raw', [
    access_path,
    state_root,
  ]);

  return result;
}

export async function cast_vote(
  provider,
  daoType,
  proposal_id,
  snpashot_raw_proofs,
  choice,
) {
  try {
    const functionId = '0x1::DAOSpace::cast_vote_entry';
    const tyArgs = [daoType];
    const args = [proposal_id, snpashot_raw_proofs, choice];

    console.log('cast_vote functionId:', functionId);
    console.log('cast_vote tyArgs:', tyArgs);
    console.log('cast_vote args:', args);

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

    console.log('provider:', provider);
    const transactionHash = await provider
      .getSigner()
      .sendUncheckedTransaction(txParams);
    return transactionHash;
  } catch (error) {
    console.log('cast_vote error:', error);
    throw error;
  }
}

export async function queue_proposal_action(provider, daoType, proposal_id) {
  try {
    const functionId = '0x1::DAOSpace::queue_proposal_action_entry';
    const tyArgs = [daoType];
    const args = [proposal_id];

    console.log('queue_proposal_action functionId:', functionId);
    console.log('queue_proposal_action tyArgs:', tyArgs);
    console.log('queue_proposal_action args:', args);

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

    console.log('provider:', provider);
    const transactionHash = await provider
      .getSigner()
      .sendUncheckedTransaction(txParams);
    return transactionHash;
  } catch (error) {
    console.log('queue_proposal_action error:', error);
    throw error;
  }
}

function convert_proposal(daoType, proposalInfo) {
  const minion_address = daoType.substring(0, daoType.indexOf('::'));

  return {
    id: proposalInfo.id,
    proposalId: {
      daoId: daoType,
      proposalNumber: proposalInfo.id,
    },
    minionAddress: minion_address,
    categoryId: 1,
    votingType: 'YES_NO_ABSTAIN',
    title: web3.utils.hexToString(proposalInfo.title),
    introduction: web3.utils.hexToString(proposalInfo.introduction),
    extend: web3.utils.hexToString(proposalInfo.extend),
    proposalVotingChoices: [
      {
        sequenceId: 1,
        title: 'YES',
      },
      {
        sequenceId: 2,
        title: 'NO',
      },
      {
        sequenceId: 3,
        title: 'NO_WITH_VETO',
      },
      {
        sequenceId: 4,
        title: 'ABSTAIN',
      },
    ],
    accountVoteSummaries: [
      {
        choiceSequenceId: 1,
        subtotalVotingPower: proposalInfo.yes_votes,
      },
      {
        choiceSequenceId: 2,
        subtotalVotingPower: proposalInfo.no_votes,
      },
      {
        choiceSequenceId: 3,
        subtotalVotingPower: proposalInfo.no_with_veto_votes,
      },
      {
        choiceSequenceId: 4,
        subtotalVotingPower: proposalInfo.abstain_votes,
      },
    ],
    submittedAt: proposalInfo.start_time,
    submittedBy: proposalInfo.proposer,
    votingMethod: 'CHAIN',
    votingPeriodStart: proposalInfo.start_time,
    votingPeriodEnd: proposalInfo.end_time,
    eta: proposalInfo.eta, // eta is the time when the proposal can be executed
    votingTurnoutThreshold: proposalInfo.quorum_votes,
    blockHeight: proposalInfo.block_number,
    blockStateRoot: proposalInfo.state_root,
  };
}
export const listDaoProposals = async daoId => {
  const daoAddress = daoId.substring(0, daoId.indexOf('::'));

  const globalProposals = await window.starcoin.request({
    method: 'state.get_resource',
    params: [
      daoAddress,
      '0x00000000000000000000000000000001::DAOSpace::GlobalProposals',
      {
        decode: true,
      },
    ],
  });

  let proposals = [];

  if (
    globalProposals &&
    globalProposals.json &&
    globalProposals.json.proposals
  ) {
    for (const proposalInfo of globalProposals.json.proposals) {
      proposals.push(convert_proposal(daoId, proposalInfo));
    }
  }

  return proposals.reverse();
};

export async function get_single_proposal(provider, daoType, proposalId) {
  try {
    const function_id = '0x1::DAOSpace::proposal';
    const type_args = [daoType];
    const args = ['' + proposalId];

    const result = await provider.callV2({
      function_id,
      type_args,
      args,
    });

    return convert_proposal(daoType, result[0]);
  } catch (error) {
    console.log('provider.callV2 error:', error);
    throw error;
  }
}

export const get_member_power = async (memberAddress, daoId, state_root) => {
  const daoType = daoId;
  const nft = await window.starcoin.request({
    method: 'state.get_resource',
    params: [
      memberAddress,
      `0x00000000000000000000000000000001::IdentifierNFT::IdentifierNFT<0x00000000000000000000000000000001::DAOSpace::DAOMember<${daoType}>,0x00000000000000000000000000000001::DAOSpace::DAOMemberBody<${daoType}>>`,
      {
        decode: true,
        state_root: state_root,
      },
    ],
  });

  return {
    totalVotingPower: nft?.json ? nft.json.nft.vec[0].body.sbt.value : 0,
  };
};

export const listDaoActions = async (provider, daoType) => {
  const daoAddress = daoType.substring(0, daoType.indexOf('::'));

  const proposalActions = await provider.send('state.list_resource', [
    daoAddress,
    {
      resource_types: [
        '0x00000000000000000000000000000001::DAOSpace::ProposalActions',
      ],
      decode: true,
    },
  ]);

  let retActions = new Array();
  for (const key in proposalActions.resources) {
    const actions = proposalActions.resources[key];
    const actionType = key.substring(
      key.indexOf('<') + 1,
      key.lastIndexOf('>'),
    );

    for (const action of actions.json.actions) {
      retActions.push({
        ...action,
        actionType,
      });
    }
  }

  return retActions;
};

export const getDaoActionByProposalId = async (
  provider,
  daoType,
  proposalId,
) => {
  const daoActions = await listDaoActions(provider, daoType);
  for (const action of daoActions) {
    if (action.proposal_id === proposalId) {
      return action;
    }
  }

  return null;
};
