import {utils, bcs} from "@starcoin/starcoin"
import {hexlify} from '@ethersproject/bytes'
import {
    uint128,
    uint64
} from "@starcoin/starcoin/dist/src/lib/runtime/serde"

import {
    callContract,
    getWeb3Provder,
    listResource
} from "./stcWalletSdk"
import {nodeUrlMap} from "./consts"

const std = "0x00000000000000000000000000000001"

export type Types = {
    dao_type: string,
    token_type: string,
}

export class Pages {
    start_index: number
    max_size: number

    constructor(startIndex: number, maxSize: number) {
        this.start_index = startIndex
        this.max_size = maxSize
    }
}

export interface StakeParams extends Types {
    amount: uint128,
    lock_time: uint64
}

export function newStakeParams(): StakeParams {
    return {
        dao_type: "-",
        token_type: "-",
        amount: 0n,
        lock_time: 0n
    }
}

export async function stakeSBT(params: StakeParams): Promise<string> {

    const functionId = '0x1::StakeToSBTPlugin::stake_entry'
    const tyArgs = [params.dao_type, params.token_type]
    const args = [params.amount, params.lock_time]

    return await callContarctWithSigner(functionId, tyArgs, args)
}

export interface UnstakeParams extends Types {
    id: string,
}

export function nweUnstakeParams(dao_type: string, tokenType: string, id: string): UnstakeParams {
    return {
        dao_type: dao_type,
        token_type: tokenType,
        id: id
    }
}

export async function unstakeSBT(params: UnstakeParams): Promise<string> {

    const functionId = '0x1::StakeToSBTPlugin::unstake_by_id_entry'
    const tyArgs = [params.dao_type, params.token_type]
    const args = [params.id]

    return await callContarctWithSigner(functionId, tyArgs, args)
}

export async function unstakeAllSBT(params: Types): Promise<string> {

    const functionId = '0x1::StakeToSBTPlugin::unstake_all_entry'
    const tyArgs = [params.dao_type, params.token_type]

    return await callContarctWithSigner(functionId, tyArgs, [])
}

export class QueryStakeTypeResult {
    title: string
    type: string

    constructor(title: string, type: string) {
        this.title = title
        this.type = type
    }

    static paras(v: any, daoType: string) {
        let type = new Array<QueryStakeTypeResult>()

        for (let key in v.resources) {
            const tmp = key.split(",")

            if (!tmp[0].includes(daoType)) {
                continue
            }

            type = type.concat(new QueryStakeTypeResult(
                tmp[1].replace(">>", "").trim().split("::")[2],
                tmp[1].replace(">>", "").trim(),
            ))
        }

        return type
    }
}


export async function queryStakeTokenType(address: string, daoType: string): Promise<Array<QueryStakeTypeResult>> {

    const resType = ['0x1::Config::ModifyConfigCapabilityHolder<0x1::StakeToSBTPlugin::LockWeightConfig>']

    const result = await listResource(address, resType)

    return QueryStakeTypeResult.paras(result, daoType)
}

export type  QueryTokenStakeLimitResult = {
    lock_time: uint64,
    weight: uint64
}

export async function queryTokenStakeLimit(address: string, daoType: string, tokenType: string): Promise<Array<QueryTokenStakeLimitResult>> {
    const type = `0x1::Config::Config<0x1::StakeToSBTPlugin::LockWeightConfig<${daoType}, ${tokenType}>>`
    const result = await window.starcoin.request({
        method: 'state.list_resource',
        params: [
            address,
            {
                resource_types: [type],
                decode: true,
            }
        ]
    })

    return result.resources[type.replaceAll("0x1", "0x00000000000000000000000000000001")].json.payload.weight_vec
}

export type QueryTokenInfoResult = {
    scaling_factor: number,
    token: string
}

export async function queryTokenInfo(tokenType: string): Promise<QueryTokenInfoResult> {

    const type = `${std}::Token::TokenInfo<${tokenType}>`

    const result = await listResource(tokenType.split("::")[0], [type])

    const key = Object.keys(result.resources)[0]

    return {
        token: key.substring(
            key.indexOf('<') + 1,
            key.lastIndexOf('>'),
        ),
        scaling_factor: result.resources[key].json.scaling_factor
    }
}

