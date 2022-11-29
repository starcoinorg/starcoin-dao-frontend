import React, { createContext, useEffect, useState } from 'react';

import { useSessionStorage } from '../hooks/useSessionStorage';
import { EXPLORER_DAOS } from '../graphQL/explore-queries';
import { exploreChainQuery } from '../utils/theGraph';
import { getApiMetadata } from '../utils/metadata';
import { SORT_OPTIONS, EXPLORE_FILTER_OPTIONS } from '../utils/exploreContent';
import { supportedChains } from '../utils/chain';
import { getDaoQuantity, listDaos } from '../utils/dao';
import { useInjectedProvider } from './InjectedProviderContext';
import { off } from 'process';

export const ExploreContext = createContext();

const initialState = {
  filters: {
    members: ['1'],
    purpose: EXPLORE_FILTER_OPTIONS.filter(o => o.type === 'purpose').map(
      o => o.value,
    ),
    version: EXPLORE_FILTER_OPTIONS.filter(o => o.type === 'version').map(
      o => o.value,
    ),
    network: EXPLORE_FILTER_OPTIONS.filter(o => o.type === 'network')
      .filter(o => o.default)
      .map(o => o.value),
  },
  searchTerm: null,
  sort: SORT_OPTIONS[0],
  tags: [],
  pages: {
    index: 0,
    offset:
      Math.floor(window.innerWidth / 340) *
      Math.floor(window.innerHeight / 340),
    total: 0,
  },
  allDaos: new Map(),
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'sizeChange': {
      state.pages.offset = action.payload;
      return {
        ...state,
      };
    }
    case 'nextPage': {
      if (state.pages.index * state.pages.offset > state.total) {
        return state;
      }
      state.pages.index++;
      return {
        ...state,
      };
    }
    case 'previousPage': {
      if (state.pages.index > 0) {
        state.pages.index--;
        return {
          ...state,
        };
      }
      return state;
    }
    case 'resetExplore': {
      return {
        ...state,
        sort: initialState.sort,
        filters: initialState.filters,
        searchTerm: initialState.searchTerm,
      };
    }
    case 'updateSort': {
      return { ...state, sort: action.payload };
    }
    case 'resetSort': {
      return { ...state, sort: initialState.sort };
    }
    case 'addFilter': {
      return { ...state, filters: { ...state.filters, ...action.payload } };
    }
    case 'updateFilter': {
      const updatedFilters = { ...state.filters, ...action.payload };

      return { ...state, filters: updatedFilters };
    }
    case 'setSearchTerm': {
      return { ...state, searchTerm: action.payload };
    }
    case 'clearSearchTerm': {
      return { ...state, searchTerm: initialState.searchTerm };
    }
    case 'updateTags': {
      return { ...state, tags: action.payload };
    }
    case 'clearTags': {
      return { ...state, tags: initialState.tags };
    }

    default: {
      return initialState;
    }
  }
};

export const ExploreContextProvider = ({ children }) => {
  const { injectedProvider } = useInjectedProvider();
  // const [allDaos, setAllDaos] = useState(new Map());
  const [exploreDaos, setExploreDaos] = useState({
    loaded: false,
    chains: [],
    data: [],
  });
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // TODO: support dynamic condition
  // useEffect(() => {
  //   const handler = () => {
  //     const offset =
  //       Math.floor(window.innerWidth / 340) *
  //       Math.floor(window.innerHeight / 340);

  //     if (offset != state.offset) {
  //       dispatch({ type: 'sizeChange', payload: offset });
  //     }
  //   };
  //   handler();
  //   window.addEventListener('resize', handler);

  //   return () => {
  //     window.removeEventListener('resize', handler);
  //   };
  // }, []);

  useEffect(() => {
    console.log(state);
    if (state.allDaos) {
      const exData = state.allDaos.get(state.pages.index);

      if (exData) {
        setExploreDaos({
          loaded: true,
          chains: [],
          data: exData,
        });
        return;
      }
    }

    setExploreDaos({
      loaded: false,
      chains: [],
      data: null,
    });

    const fetchData = async () => {
      const daoTotal = await getDaoQuantity(injectedProvider);
      state.pages.total = daoTotal;

      const data = await listDaos(
        injectedProvider,
        state.pages.index,
        state.pages.offset,
        {
          withLogo: false,
          withPlugins: false,
          withExtInfo: true,
        },
      );

      state.allDaos = new Map(state.allDaos).set(state.pages.index, data);

      setExploreDaos({
        loaded: true,
        chains: [],
        data: data,
      });
    };

    fetchData();
  }, [state]);

  return (
    <ExploreContext.Provider
      value={{
        state,
        dispatch,
        exploreDaos,
      }}
    >
      {children}
    </ExploreContext.Provider>
  );
};
