import React, { createContext, useState, useContext, Dispatch, SetStateAction } from 'react';

export const OverlayContext = createContext<{
  memberProposalModal: boolean,
  setMemberProposalModal: Dispatch<SetStateAction<boolean>>
}>({} as any);

export const OverlayProvider = ({ children }) => {
  const [memberProposalModal, setMemberProposalModal] = useState(false);

  return (
    <OverlayContext.Provider
      value={{
        memberProposalModal, 
        setMemberProposalModal
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
};

export default OverlayProvider;

export const useOverlay = () => {
  const {
    memberProposalModal, 
    setMemberProposalModal
  } = useContext(OverlayContext);
  return {
    memberProposalModal, 
    setMemberProposalModal
  };
};
