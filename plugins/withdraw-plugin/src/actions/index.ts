import { executeProposal } from '../utils/api'

class Action {
  name: string

  constructor() {
    this.name = '0x00000000000000000000000000000001::WithdrawPlugin'
  }

  async execute(params: any) {
      console.log(params)

    const tokenType=  params.actionType.substring(
              params.actionType.indexOf('<') + 1,
              params.actionType.lastIndexOf('>'),
              )
      
    return executeProposal(params.daoType, tokenType, params.proposalId)
  }
}

export default Action