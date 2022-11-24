import React from 'react';

import { UserContextProvider } from './contexts/UserContext';
import HubAccountModal from './modals/hubAccountModal';
import DaoSwitcherModal from './modals/daoSwitcherModal';
import TxInfoModal from './modals/TxInfoModal';
import BaseRouter from './routers/baseRouter';

function App() {
  const AppScopedModals = () => (
    <>
      <HubAccountModal />
      <DaoSwitcherModal />
      <TxInfoModal />
    </>
  );

  return (
    <UserContextProvider>
      <BaseRouter />
      <AppScopedModals />
    </UserContextProvider>
  );
}

export default App;
