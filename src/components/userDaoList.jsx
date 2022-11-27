import React from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { RiCheckboxCircleLine } from 'react-icons/ri';
import { Box, Text, Spinner, Flex, Icon, Stack, Link } from '@chakra-ui/react';

import { useUser } from '../contexts/UserContext';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';

const UserDaoList = ({ handleClose }) => {
  const { injectedChain } = useInjectedProvider();
  const { userDaos } = useUser();

  return (
    <Flex direction='row' wrap='wrap'>
      {Object.keys(userDaos).length > 0 ? (
        Object.values(userDaos).map(dao => (
          <Link
            key={dao.daoId}
            as={RouterLink}
            to={`/dao/${injectedChain.chainId}/${dao.daoId}`}
            onClick={handleClose}
            color='secondary.400'
            _hover={{ color: 'secondary.600' }}
            mb='4px'
            mr={6}
          >
            {dao.daoName}
          </Link>
        ))
      ) : (
        <Box color='secondary.400'>No Daos</Box>
      )}
    </Flex>
  );
};

export default UserDaoList;
