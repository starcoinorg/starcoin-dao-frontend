import { IDAO } from '../extpoints/dao_app';
import { executeUpgradeProposal } from '../utils/memberPluginAPI';

class UpgradeProposalAction {
  dao: IDAO;
  name: string;

  constructor(dao: IDAO) {
    this.dao = dao;
    this.name = '0x1::UpgradeModulePlugin::UpgradeProposalAction';
  }

  async execute(params: any) {
    return executeUpgradeProposal(params.proposalId)
  }
}

export default UpgradeProposalAction;