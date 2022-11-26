import React, { useEffect, useState, useContext } from 'react';

import { CustomThemeContext } from '../contexts/CustomThemeContext';
import ExploreFilters from '../components/exploreFilters';
import ExploreList from '../components/exploreList';
import Layout from '../components/layout';
import Loading from '../components/loading';
import MainViewLayout from '../components/mainViewLayout';
import { ExploreContext } from '../contexts/ExploreContext';
import { Flex, Link, Text } from '@chakra-ui/react';

const Explore = () => {
  const { theme, resetTheme } = useContext(CustomThemeContext);
  const { exploreDaos, state, dispatch } = useContext(ExploreContext);

  useEffect(() => {
    if (theme.active) {
      resetTheme();
    }
  }, [theme, resetTheme]);

  console.log(state);
  return (
    <Layout>
      <MainViewLayout header='Explore DAO'>
        <>
          {exploreDaos.loaded ? (
            <>
              <ExploreFilters />
              <ExploreList daoList={exploreDaos.data} />
            </>
          ) : (
            <Loading />
          )}
          {state.pages.total > state.pages.offset && exploreDaos.loaded ? (
            <Flex direction='row' justify='space-evenly' p={6}>
              <Link
                to='#'
                onClick={() => {
                  console.log('pre');
                  dispatch({ type: 'previousPage', payload: 0 });
                }}
              >
                Previous
              </Link>
              <Text>
                Page {state.pages.index + 1} of{' '}
                {Math.ceil(state.pages.total / state.pages.offset)}
              </Text>
              <Link
                to='#'
                onClick={() => {
                  console.log('pre');
                  dispatch({ type: 'nextPage', payload: 0 });
                }}
              >
                Next
              </Link>
            </Flex>
          ) : (
            <></>
          )}
        </>
      </MainViewLayout>
    </Layout>
  );
};

export default Explore;
