import { utils, bcs } from '@starcoin/starcoin';
import { hexlify } from '@ethersproject/bytes';
import { nodeUrlMap } from './consts';

const parseCheckpoint = checkpoint => {
  const { block_hash, block_number, state_root } = checkpoint.vec[0];
  return {
    block_hash,
    block_number,
    state_root: state_root.vec[0],
  };
};

export const listCheckpoints = async () => {
  const globalCheckpoints = await window.starcoin.request({
    method: 'state.get_resource',
    params: [
      '0x1',
      '0x00000000000000000000000000000001::Block::Checkpoints',
      {
        decode: true,
      },
    ],
  });

  let checkpoints = [];

  for (const checkpoint of globalCheckpoints.json.checkpoints.data) {
    if (checkpoint.vec.length === 0) {
      continue;
    }

    checkpoints.push(parseCheckpoint(checkpoint));
  }

  return checkpoints.reverse();
};

export async function checkpoint(provider) {
  try {
    const functionId = '0x1::Block::checkpoint_entry';
    const tyArgs = [];
    const args = [];

    console.log('checkpoint functionId:', functionId);
    console.log('checkpoint tyArgs:', tyArgs);
    console.log('checkpoint args:', args);

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
    console.log('checkpoint error:', error);
    throw error;
  }
}

export async function updateStateRoot(provider, raw_header) {
  try {
    const functionId = '0x1::Block::update_state_root_entry';
    const tyArgs = [];
    const args = [raw_header];

    console.log('updateStateRoot functionId:', functionId);
    console.log('updateStateRoot tyArgs:', tyArgs);
    console.log('updateStateRoot args:', args);

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
    console.log('updateStateRoot error:', error);
    throw error;
  }
}
