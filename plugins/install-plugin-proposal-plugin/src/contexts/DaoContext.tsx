import React, { createContext, useState, useContext, Dispatch, SetStateAction } from 'react';

interface IDaoInfo {
    name: string,
    address: string,
    daoType: string,
}

export const DaoContext = createContext<{
  dao: IDaoInfo,
  setDAO: Dispatch<SetStateAction<IDaoInfo>>
}>({} as any);

export const DaoProvider = ({ children, initDao }) => {
  const [dao, setDAO] = useState<IDaoInfo>(initDao);

  return (
    <DaoContext.Provider
      value={{
        dao, 
        setDAO
      }}
    >
      {children}
    </DaoContext.Provider>
  );
};

export default DaoProvider;

export const useDao = () => {
  const {
    dao, 
    setDAO
  } = useContext(DaoContext);
  return {
    dao, 
    setDAO
  };
};
