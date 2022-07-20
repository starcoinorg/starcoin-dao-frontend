import { useState, useEffect } from 'react';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import axios from 'axios';

const url_prev =
  'http://k8s-default-daoapiin-a10a2591c6-298563096.ap-northeast-1.elb.amazonaws.com/main/v1/getVotingPower';

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
