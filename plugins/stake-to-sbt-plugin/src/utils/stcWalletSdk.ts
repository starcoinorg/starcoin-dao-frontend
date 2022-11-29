import {providers} from "@starcoin/starcoin"
import {getLocalNetwork} from "./localHelper";
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

    console.log("call contract function_id: ", function_id, "----------start---------")
    console.log("args: ", args)
    console.log("type_args: ", type_args)

    const starcoinProvider = await getRpcProvder()
    const result = await starcoinProvider.callV2({
        function_id,
        type_args,
        args,
    })

    console.log("result: ", result)
    console.log("function_id: ", function_id, "-----------end----------")

    return result
}

export async function listResource(address: string, resource_types: Array<any>, pages?: any): Promise<any> {

    console.log("list_resource ---------start----------")
    console.log("address: ", address)
    console.log("resource_types: ", resource_types)
    console.log("pages", pages)

    const result = await window.starcoin.request({
        method: 'state.list_resource',
        params:[
            address,
            {
                resource_types: resource_types,
                decode: true,
                ...pages
            }
        ]
    })

    console.log("result: ", result)
    console.log("list_resource ----------end-----------")

    return result
}

export function isValidateAddress(address: string) {
    const pattern = /^0x[0-9a-fA-F]{32}$/g;
    return pattern.test(address);
}