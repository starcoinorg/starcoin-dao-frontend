import { bcs, utils } from '@starcoin/starcoin';
import { hexlify } from 'ethers/lib/utils';
import { nodeUrlMap } from './consts';

export async function getTxnData(provider, txnHash) {
  const result = await provider.getTransaction(txnHash);
  return result;
}

export async function getEventsByTxnHash(provider, txnHash) {
  const result = await provider.send('chain.get_events_by_txn_hash', [txnHash]);
  return result;
}

export async function callV2(provider, function_id, type_args, args) {
  console.log('provider ' + provider);
  console.log('function_id ' + function_id);
  console.log('type_args ' + type_args);
  console.log('args ' + args);
  const result = await provider.callV2({
    function_id,
    type_args,
    args,
  });
  return result;
}

export async function callContractWithSigner(
  provider,
  functionId,
  typeArgs,
  args,
) {
  const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(
    functionId,
    typeArgs,
    args,
    nodeUrlMap[window.starcoin.networkVersion],
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

  const transactionHash = provider
    .getSigner()
    .sendUncheckedTransaction(txParams);

  window.console.log(transactionHash);

  return transactionHash;
}

// const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(
//   '0x1::DAOAccount::create_account_entry',
//   [],
//   [],
//   nodeUrlMap[window.starcoin.networkVersion],
// );
// // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
// const payloadInHex = (function() {
//   const se = new bcs.BcsSerializer();
//   scriptFunction.serialize(se);
//   return hexlify(se.getBytes());
// })();

// const txParams = {
//   data: payloadInHex,
//   expiredSecs: 10,
// };

// const transactionHash = injectedProvider
//   .getSigner()
//   .sendUncheckedTransaction(txParams);

// return transactionHash;

// export async function
