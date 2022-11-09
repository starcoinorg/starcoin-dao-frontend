import React, { useEffect, useState, useContext } from 'react';

import { CustomThemeContext } from '../contexts/CustomThemeContext';
import ExploreFilters from '../components/exploreFilters';
import ExploreList from '../components/exploreList';
import Layout from '../components/layout';
import Loading from '../components/loading';
import MainViewLayout from '../components/mainViewLayout';
import { ExploreContext } from '../contexts/ExploreContext';
import { useRequest } from '../hooks/useRequest';
import { listDaos } from '../utils/dao';

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
          <ExploreList daoList={exploreDaos.data} />
        </>
      </MainViewLayout>
    </Layout>
  );
};

export default Explore;