export async function queryStakeCount(types: Types): Promise<number> {

    const functionId = '0x1::StakeToSBTPlugin::query_stake_count'

    return (await callContract(functionId, [types.dao_type, types.token_type], [window.starcoin.selectedAddress]))[0]
}

export async function queryStakeList(address: string, types: Types, pages: Pages): Promise<any> {

    let resType = [`0x00000000000000000000000000000001::StakeToSBTPlugin::StakeList<${types.dao_type},${types.token_type}>`]

    const result = await listResource(window.starcoin.selectedAddress, resType, pages)

    return Object.values(result.resources)[0].json
}

export interface createTokenAcceptProposalParams extends Types {
    info: {
        title: string,
        introduction: string,
        extend: string,
    }
    propsal: {
        action_delay: uint64,
    }
}

export function newCreateTokenAcceptProposalParams(): createTokenAcceptProposalParams {

    return {
        dao_type: "-",
        token_type: "",
        info: {
            title: "",
            introduction: "",
            extend: ""
        },
        propsal: {
            action_delay: 5n
        },
    }
}

export async function createTokenAcceptProposal(params: createTokenAcceptProposalParams): Promise<string> {
    const functionId = '0x1::StakeToSBTPlugin::create_token_accept_proposal_entry'
    const tyArgs = [params.dao_type, params.token_type]
    const args = [
        params.info.title,
        params.info.introduction,
        params.info.extend,
        params.propsal.action_delay,
    ]
    console.log("createMemberProposal tyArgs:", tyArgs)
    console.log("createMemberProposal args:", args)

    return await callContarctWithSigner(functionId, tyArgs, args)
}

export async function executeTokenAcceptProposal(types: Types, proposalId: string): Promise<string> {
    const functionId = buildFunctionId("execute_token_accept_proposal_entry")
    const tyArgs = [types.dao_type, types.token_type]
    const args = [proposalId]

    console.log("executeMemberProposal tyArgs:", tyArgs);
    console.log("executeMemberProposal args:", args);

    return await callContarctWithSigner(functionId, tyArgs, args);
}

export interface createWeightProposalParams extends Types {
    info: {
        title: string,
        introduction: string,
        extend: string,
    }
    sbt: {
        lock_time: uint64,
        weight: uint64,
    }
    propsal: {
        action_delay: uint64,
    }
}

export function newCreateWeightProposalParams(): createWeightProposalParams {
    return {
        dao_type: "-",
        token_type: "-",
        info: {
            title: "",
            introduction: "",
            extend: "",
        },
        sbt: {
            weight: 0n,
            lock_time: 0n,
        },
        propsal: {
            action_delay: 5n,
        }
    }
}

export async function createWeightProposal(params: createWeightProposalParams): Promise<string> {
    const functionId = '0x1::StakeToSBTPlugin::create_weight_proposal_entry'

    const tyArgs = [params.dao_type, params.token_type]
    const args = [
        params.info.title,
        params.info.introduction,
        params.info.extend,
        params.sbt.lock_time,
        params.sbt.weight,
        params.propsal.action_delay,
    ]

    console.log("createMemberProposal tyArgs:", tyArgs)
    console.log("createMemberProposal args:", args)

    return await callContarctWithSigner(functionId, tyArgs, args)
}

export async function executeWidgthProposal(types: Types, proposalId: string): Promise<string> {
    const functionId = buildFunctionId("execute_weight_proposal_entry")
    const tyArgs = [types.dao_type, types.token_type]
    const args = [proposalId]

    console.log("executeMemberProposal tyArgs:", tyArgs);
    console.log("executeMemberProposal args:", args);

    return await callContarctWithSigner(functionId, tyArgs, args);
}

export async function callContarctWithSigner(functionId, tyArgs, args): Promise<string> {
    try {

        console.log(`functionId: ${functionId}`)
        console.log(`tyArgs: [${tyArgs}]`)
        console.log(`args: ${args}`)

        const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(
            functionId,
            tyArgs,
            args,
            nodeUrlMap[window.starcoin.networkVersion]
        )

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

        const starcoinProvider = await getWeb3Provder()

        return await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)

    } catch (error) {
        throw error
    }
}

function buildFunctionId(name: string): string {
    return "0x1::StakeToSBTPlugin::" + name
}