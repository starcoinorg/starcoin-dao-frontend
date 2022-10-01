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
        daoId: daoId,
        proposalNumber: proposalInfo.id,
      },
      categoryId: 1,
      votingType: 'YES_NO_ABSTAIN',
      title: utils.hexToString(proposalInfo.description),
      description: utils.hexToString(proposalInfo.description),
      proposalVotingChoices: [
        {
          sequenceId: 1,
          title: 'YES',
        },
        {
          sequenceId: 2,
          title: 'NO',
        },
        {
          sequenceId: 3,
          title: 'NO_WITH_VETO',
        },
        {
          sequenceId: 4,
          title: 'ABSTAIN',
        },
      ],
      accountVoteSummaries: [
        {
          choiceSequenceId: 1,
          subtotalVotingPower: proposalInfo.yes_votes,
        },
        {
          choiceSequenceId: 2,
          subtotalVotingPower: proposalInfo.no_votes,
        },
        {
          choiceSequenceId: 3,
          subtotalVotingPower: proposalInfo.no_with_veto_votes,
        },
        {
          choiceSequenceId: 4,
          subtotalVotingPower: proposalInfo.abstain_votes,
        },
      ],
      submittedAt: proposalInfo.start_time,
      submittedBy: proposalInfo.proposer,
      votingMethod: 'CHAIN',
      votingPeriodStart: proposalInfo.start_time,
      votingPeriodEnd: proposalInfo.end_time,
      votingTurnoutThreshold: proposalInfo.quorum_votes,
      blockHeight: proposalInfo.block_number,
      blockStateRoot: proposalInfo.state_root,
    });
  }

  return proposals.reverse();
};
