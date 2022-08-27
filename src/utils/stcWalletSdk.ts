
import {encoding} from "@starcoin/starcoin"
import {hexlify} from '@ethersproject/bytes'
import { ethers } from 'ethers';

export async function deployContract(injectedProvider, code:Buffer):Promise<string> {
    let transactionHash
 
    const packageHex = hexlify(code)
    if (!packageHex.length) {
        alert('Contract blob hex is empty')
    }

    const transactionPayloadHex = encoding.packageHexToTransactionPayloadHex(packageHex)
    const provider = new ethers.providers.Web3Provider(
        injectedProvider.currentProvider,
    );
    transactionHash = await provider.getSigner().sendUncheckedTransaction({data: transactionPayloadHex})

    return transactionHash
}