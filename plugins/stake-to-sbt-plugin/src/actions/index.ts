import {
    executeTokenAcceptProposal,
    executeWidgthProposal
} from '../utils/api'

const executeWidgthProposalType = "0x00000000000000000000000000000001::StakeToSBTPlugin::LockWeight<0x00000000000000000000000000000001::StarcoinDAO::StarcoinDAO, 0x00000000000000000000000000000001::STC::STC>"

class ProposalAction {
    daoType: string
    name: string

    constructor(daoType: string) {
        this.daoType = daoType
        this.name = "0x00000000000000000000000000000001::StakeToSBTPlugin"
    }

    async execute(params: any) {
        const types = {
            dao_type: params.daoType,
            token_type: params.actionType.split(",")[1].replace(">", "").trim()
        }

        if (params.actionType === executeWidgthProposalType) {
            return executeWidgthProposal(types, params.proposalId)
        } else {
            return executeTokenAcceptProposal(types, params.proposalId)
        }
    }
}

export default ProposalAction