import { IDAO } from '../extpoints/dao_app';
import { executeMemberProposal } from '../utils/memberPluginAPI';

class MemberProposalAction {
  dao: IDAO;
  name: string;

  constructor(dao: IDAO) {
    this.dao = dao;
    this.name = '0x1::MemberProposalPlugin::MemberProposalAction';
  }

  async execute(params: any) {
    return executeMemberProposal(this.dao.daoType, params.proposalId)
  }
}

export default MemberProposalAction;