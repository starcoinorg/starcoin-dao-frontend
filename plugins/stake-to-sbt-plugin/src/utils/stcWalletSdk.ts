import {providers} from "@starcoin/starcoin"
import {getLocalNetwork} from "./localHelper";
import {Web3Provider} from "@starcoin/starcoin/dist/src/providers";
import {nodeUrlMap} from "./consts";

export async function requestAccounts() {
    return await window.starcoin.request({
        method: 'stc_requestAccounts',
    })
}

export async function getAccounts() {

    return await window.starcoin.request({
        method: 'stc_accounts',
    })
}

export async function getWeb3Provder() {
    const network = getLocalNetwork() || "main"
    return new providers.Web3Provider(window.starcoin, network);
}

export async function getRpcProvder() {
    const network = nodeUrlMap[window.starcoin.networkVersion]

    console.log(network)

    return new providers.JsonRpcProvider(network);
}

export async function callContract(function_id: string, type_args: any[], args: any[]): Promise<any> {

    const starcoinProvider = await getRpcProvder()

    return await starcoinProvider.callV2({
        function_id,
        type_args,
        args,
    })
}

export function isValidateAddress(address: string) {
    const pattern = /^0x[0-9a-fA-F]{32}$/g;
    return pattern.test(address);
}