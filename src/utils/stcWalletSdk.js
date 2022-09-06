import { encoding } from '@starcoin/starcoin';
import { hexlify } from '@ethersproject/bytes';

export async function deployContract(injectedProvider, code) {
  let transactionHash;

  const packageHex = hexlify(code);
  if (!packageHex.length) {
    alert('Contract blob hex is empty');
  }

  const transactionPayloadHex = encoding.packageHexToTransactionPayloadHex(
    packageHex,
  );

  transactionHash = await injectedProvider
    .getSigner()
    .sendUncheckedTransaction({ data: transactionPayloadHex });

  return transactionHash;
}
