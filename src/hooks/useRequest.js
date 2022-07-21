import { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../utils/getConfig';

const url_prev = `${config.api}/`;

export const useRequest = (url, options) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios(`${url_prev}${url}`, options);
        setData(response.data || response);
      } catch (error) {
        setError(error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return { data, loading, error };
};
