import { sleep } from './common';
import { getTxnData } from './sdk';

export async function polling(provider, tx) {
  let txData = await getTxnData(provider, tx);
  var count = 0;

  while (!txData && count++ < 60) {
    await sleep(1000);
    txData = await getTxnData(provider, tx);
    window.console.info('tx', count, txData);
  }

  return txData;
}
