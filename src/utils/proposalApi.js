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

function convert_proposal(daoType, proposalInfo) {
  return {
    id: proposalInfo.id,
    proposalId: {
      daoId: daoType,
      proposalNumber: proposalInfo.id,
    },
    categoryId: 1,
    votingType: 'YES_NO_ABSTAIN',
    title: web3.utils.hexToString(proposalInfo.description),
    description: web3.utils.hexToString(proposalInfo.description),
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

  for (const proposalInfo of globalProposals.json.proposals) {
    proposals.push(convert_proposal(daoId, proposalInfo));
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
    totalVotingPower: nft.json.body.voting_power,
  };
};
