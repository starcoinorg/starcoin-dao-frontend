import React, { useContext, useEffect, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import axios from 'axios';

import { ExploreContext } from '../contexts/ExploreContext';
import ExploreCard from './exploreCard';

const ExploreList = ({ daoList }) => {
  const [daos, setDaos] = useState(daoList || []);

  const daoListRender = daos.map((dao, i) => {
    return <ExploreCard dao={dao} key={`${dao.id}-${i}`} />;
  });

  return (
    <>
      {daos.length ? (
        <Flex wrap='wrap' align='start' justify='flex-start' w='100%' ml={5}>
          {daoListRender}
        </Flex>
      ) : null}
    </>
  );
};

export default ExploreList;
