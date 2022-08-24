import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Flex, Spinner, Box } from '@chakra-ui/react';

import { useInjectedProvider } from '../../../../contexts/InjectedProviderContext';
import { useSessionStorage } from '../../../../hooks/useSessionStorage';
import CsvDownloadButton from '../../../../components/csvDownloadButton';
import ListSelect from '../../../../components/listSelect';
import NoListItem from '../../../../components/NoListItem';
import ProposalSearch from '../../../../components/proposalSearch';
import Paginator from '../../../../components/paginator';
import {
  defaultFilterOptions,
  getFilters,
  sortOptions,
  allFilter,
} from '../../../../utils/proposalContent';
import TextBox from '../../../../components/TextBox';
import {
  handleListFilter,
  handleListSort,
  isProposalActive,
  searchProposals,
} from '../../../../utils/proposalUtils';
import ProposalCardV2 from '../../../../proposalBuilder/proposalCard';
import { useRequest } from '../../../../hooks/useRequest';

const ProposalsList = () => {
  const { address } = useInjectedProvider();
  const [paginatedProposals, setPageProposals] = useState(null);
  const [listProposals, setListProposals] = useState(null);

  const { daoid } = useParams();

  const [filterOptions, setFilterOptions] = useState(defaultFilterOptions);
  const [filter, setFilter] = useSessionStorage(`${daoid}-filter`, null);
  const [sort, setSort] = useSessionStorage(`${daoid}-sort`, null);
  const [proposals, setProposals] = useState([]);

  const prevMember = useRef('No Address');
  const searchMode = useRef(false);

  let { data: _proposals, loading } = useRequest(`proposals?page=0&size=10`, {
    method: 'get',
  });

  useEffect(() => {
    if (_proposals) {
      setProposals(_proposals);
    }
  }, [_proposals]);

  // proposals = [proposals];
  useEffect(() => {
    const initializeFilters = (initFilter, initSort) => {
      setFilter(initFilter);
      setSort(initSort);
    };
    const sameUser = prevMember.current === address;
    if (!proposals || sameUser) return;
    // const activeProposals = proposals.filter(proposal =>
    //   isProposalActive(proposal),
    // );

    const activeProposals = proposals;

    const filters = getFilters(activeProposals);
    setFilterOptions(filters);

    const hasSavedChanges =
      prevMember.current === 'No Address' && filter && sort;
    if (!hasSavedChanges) {
      initializeFilters(
        filters?.main?.[0],
        { name: 'Newest', value: 'submissionDateDesc' },
        // activeProposals?.length
        //   ? { name: 'Oldest', value: 'submissionDateAsc' }
        //   : { name: 'Newest', value: 'submissionDateDesc' },
      );
    }
    prevMember.current = address;
  }, [proposals, filter, sort]);

  useEffect(() => {
    if (!proposals || !filter || !sort || searchMode.current) return;
    setListProposals(handleListSort(handleListFilter(proposals, filter), sort));
  }, [filter, sort, proposals, address]);

  const handleFilter = option => {
    if (!option?.value || !option?.type || !option?.name) {
      console.error(
        'Filter component did not update. Received incorrect data stucture',
      );
      return;
    }
    const isActiveFilter =
      option?.value === 'Active' || option?.value === 'Action Needed';
    searchMode.current = false;
    setFilter(option);
    setSort({
      name: isActiveFilter ? 'Oldest' : 'Newest',
      value: `submissionDate${isActiveFilter ? 'Asc' : 'Desc'}`,
    });
  };

  const handleSort = option => {
    if (!option?.value || !option?.name) {
      console.error(
        'Sort component did not update. Received incorrect data stucture',
      );
      return;
    }
    searchMode.current = false;
    setSort(option);
  };
  const performSearch = (address, searchFilters) => {
    setSort({ name: 'Newest', value: 'submissionDateDesc' });
    setFilter(allFilter);
    setListProposals(searchProposals(address, searchFilters, proposals));
    searchMode.current = true;
  };
  const resetSearch = () => {
    searchMode.current = false;
    prevMember.current = 'inReset';
    setFilter(null);
    setSort(null);
  };

  const isLoaded = proposals;
  return (
    <>
      <Flex wrap='wrap' position='relative' justifyContent='space-between'>
        <ListSelect
          currentOption={filter?.name}
          options={filterOptions}
          handleSelect={handleFilter}
          label='Filter By'
          count={proposals?.length}
        />
        <ListSelect
          label='Sort By'
          currentOption={sort?.name}
          options={sortOptions}
          handleSelect={handleSort}
          // uses custom props to prevent overlap with search button
          containerProps={{
            // width: ['100%', null, null, '38%'],
            zIndex: '10',
            marginRight: '10%',
            marginLeft: '5%',
          }}
        />
        <ProposalSearch
          performSearch={performSearch}
          resetSearch={resetSearch}
        />
        {/* <CsvDownloadButton entityList={listProposals} typename='Proposals' /> */}
      </Flex>

      <Box mt={4}>
        {isLoaded &&
          paginatedProposals?.map(proposal => (
            <ProposalCardV2 key={proposal.categoryId} proposal={proposal} />
          ))}
      </Box>

      {isLoaded ? (
        <Paginator
          perPage={5}
          setRecords={setPageProposals}
          allRecords={proposals}
        />
      ) : (
        <Flex w='100%' h='150px' align='center' justify='center'>
          <Spinner
            thickness='6px'
            speed='0.45s'
            emptyColor='whiteAlpha.300'
            color='primary.500'
            size='xl'
            mt={40}
          />
        </Flex>
      )}
      {proposals && !proposals.length && (
        <Box mt={6}>
          <NoListItem>
            <TextBox>No Proposals Here yet</TextBox>
          </NoListItem>
        </Box>
      )}
    </>
  );
};

export default ProposalsList;
