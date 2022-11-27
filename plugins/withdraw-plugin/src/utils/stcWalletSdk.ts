import {providers} from "@starcoin/starcoin"
import {getLocalNetwork} from "./localHelper";

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

export async function getProvder() {
  const network =  getLocalNetwork() || "main"
  return new providers.Web3Provider(window.starcoin, network);
}

export function isValidateAddress(address: string) {
  const pattern = /^0x[0-9a-fA-F]{32}$/g;
  return pattern.test(address);
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