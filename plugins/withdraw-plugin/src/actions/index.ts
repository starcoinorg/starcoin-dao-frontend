import { executeProposal } from '../utils/memberPluginAPI'

class Action {
  name: string

  constructor() {
    this.name = '0x00000000000000000000000000000001::WithdrawPlugin'
  }

  async execute(params: any) {
    const tokenType=  params.actionType.split(",")[1].replace(">", "").trim()
    return executeProposal(params.daoType, tokenType, params.proposalId)
  }
}

export default Action