import React, { useEffect, useState, useContext } from 'react';

import { CustomThemeContext } from '../contexts/CustomThemeContext';
import { ExploreContext } from '../contexts/ExploreContext';
import ExploreFilters from '../components/exploreFilters';
import ExploreList from '../components/exploreList';
import Layout from '../components/layout';
import Loading from '../components/loading';
import MainViewLayout from '../components/mainViewLayout';
import { useRequest } from '../hooks/useRequest';
import axios from 'axios';
import config from '../utils/getConfig';


const Explore = () => {
  const { theme, resetTheme } = useContext(CustomThemeContext);
  const [daoList, setDaoList] = useState([]);

  const { data: _daoList, loading } = useRequest('daos', {
    method: 'get',
    params: {
      page: '0',
      size: '100',
    },
  });

  useEffect(() => {
    if (theme.active) {
      resetTheme();
    }
  }, [theme, resetTheme]);

  useEffect(() => {
    if (_daoList) {
      setDaoList(_daoList);
    }
  }, [_daoList]);

  return (
    <Layout>
      <MainViewLayout header='Explore DAOs'>
        {!loading ? (
          <>
            <ExploreFilters daoCount={daoList?.length || 0} />
            <ExploreList daoList={daoList} />
          </>
        ) : (
          <Loading message='Fetching DAOs...' />
        )}
      </MainViewLayout>
    </Layout>
  );
};

export default Explore;
