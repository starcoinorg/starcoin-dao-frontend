import { executeTokenAcceptProposal, executeWidgthProposal } from '../utils/stakeSBTPluginAPI';

class AcceptProposalAction {
  daoType: string;
  name: string;

  constructor(daoType: string) {
    this.daoType = daoType
    this.name = "0x00000000000000000000000000000001::StakeToSBTPlugin::AcceptTokenCap"
  }

  async execute(params: any) {
    console.log(params)

    return executeTokenAcceptProposal({
      dao_type: params.daoType,
       token_type:params.actionType.split(",")[1].replace(">", "").trim()
      },
      params.proposalId
      )
  }
}

export default AcceptProposalAction;