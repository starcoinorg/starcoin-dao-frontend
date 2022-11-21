import React, { useEffect, useState, useContext } from 'react';

import { CustomThemeContext } from '../contexts/CustomThemeContext';
import ExploreFilters from '../components/exploreFilters';
import ExploreList from '../components/exploreList';
import Layout from '../components/layout';
import Loading from '../components/loading';
import MainViewLayout from '../components/mainViewLayout';
import { ExploreContext } from '../contexts/ExploreContext';

const Explore = () => {
  const { theme, resetTheme } = useContext(CustomThemeContext);
  const { exploreDaos } = useContext(ExploreContext);

  useEffect(() => {
    if (theme.active) {
      resetTheme();
    }
  }, [theme, resetTheme]);

  return (
    <Layout>
      <MainViewLayout header='Explore DAOs'>
        <>
          <ExploreFilters daoCount={exploreDaos.data?.length || 0} />
          {exploreDaos.loaded ? (
            <ExploreList daoList={exploreDaos.data} />
          ) : (
            <Loading />
          )}
        </>
      </MainViewLayout>
    </Layout>
  );
};

export default Explore;
