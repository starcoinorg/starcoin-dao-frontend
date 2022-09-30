import { utils } from 'web3';

export const listDaoProposals = async daoId => {
  const daoAddress = daoId.substring(0, daoId.indexOf('::'));

  const globalProposals = await window.starcoin.request({
    method: 'state.get_resource',
    params: [
      daoAddress,
      '0x00000000000000000000000000000001::DAOSpace::GlobalProposals',
      {
        decode: true,
      },
    ],
  });

  let proposals = [];

  for (const proposalInfo of globalProposals.json.proposals) {
    proposals.push({
      id: proposalInfo.id,
      proposalId: {
        proposalNumber: proposalInfo.id,
      },
      categoryId: 1,
      votingType: 'VotingType::Binary',
      title: utils.hexToString(proposalInfo.description),
      proposer: proposalInfo.proposer,
      submittedAt: proposalInfo.start_time,
      votingPeriodStart: proposalInfo.start_time,
      votingPeriodEnd: proposalInfo.end_time,
      yes_votes: proposalInfo.yes_votes,
      no_votes: proposalInfo.no_votes,
      abstain_votes: proposalInfo.abstain_votes,
      no_with_veto_votes: proposalInfo.no_with_veto_votes,
      eta: proposalInfo.eta,
      action_delay: proposalInfo.action_delay,
      quorum_votes: proposalInfo.quorum_votes,
      blockHeight: proposalInfo.block_number,
      blockStateRoot: proposalInfo.state_root,
    });
  }

  return proposals;
};
