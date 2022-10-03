import { utils, bcs } from '@starcoin/starcoin';
import { hexlify } from '@ethersproject/bytes';
import { nodeUrlMap } from './consts';

export async function get_access_path(provider, daoType, userAddress) {
  try {
    const functionId = '0x1::SnapshotUtil::get_access_path';
    const tyArgs = [daoType];
    const args = [userAddress];

    console.log('cast_vote functionId:', functionId);
    console.log('cast_vote tyArgs:', tyArgs);
    console.log('cast_vote args:', args);

    const result = await provider.callV2({
      functionId,
      tyArgs,
      args,
    });
    return result;
  } catch (error) {
    console.log('provider.callV2 error:', error);
    throw error;
  }
}

export async function get_proposal_state(provider, daoType, proposalId) {
  try {
    const functionId = '0x1::DAOSpace::proposal_state';
    const tyArgs = [daoType];
    const args = [proposalId];

    console.log('cast_vote functionId:', functionId);
    console.log('cast_vote tyArgs:', tyArgs);
    console.log('cast_vote args:', args);

    const result = await provider.callV2({
      functionId,
      tyArgs,
      args,
    });
    return result;
  } catch (error) {
    console.log('provider.callV2 error:', error);
    throw error;
  }
}

export async function get_with_proof_by_root_raw(daoId) {
  const daoAddress = daoId.substring(0, daoId.indexOf('::'));

  const proof = await window.starcoin.request({
    method: 'state.get_with_proof_by_root_raw',
    params: [
      daoAddress,
      '0x00000000000000000000000000000001::DAOSpace::GlobalProposals',
      {
        decode: true,
      },
    ],
  });

  return proof;
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
