import {utils, bcs} from "@starcoin/starcoin"
import {hexlify} from '@ethersproject/bytes'
import {getProvder} from "./stcWalletSdk"
import {nodeUrlMap} from "./consts"

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

export async function join(daoType: string, imageData: string, imageUrl: string): Promise<string> {
    const functionId = '0x1::AnyMemberPlugin::join_entry'
    const tyArgs = [daoType]
    const args = [imageData, imageUrl]

    console.log("createMemberProposal tyArgs:", tyArgs)
    console.log("createMemberProposal args:", args)

    return await callContarctWithSigner(functionId, tyArgs, args)
}

export const getMemberNFT = async (daoId, address) => {

    const identifierNFT = await window.starcoin.request({
        method: 'state.list_resource',
        params: [
            address,
            {
                resource_types: [`0x00000000000000000000000000000001::IdentifierNFT::IdentifierNFT<0x00000000000000000000000000000001::DAOSpace::DAOMember<${daoId}>, 0x00000000000000000000000000000001::DAOSpace::DAOMemberBody<${daoId}>>`],
                decode: true,
            }
        ]
    })

    return identifierNFT

    //    if (identifierNFT) {
    //        return {
    //            id: identifierNFT.json.nft.vec[0].id,
    //            nft_name: utils.hexToString(identifierNFT.json.nft.vec[0].base_meta.name),
    //            image_data: utils.hexToString(
    //                    identifierNFT.json.nft.vec[0].base_meta.image_data,
    //                    ),
    //            init_sbt: identifierNFT.json.nft.vec[0].body.sbt.value,
    //        }
    //    }

}