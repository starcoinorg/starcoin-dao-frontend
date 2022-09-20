import React, { useContext, useEffect, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import axios from 'axios';

import { ExploreContext } from '../contexts/ExploreContext';
import ExploreCard from './exploreCard';

const ExploreList = ({ daoList }) => {
  const daoListRender = daoList.map((dao, i) => {
    return <ExploreCard dao={dao} key={`${dao.id}-${i}`} />;
  });

  return (
    <>
      {daoList.length ? (
        <Flex wrap='wrap' align='start' justify='flex-start' w='100%' ml={5}>
          {daoListRender}
        </Flex>
      ) : null}
    </>
  );
};

export default ExploreList;
