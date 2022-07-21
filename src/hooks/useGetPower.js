import { useState, useEffect } from 'react';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import axios from 'axios';
import config from '../utils/getConfig';

const url_prev = `${config.api}/getVotingPower`;

export const useGetPower = options => {
  const { requestWallet, address } = useInjectedProvider();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  options = {
    ...options,
    accountAddress: address,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios('url_prev', options);
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
