import React, { useContext, useEffect, useState } from 'react';
import { Flex, SimpleGrid } from '@chakra-ui/react';
import ExploreCard from './exploreCard';

const ExploreList = ({ daoList }) => {
  const daoListRender = daoList.map((dao, i) => {
    return <ExploreCard dao={dao} key={`${dao.id}-${i}`} />;
  });

  return (
    <>
      {daoList.length ? (
        <SimpleGrid columns={[1, 4]} ml={5}>
          {/* <Flex wrap='wrap' align='start' justify='flex-start' w='100%' ml={5}> */}
          {daoListRender}
        </SimpleGrid>
      ) : null}
    </>
  );
};

export default ExploreList;
