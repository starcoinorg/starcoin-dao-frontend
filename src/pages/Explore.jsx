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
import { DaoService } from '../services/daoService';

const url_prev = `${config.api}/`;

const Explore = () => {
  const { theme, resetTheme } = useContext(CustomThemeContext);
  const [daoList, setDaoList] = useState([]);
  const [daos, setDaos] = useState([]);
  const [_daos, _setDaos] = useState([]);
  const [_chainDaos, _setChainDaos] = useState([]);
  const [loading, setLoading] = useState(false);
  const daoService = new DaoService();

  const getAllData = async () => {
    Promise.all([
      axios.get(`${url_prev}daos`, {
        method: 'get',
        params: {
          page: '1',
          size: '1',
        },
      }),
      axios.get(`${url_prev}daos`, {
        method: 'get',
        params: {
          page: '0',
          size: '1',
        },
      }),
    ]).then(res => {
      setDaos(res[0].data);
      _setDaos(res[1].data);
      setDaos(res[0].loading);
    });
  };

  useEffect(() => {
    if (theme.active) {
      resetTheme();
    }
  }, [theme, resetTheme]);

  useEffect(() => {
    getAllData();
  }, []);

  useEffect(async () => {
    const daos = await daoService.listDaos();
    _setChainDaos(daos);
  }, []);

  useEffect(() => {
    if (daos && _daos) {
      setDaoList([...daos, ..._daos, ..._chainDaos]);
    }
  }, [daos, _daos]);

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
