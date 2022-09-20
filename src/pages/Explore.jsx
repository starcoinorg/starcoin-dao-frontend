import React, { useEffect, useState, useContext } from 'react';

import { CustomThemeContext } from '../contexts/CustomThemeContext';
import ExploreFilters from '../components/exploreFilters';
import ExploreList from '../components/exploreList';
import Layout from '../components/layout';
import Loading from '../components/loading';
import MainViewLayout from '../components/mainViewLayout';
import { useRequest } from '../hooks/useRequest';
import { listDaos } from '../utils/dao';

const Explore = () => {
  const { theme, resetTheme } = useContext(CustomThemeContext);
  const [daoList, setDaoList] = useState([]);
  const [customList, setCustomeList] = useState([]);
  const [customLoading, setCustomLoading] = useState(true);

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
    const fetchData = async () => {
      const data = await listDaos();
      setCustomeList(data);
      setCustomLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!(customLoading || loading)) {
      setDaoList([..._daoList, ...customList]);
    }
  }, [customLoading, loading]);

  return (
    <Layout>
      <MainViewLayout header='Explore DAOs'>
        {!customLoading && !loading ? (
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
