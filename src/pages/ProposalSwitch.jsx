import { isChainDAO } from '../utils/dao';
import { useParams } from 'react-router-dom';
import Proposal from './Proposal';
import ProposalForChain from './ProposalForChain';

const ProposalSwitch = ({
  activities,
  customTerms,
  daoProposals,
  daoMember,
  delegate,
  overview,
}) => {
  const { daoid } = useParams();

  if (isChainDAO(daoid)) {
    return (
      <ProposalForChain
        activities={activities}
        customTerms={customTerms}
        daoProposals={daoProposals}
        daoMember={daoMember}
        delegate={delegate}
        overview={overview}
      />
    );
  } else {
    return (
      <Proposal
        activities={activities}
        customTerms={customTerms}
        daoProposals={daoProposals}
        daoMember={daoMember}
        delegate={delegate}
        overview={overview}
      />
    );
  }
};

export default ProposalSwitch;
