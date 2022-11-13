import React, {
  useContext,
  useState,
  createContext,
  useEffect,
  useRef,
  useReducer,
  useCallback,
} from 'react';
import { useParams } from 'react-router-dom';

import { useCustomTheme } from './CustomThemeContext';
import { useUser } from './UserContext';
import { proposalConfigReducer } from '../reducers/proposalConfig';
import { fetchMetaData } from '../utils/metadata';
import { DaoService } from '../services/daoService';

export const MetaDataContext = createContext();

export const MetaDataProvider = ({ children }) => {
  const { userHubDaos, refetchUserHubDaos } = useUser();
  const { updateTheme, resetTheme } = useCustomTheme();
  const { daoid, daochain } = useParams();

  const [customTerms, setCustomTerms] = useState(null);
  const [daoMetaData, setDaoMetaData] = useState(null);
  const [daoProposals, dispatchPropConfig] = useReducer(
    proposalConfigReducer,
    null,
  );

  const hasFetchedMetadata = useRef(false);
  const shouldUpdateTheme = useRef(true);

  const daoService = new DaoService();

  const fetchData = useCallback(async () => {
    try {
      const data = await daoService.getDao(daoid);
      console.log('current DAO data:', data);
      if (shouldUpdateTheme.current && !daoMetaData) {
        if (data.customThemeConfig) {
          updateTheme(data.customThemeConfig);
        } else {
          resetTheme();
        }
        if (data.customTermsConfig) {
          setCustomTerms(data.customTermsConfig);
        }
        setDaoMetaData(data);
        dispatchPropConfig({ action: 'INIT', payload: data });
        shouldUpdateTheme.current = false;
      }
    } catch (error) {
      console.error(error);
    }
  }, [daoid, daochain]);

  useEffect(() => {
    fetchData();
  }, [daoid, daochain]);

  const refetchMetaData = () => {
    shouldUpdateTheme.current = true;
    refetchUserHubDaos();
  };

  return (
    <MetaDataContext.Provider
      value={{
        daoMetaData,
        customTerms,
        daoProposals,
        dispatchPropConfig,
        hasFetchedMetadata,
        shouldUpdateTheme,
        refetchMetaData,
      }}
    >
      {children}
    </MetaDataContext.Provider>
  );
};

export const useMetaData = () => {
  const {
    daoMetaData,
    daoProposals,
    hasFetchedMetadata,
    dispatchPropConfig,
    shouldUpdateTheme,
    customTerms,
    refetchMetaData,
  } = useContext(MetaDataContext);
  return {
    daoMetaData,
    daoProposals,
    hasFetchedMetadata,
    dispatchPropConfig,
    shouldUpdateTheme,
    customTerms,
    refetchMetaData,
  };
};
