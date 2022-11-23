import { IDAO } from '../extpoints/dao_app';
import { executeUpgradeProposal } from '../utils/memberPluginAPI';

class UpgradeProposalAction {
  name: string;

  constructor() {
    this.name = '0x00000000000000000000000000000001::UpgradeModulePlugin::UpgradeModuleAction';
  }

  async execute(params: any) {
    return executeUpgradeProposal(params.daoType, params.proposalId)
  }
}

export default UpgradeProposalAction;