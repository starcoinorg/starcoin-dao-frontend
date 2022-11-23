import React from 'react';
import { VscAccount } from 'react-icons/vsc';
import { RiMenu3Line } from 'react-icons/ri';
import {
  IconButton,
  Link,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react';

import { useOverlay } from '../contexts/OverlayContext';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';

const ChangeUser = isDao => {
  const { requestWallet, address } = useInjectedProvider();
  const { setDaoAccountModal, setHubAccountModal } = useOverlay();

  const toggleAccountModal = () => {
    if (!isDao) {
      setHubAccountModal(prevState => !prevState);
    } else {
      setDaoAccountModal(prevState => !prevState);
    }
  };

  const changeIcon = useBreakpointValue({
    base: <VscAccount />,
    sm: <VscAccount />,
    md: <VscAccount />,
    lg: <VscAccount />,
  });

  return (
    <>
      <Tooltip
        label='Change User'
        aria-label='Change User'
        placement='right'
        hasArrow
      >
        <IconButton
          icon={changeIcon}
          size='lg'
          variant='ghost'
          isRound='true'
          as={Link}
          onClick={toggleAccountModal}
        />
      </Tooltip>
    </>
  );
};

export default ChangeUser;
