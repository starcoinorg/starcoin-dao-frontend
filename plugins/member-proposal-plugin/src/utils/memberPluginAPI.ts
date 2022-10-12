import {utils, bcs} from "@starcoin/starcoin"
import {hexlify} from '@ethersproject/bytes'
import {getProvder} from "./stcWalletSdk";
import {nodeUrlMap} from "./consts";

export async function createMemberProposal(
    daoType:string, 
    description:string, 
    member:string, 
    image_data:string, 
    image_url:string, 
    init_sbt:number, 
    action_delay: number,
) :Promise<string>  {
    try {
        const functionId = '0x1::MemberProposalPlugin::create_proposal_entry'
        const tyArgs = [daoType]
        const args = [
            description,
            member,
            image_data,
            image_url,
            init_sbt,
            action_delay
        ]

        console.log("createMemberProposal tyArgs:", tyArgs);
        console.log("createMemberProposal args:", args);
        console.log("window.starcoin:", window.starcoin);

        const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
        console.log("nodeUrl:", nodeUrl);

        const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)
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

        console.log("txParams:", txParams);
        const starcoinProvider = await getProvder();

        console.log("starcoinProvider:", starcoinProvider);
        const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
        return transactionHash
    } catch (error) {
        console.log("createMemberProposal error:", error);
        throw error
    }
}

export async function executeMemberProposal(daoType:string, proposalId:string): Promise<string> {
    try {
        const functionId = '0x1::MemberProposalPlugin::execute_proposal_entry'
        const tyArgs = [daoType]
        const args = [
            proposalId,
        ]

        console.log("executeMemberProposal tyArgs:", tyArgs);
        console.log("executeMemberProposal args:", args);
        console.log("window.starcoin:", window.starcoin);

        const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
        console.log("nodeUrl:", nodeUrl);

        const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)
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

        console.log("txParams:", txParams);
        const starcoinProvider = await getProvder();

        console.log("starcoinProvider:", starcoinProvider);
        const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
        return transactionHash
    } catch (error) {
        console.log("executeMemberProposal error:", error);
        throw error
    }
}
