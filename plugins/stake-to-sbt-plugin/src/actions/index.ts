import {
    executeTokenAcceptProposal,
    executeWidgthProposal
} from '../utils/api'

const executeWidgthProposalType = "StakeToSBTPlugin::LockWeight"
class ProposalAction {
    daoType: string
    name: string

    constructor(daoType: string) {
        this.daoType = daoType
        this.name = "0x00000000000000000000000000000001::StakeToSBTPlugin"
    }

    async execute(params: any) {

        console.log(params)

        const types = {
            dao_type: params.daoType,
            token_type: params.actionType.split(",")[1].replace(">", "").trim()
        }

        if (params.actionType.includes(executeWidgthProposalType)) {
            return executeWidgthProposal(types, params.proposalId)
        } else {
            return executeTokenAcceptProposal(types, params.proposalId)
        }
    }
}

export default ProposalAction