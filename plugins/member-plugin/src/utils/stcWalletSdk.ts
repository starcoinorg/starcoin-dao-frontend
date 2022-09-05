import {providers} from "@starcoin/starcoin"
import {getLocalNetwork} from "./localHelper";

export async function requestAccounts() {
  const newAccounts = await window.starcoin.request({
      method: 'stc_requestAccounts',
  })
  return newAccounts
}

export async function getAccounts() {
  const result = await window.starcoin.request({
      method: 'stc_accounts',
  })

  return result
}

export async function getProvder() {
  const network =  getLocalNetwork() || "main"
  const provider = new providers.Web3Provider(window.starcoin, network)
  return provider;
}
