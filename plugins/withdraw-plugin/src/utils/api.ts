import {utils, bcs} from "@starcoin/starcoin"
import {hexlify} from '@ethersproject/bytes'
import {
    getProvder,
    listResource
} from "./stcWalletSdk"
import {
    nodeUrlMap,
    STD
} from "./consts"

export async function callContarctWithSigner(functionId, tyArgs, args): Promise<string> {
    try {

        const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrlMap[window.starcoin.networkVersion])

        // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
        const payloadInHex = (function () {
            const se = new bcs.BcsSerializer()
            scriptFunction.serialize(se)
            return hexlify(se.getBytes())
        })()

        const txParams = {
            data: payloadInHex,
            expiredSecs: 10
        }

        const starcoinProvider = await getProvder()

        return await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)

    } catch (error) {
        throw error
    }
}

export type Action = {
    dao_type: string,
    token_type:string,
    title: string,
    introduction: string,
    extend: string,
    receiver: string,
    amount: number,
    action_delay: number
}

export async function createProposal(action: Action): Promise<string> {
    const functionId = '0x1::WithdrawPlugin::create_withdraw_proposal_entry'
    const tyArgs = [action.dao_type, action.token_type]
    const args = [action.title, action.introduction, action.extend, action.receiver, action.amount, action.action_delay,]

    console.log("createMemberProposal tyArgs:", tyArgs)
    console.log("createMemberProposal args:", args)

    return await callContarctWithSigner(functionId, tyArgs, args)
}

export async function executeProposal(daoType: string, tokenType: string, proposalId: string): Promise<string> {
    const functionId = '0x1::WithdrawPlugin::execute_withdraw_proposal_entry'
    const tyArgs = [daoType, tokenType]
    const args = [proposalId]

    console.log("executeMemberProposal tyArgs:", tyArgs)
    console.log("executeMemberProposal args:", args)

    return await callContarctWithSigner(functionId, tyArgs, args)
}

export type QueryWithdrawTokenResult = {
    token: string,
    balance: number
}

export async function queryWithdrawToken(address: string): Promise<Array<QueryWithdrawTokenResult>> {
    const type = `${STD}::Account::Balance`

    const result = await listResource(address, [type])

    const tokenResult = new Array<QueryWithdrawTokenResult>()

    for (const k in result.resources) {
        tokenResult.push({
            token: k.substring(
                k.indexOf('<') + 1,
                k.lastIndexOf('>'),
            ),
            balance: result.resources[k].json.token.value
        })
    }

    return tokenResult
}


export type QueryTokenInfoResult = {
    scaling_factor: number,
    token: string
}

export async function queryTokenInfo(tokenType: string): Promise<QueryTokenInfoResult> {

    const type = `${STD}::Token::TokenInfo<${tokenType}>`

    const result = await listResource(STD, [type])

    const key = Object.keys(result.resources)[0]

    return {
        token: key.substring(
            key.indexOf('<') + 1,
            key.lastIndexOf('>'),
        ),
        scaling_factor: result.resources[key].json.scaling_factor
    }
}
