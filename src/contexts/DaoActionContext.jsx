import { useContext, createContext, useState } from 'react';
import { getDaoActionByProposalId } from '../utils/proposalApi';

export const DaoActionContext = createContext();

export const DaoActionProvider = ({ children }) => {
  const [daoActions, setDaoActions] = useState([]);

  const registerAction = async actionInfo => {
    console.log(`registerAction ${actionInfo.name}`);
    setDaoActions(prev => [...prev, actionInfo]);
  };

  const executeAction = async (actionName, actionArgs) => {
    const action = daoActions.find(action =>
      actionName.startsWith(action.name),
    );
    if (action) {
      console.log(`executeAction ${actionName}`);
      await action.execute(actionArgs);
    } else {
      console.log(`executeAction ${actionName} not found`);
    }
  };

  const executeProposal = async (provider, daoType, proposalId) => {
    const action = await getDaoActionByProposalId(
      provider,
      daoType,
      proposalId,
    );

    if (action) {
      const params = {
        ...action,
        daoType,
        proposalId,
      };

      await executeAction(action.actionType, params);
    } else {
      throw new Error(
        `executeProposal ${daoType}/${proposalId} not found action`,
      );
    }
  };

  return (
    <DaoActionContext.Provider
      value={{
        registerAction,
        executeProposal,
      }}
    >
      {children}
    </DaoActionContext.Provider>
  );
};

export const useDaoAction = () => {
  const { registerAction, executeProposal } = useContext(DaoActionContext);

  return {
    registerAction,
    executeProposal,
  };
};
