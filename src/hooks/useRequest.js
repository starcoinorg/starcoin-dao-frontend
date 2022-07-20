import { useState, useEffect } from 'react';
import axios from 'axios';

const url_prev =
  'http://k8s-default-daoapiin-a10a2591c6-298563096.ap-northeast-1.elb.amazonaws.com/main/v1/';

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
