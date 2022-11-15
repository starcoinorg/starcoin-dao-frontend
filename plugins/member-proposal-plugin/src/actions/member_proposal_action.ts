import { IDaoPluginContext } from '../extpoints/dao_app';
import { executeMemberProposal } from '../utils/memberPluginAPI';

class MemberProposalAction {
  ctx: IDaoPluginContext;
  name: string;

  constructor(ctx: IDaoPluginContext) {
    this.ctx = ctx;
    this.name = '0x00000000000000000000000000000001::MemberProposalPlugin::MemberJoinAction';
  }

  async execute(params: any) {
    return executeMemberProposal(this.ctx.daoType, params.proposalId)
  }
}

export default MemberProposalAction;