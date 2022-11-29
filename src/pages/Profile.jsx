import React, { useState, useEffect } from 'react';
import { Flex, Box } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import BankList from '../components/bankList';
import ActivitiesFeed from '../components/activitiesFeed';
import ProfileCard from '../components/profileCard';
import MainViewLayout from '../components/mainViewLayout';
import { getProfileActivites } from '../utils/activities';
import { handleGetProfile } from '../utils/3box';
import { initTokenData } from '../utils/tokenValue';
import { getMemberNFT, listUserOffers } from '../utils/dao';
import OfferCard from '../components/offerCard';

const Profile = ({ members, overview, daoTokens, activities }) => {
  const { daoid, daochain, userid } = useParams();
  const { injectedProvider, address } = useInjectedProvider();
  const [profile, setProfile] = useState(null);

  const [memberEntity, setMemberEntity] = useState(null);
  const [tokensReceivable, setTokensReceivable] = useState([]);
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    const getMyMemberNFT = async () => {
      try {
        const nft = await getMemberNFT(injectedProvider, daoid, userid);
        console.log('member nft', nft);

        if (nft) {
          setMemberEntity({
            exists: true,
            memberAddress: userid,
            tokenBalances: [],
            shares: nft.init_sbt,
          });
        } else {
          setMemberEntity({
            exists: false,
            shares: 0,
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    getMyMemberNFT();
  }, [daochain, daoid, userid]);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const offers = await listUserOffers(daoid, address);
        if (offers.length > 0) {
          offers[0].time_lock = new Date(
            offers[0].time_lock * 1000,
          ).toLocaleString();

          setOffer(offers[0]);
        }

        console.log(offers);

        const profile = await handleGetProfile(userid);
        if (!profile) return;
        setProfile(profile);
      } catch (error) {
        console.error(error);
      }
    };
    if (userid) {
      getProfile();
    }
  }, [userid]);

  useEffect(() => {
    const initMemberTokens = async tokensWithBalance => {
      const newTokenData = await initTokenData(daochain, tokensWithBalance);
      setTokensReceivable(newTokenData);
    };
    if (memberEntity?.tokenBalances && daochain) {
      const tokensWithBalance = memberEntity.tokenBalances.filter(
        token => +token.tokenBalance > 0,
      );
      if (tokensWithBalance?.length) {
        // initMemberTokens(tokensWithBalance);
      } else {
        setTokensReceivable([]);
      }
    }
  }, [memberEntity]);

  const hasBalance = () => {
    return (
      address &&
      address.toLowerCase() === userid.toLowerCase() &&
      tokensReceivable.length
    );
  };

  return (
    <MainViewLayout header='Profile' isDao>
      <Flex wrap='wrap'>
        <Box
          w={['100%', null, null, null, '60%']}
          pr={[0, null, null, null, 6]}
          pb={6}
        >
          <ProfileCard
            overview={overview}
            daoTokens={daoTokens}
            ens={profile?.ens}
            profile={profile}
            memberEntity={memberEntity}
            refreshProfile={setProfile}
          />
          {offer ? (
            <OfferCard
              tokens={tokensReceivable}
              hasBalance={hasBalance()}
              offer={offer}
              profile
              daoType={daoid}
              provider={injectedProvider}
            />
          ) : (
            <></>
          )}
          <BankList
            tokens={tokensReceivable}
            hasBalance={hasBalance()}
            profile
          />
        </Box>
        <Box w={['100%', null, null, null, '40%']}>
          {activities && memberEntity && (
            <ActivitiesFeed
              limit={5}
              hydrateFn={getProfileActivites(memberEntity.memberAddress)}
              activities={activities}
            />
          )}
        </Box>
      </Flex>
    </MainViewLayout>
  );
};

export default Profile;
