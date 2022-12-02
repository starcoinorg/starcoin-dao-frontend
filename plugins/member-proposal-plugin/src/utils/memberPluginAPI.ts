import {utils, bcs} from "@starcoin/starcoin"
import {hexlify} from '@ethersproject/bytes'
import {getProvder} from "./stcWalletSdk";
import {nodeUrlMap} from "./consts";
import { utils as web3Utils } from 'web3'

const parseOffer = offer => {
  console.log('offer', offer)
  const { offered, time_lock } = offer;
  
  return {
    for_user: offer.for,
    offered_image_data: offered.image_data,
    offered_image_url: offered.image_url,
    init_sbt: offered.init_sbt,
    to_address: offered.to_address,
    time_lock,
  };
};

export const listAllOffers = async (daoId:string) => {
  const daoAddress = daoId.substring(0, daoId.indexOf('::'));

  const globalCheckpoints = await window.starcoin.request({
    method: 'state.get_resource',
    params: [
      daoAddress,
      `0x00000000000000000000000000000001::Offer::Offers<0x00000000000000000000000000000001::DAOSpace::MemeberOffer<${daoId}>>`,
      {
        decode: true,
      },
    ],
  });

  let offers = [];

  if (globalCheckpoints && globalCheckpoints.json.offers) {
    for (const offer of globalCheckpoints.json.offers) {
      offers.push(parseOffer(offer));
    }
  }

  return offers.reverse();
};

export const listUserOffers = async (daoId:string, address: string) => {
    const daoAddress = daoId.substring(0, daoId.indexOf('::'));
  
    const globalCheckpoints = await window.starcoin.request({
      method: 'state.get_resource',
      params: [
        daoAddress,
        `0x00000000000000000000000000000001::Offer::Offers<0x00000000000000000000000000000001::DAOSpace::MemeberOffer<${daoId}>>`,
        {
          decode: true,
        },
      ],
    });
  
    let offers = [];
  
    if (globalCheckpoints && globalCheckpoints.json.offers) {
      for (const offer of globalCheckpoints.json.offers) {
        if (offer.for === address) {
            offers.push(parseOffer(offer));
        }
      }
    }
    
    return offers.reverse();
};

export const getMemberNFT = async (daoId:string, address: string) => {
    const identifierNFT = await window.starcoin.request({
      method: 'state.get_resource',
      params: [
        address,
        `0x00000000000000000000000000000001::IdentifierNFT::IdentifierNFT<0x00000000000000000000000000000001::DAOSpace::DAOMember<${daoId}>, 0x00000000000000000000000000000001::DAOSpace::DAOMemberBody<${daoId}>>`,
        {
          decode: true,
        },
      ],
    });
  
    if (identifierNFT) {
      return {
        id: identifierNFT.json.nft.vec[0].id,
        nft_name: web3Utils.hexToString(identifierNFT.json.nft.vec[0].base_meta.name),
        image_data: web3Utils.hexToString(identifierNFT.json.nft.vec[0].base_meta.image_data),
        init_sbt: identifierNFT.json.nft.vec[0].body.sbt.value,
      }
    }

    return null;
};

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
            description,
            "{}",
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

export async function doAccecptOffer(daoType:string): Promise<string> {
    try {
        const functionId = '0x1::DAOSpace::accept_member_offer_entry'
        const tyArgs = [daoType]
        const args = []

        console.log("doAccecptOffer tyArgs:", tyArgs);
        console.log("doAccecptOffer args:", args);
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
        console.log("doAccecptOffer error:", error);
        throw error
    }
}