import React, {
    useContext,
    createContext,
    useState,
} from 'react';
import { useParams } from 'react-router-dom';
export const DaoActionContext = createContext();

export const DaoActionProvider = ({ children }) => {
    const { daoid, daochain } = useParams();
    const [daoActions, setDaoActions] = useState(null);

    const registerAction = async actionInfo => {
        console.log(`registerAction ${actionInfo.name}`);
        setDaoActions(prev => [...prev, actionInfo]);
    };

    const executeAction = async (actionName, actionArgs) => {
        const action = daoActions.find(action => action.name === actionName);
        if (action) {
            console.log(`executeAction ${actionName}`);
            await action.execute(actionArgs);
        }
    };

    return (
        <DaoActionContext.Provider
            value={{
                registerAction,
                executeAction,
            }}
        >
            {children}
        </DaoActionContext.Provider>
    );
};

export const useDaoAction = () => {
    const {
        registerAction,
        executeAction,
    } = useContext(DaoActionContext);

    return {
        registerAction,
        executeAction,
    };
};
