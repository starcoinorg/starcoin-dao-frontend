import { IDAO } from '../extpoints/dao_app';
import { executeTokenAcceptProposal } from '../utils/stakeSBTPluginAPI';

class AcceptProposalAction {
  dao: IDAO;
  name: string;

  constructor(dao: IDAO) {
    this.dao = dao;
    this.name = '0x1::StakeToSBTPlugin<0x1::StarcoinDAO::StarcoinDAO,0x1::STC::STC>';
  }

  async execute(params: any) {
    // return executeTokenAcceptProposal(params.proposalId)
  }
}

export default AcceptProposalAction;