import React, { useContext, useEffect, useState } from 'react';
import { Flex, SimpleGrid } from '@chakra-ui/react';
import ExploreCard from './exploreCard';
import he from 'date-fns/esm/locale/he/index.js';

const ExploreList = ({ daoList }) => {
  const daoListRender = daoList.map((dao, i) => {
    return <ExploreCard dao={dao} key={`${dao.id}-${i}`} />;
  });

  //<SimpleGrid columns={{ base: 1, sm: 2, md: 4, lg: 5 }} ml={5}>
  // <Flex wrap='wrap' align='start' justify='flex-start' w='100%' ml={5}>

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
