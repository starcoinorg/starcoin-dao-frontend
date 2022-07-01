import React, { useContext, useEffect, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import axios from 'axios';

import { ExploreContext } from '../contexts/ExploreContext';
import ExploreCard from './exploreCard';

const ExploreList = ({ handleDaoCalculate }) => {
  const [daos, setDaos] = useState([]);
  const { state, exploreDaos } = useContext(ExploreContext);
  useEffect(() => {
    // const filteredAndSortedDaos = exploreDaos.data
    //   .filter(dao => {
    //     if (!dao.meta) {
    //       console.log('unregistered dao', dao);
    //       return false;
    //     }

    //     let searchMatch = true;
    //     if (state.searchTerm) {
    //       searchMatch =
    //         dao.meta.name.toLowerCase().indexOf(state.searchTerm) > -1;
    //     }

    //     let tagMatch = true;
    //     if (state.tags.length) {
    //       tagMatch =
    //         dao.meta?.tags.length &&
    //         state.tags.some(tag => dao.meta.tags.indexOf(tag) >= 0);
    //     }

    //     const memberCount =
    //       dao.members.length > (state.filters.members[0] || 0);
    //     const versionMatch = state.filters.version.includes(dao.version);
    //     const purposeMatch = state.filters.purpose.includes(dao.meta.purpose);
    //     const networkMatch = state.filters.network.includes(dao.networkId);

    //     return (
    //       searchMatch &&
    //       tagMatch &&
    //       memberCount &&
    //       versionMatch &&
    //       purposeMatch &&
    //       networkMatch
    //     );
    //   })
    //   .sort((a, b) => {
    //     if (state.sort.count) {
    //       return b[state.sort.value].length - a[state.sort.value].length;
    //     }
    //     return b[state.sort.value] - a[state.sort.value];
    //   });

    const getDaos = async () => {
      const res = await axios.get(
        'http://k8s-default-daoapiin-a10a2591c6-298563096.ap-northeast-1.elb.amazonaws.com:80/dev/v1/daos',
        {
          params: {
            page: '1',
            size: '1',
          },
        },
      );

      setDaos(res.data);
      handleDaoCalculate(res.data.length);
    };

    // {
    //   communityLinksDiscord: 'http://test_dao_community_links_discord';
    //   communityLinksTelegram: 'http://test_dao_community_links_telegram';
    //   communityLinksTwitter: 'http://test_dao_community_links_twitter';
    //   daoId: 'test_dao_id';
    //   description: 'test_dao_description';
    //   logoUrl: null;
    //   longDescription: null;
    //   moreTags: null;
    //   name: 'test_dao_name';
    //   purposeId: 'test_dao_purpose_id';
    //   tags: 'test_dao_tags,blockchain,dao';
    // }

    getDaos();
  }, []);

  const daoList = daos.map((dao, i) => {
    return <ExploreCard dao={dao} key={`${dao.id}-${i}`} />;
  });

  return (
    <>
      {daos.length ? (
        <Flex wrap='wrap' align='start' justify='space-around' w='100%'>
          {daoList}
        </Flex>
      ) : null}
    </>
  );
};

export default ExploreList;
