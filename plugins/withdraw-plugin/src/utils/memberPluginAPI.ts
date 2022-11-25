import {utils, bcs} from "@starcoin/starcoin"
import {hexlify} from '@ethersproject/bytes'
import {getProvder} from "./stcWalletSdk";
import {nodeUrlMap} from "./consts";
import {uint64} from "@starcoin/starcoin/dist/src/lib/runtime/serde";

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
    dao_type:string,
    title: string,
    introduction: string,
    description: string,
    receiver: string,
    amount: number,
    action_delay: number
}

export async function createProposal(action: Action): Promise<string> {
    const functionId = '0x1::WithdrawPlugin::create_withdraw_proposal_entry'
    const tyArgs = [action.dao_type]
    const args = [action.title, action.introduction, action.description, action.action_delay, action.package_hash, action.version, action.enforced]

    console.log("createMemberProposal tyArgs:", tyArgs)
    console.log("createMemberProposal args:", args)

    return await callContarctWithSigner(functionId, tyArgs, args)
}

export async function executeProposal(daoType:string, tokenType:string, proposalId: string): Promise<string> {
    const functionId = '0x1::WithdrawPlugin::execute_withdraw_proposal_entry'
    const tyArgs = [daoType, tokenType]
    const args = [proposalId]

    console.log("executeMemberProposal tyArgs:", tyArgs);
    console.log("executeMemberProposal args:", args);

    return await callContarctWithSigner(functionId, tyArgs, args);
}

