import { IDaoPluginContext } from '../extpoints/dao_app';
import { executeInstallPluginProposal } from '../utils/daoPluginApi';

class InstallPluginAction {
  ctx: IDaoPluginContext;
  name: string;

  constructor(ctx: IDaoPluginContext) {
    this.ctx = ctx;
    this.name = '0x00000000000000000000000000000001::InstallPluginProposalPlugin::InstallPluginAction';
  }

  async execute(params: any) {
    const provider = this.ctx.getInjectedProvider();
    const daoType = this.ctx.daoType;
    const actionType = params.actionType;
    const pluginType = actionType.substring(
      actionType.indexOf('<') + 1,
      actionType.lastIndexOf('>'),
    );
    const proposalId = params.proposalId;

    return executeInstallPluginProposal(provider, daoType, pluginType, proposalId)
  }
}

export default InstallPluginAction;