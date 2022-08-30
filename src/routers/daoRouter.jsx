import Garfish from 'garfish';
import React from 'react';
import { useEffect, useState } from 'react';
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useParams,
} from 'react-router-dom';

import { useDao } from '../contexts/DaoContext';
import { useDaoMember } from '../contexts/DaoMemberContext';
import { useMetaData } from '../contexts/MetaDataContext';
import { useToken } from '../contexts/TokenContext';
import { GarfishInit } from '../garfishInit';

// import Allies from '../pages/Allies';
import DiscourseSettings from '../pages/DiscourseSettings';
import Layout from '../components/layout';
import MarketPlaceV0 from '../pages/MarketPlaceV0';
import Members from '../pages/Members';
import Meta from '../pages/Meta';
import MetaAudit from '../pages/MetaAudit';
import MinionGallery from '../pages/MinionGallery';
import MinionVault from '../pages/MinionVault';
import MintGate from '../pages/MintGate';
import Notifications from '../pages/Notifications';
import Overview from '../pages/Overview';
import PartyFavor from '../pages/PartyFavor';
import Profile from '../pages/Profile';
import Proposal from '../pages/Proposal';
import Proposals from '../pages/Proposals';
import ProposalTypes from '../pages/ProposalTypes';
import ProposalAudit from '../pages/ProposalAudit';
import Settings from '../pages/Settings';
import Snapshot from '../pages/Snapshot';
import SnapshotSettings from '../pages/SnapshotSettings';
import SuperfluidMinion from '../pages/SuperfluidMinion';
import ThemeBuilder from '../pages/ThemeBuilder';
import Treasury from '../pages/Treasury';
import Vaults from '../pages/Vaults';
import ProposalsSpam from '../pages/ProposalsSpam';
import SpamFilterSettings from '../pages/SpamFilterSettings';
import DaoDocs from '../pages/daoDocs';
import DaoDoc from '../pages/DaoDoc';

const DaoRouter = () => {
  const { path } = useRouteMatch();
  const { currentDaoTokens } = useToken();
  const {
    daoActivities,
    isCorrectNetwork,
    daoOverview,
    daoMembers,
    daoProposals,
    daoVaults,
  } = useDao();
  const { isMember, daoMember, delegate } = useDaoMember();

  const { daoid, daochain } = useParams();
  const { daoMetaData, customTerms, refetchMetaData } = useMetaData();

  const [subAppMenus, setSubAppMenus] = useState([]);
  const [pluginLoaded, setPluginLoaded] = useState(false);

  const dao = {
    daoID: daoid,
    chainID: daochain,
    daoMetaData,
    daoMember,
    customTerms,
    daoProposals,
    daoVaults,
    subAppMenus,
  };

  dao.registerApp = async app => {
    const activeWhen = `/newRegister${app.activeWhen}`;

    // 调用 Garfish.registerApp 动态注册子应用
    Garfish.registerApp({
      name: this.name,
      basename: '/examples',
      activeWhen: activeWhen,
      entry: 'cached',
    });

    subAppMenus.push({
      key: app.name,
      icon: <img src={app.icon} className='sidebar-item-icon' />,
      title: `【PluginApp】${app.name}`,
      path: activeWhen,
    });

    setSubAppMenus(subAppMenus);
  };

  dao.adapterIPFS = res => {
    if (res.startsWith('ipfs:://')) {
      const ipfs_cid = res.substring(8);
      return `https://ipfs.filebase.io/ipfs/${ipfs_cid}`.toString();
    } else {
      return res.toString();
    }
  };

  useEffect(async () => {
    if (pluginLoaded) {
      return;
    }

    await GarfishInit(path);

    const daoPlugins = daoMetaData.installedPlugins;

    for (const i in daoPlugins) {
      const plugin_info = daoPlugins[i];

      const app = await Garfish.preLoadApp(plugin_info.name, {
        entry: dao.adapterIPFS(plugin_info.js_entry_uri),
      });

      const modules = app?.cjsModules.exports;
      modules?.setup(dao);
    }

    setPluginLoaded(true);
  }, [path]);

  return (
    <Layout dao={dao}>
      <Switch>
        <Route exact path={`${path}/`}>
          <Overview
            activities={daoActivities}
            daoMember={daoMember}
            isMember={isMember}
            isCorrectNetwork={isCorrectNetwork}
            daoOverview={daoOverview}
            members={daoMembers}
            daoMetaData={daoMetaData}
            daoVaults={daoVaults}
            daoData={dao}
          />
        </Route>
        <Route exact path={`${path}/proposals`}>
          <Proposals
            proposals={daoActivities?.proposals}
            overview={daoOverview}
            activities={daoActivities}
            customTerms={customTerms}
          />
        </Route>
        <Route exact path={`${path}/vaults`}>
          <Vaults
            currentDaoTokens={currentDaoTokens}
            overview={daoOverview}
            customTerms={customTerms}
            daoVaults={daoVaults}
          />
        </Route>
        <Route exact path={`${path}/vaults/treasury`}>
          <Treasury
            currentDaoTokens={currentDaoTokens}
            overview={daoOverview}
            customTerms={customTerms}
            daoMember={daoMember}
            daoVaults={daoVaults}
          />
        </Route>
        <Route exact path={`${path}/vaults/minion/:minion`}>
          <MinionVault
            currentDaoTokens={currentDaoTokens}
            overview={daoOverview}
            customTerms={customTerms}
            daoMember={daoMember}
            daoVaults={daoVaults}
            isMember={isMember}
          />
        </Route>
        <Route
          exact
          path={[`${path}/gallery/minion/:minion`, `${path}/gallery/`]}
        >
          <MinionGallery daoVaults={daoVaults} customTerms={customTerms} />
        </Route>
        <Route exact path={`${path}/members`}>
          <Members
            members={daoMembers}
            activities={daoActivities}
            overview={daoOverview}
            daoMember={daoMember}
            daoMembers={daoMembers}
            customTerms={customTerms}
            daoMetaData={daoMetaData}
          />
        </Route>
        <Route exact path={`${path}/settings/boosts`}>
          <MarketPlaceV0 />
        </Route>
        <Route exact path={`${path}/staking`}>
          <Redirect to='/' />
        </Route>
        <Route exact path={`${path}/settings/notifications`}>
          <Notifications
            daoMetaData={daoMetaData}
            refetchMetaData={refetchMetaData}
          />
        </Route>
        <Route exact path={`${path}/settings/discourse`}>
          <DiscourseSettings
            daoMetaData={daoMetaData}
            refetchMetaData={refetchMetaData}
          />
        </Route>
        <Route exact path={`${path}/settings/theme`}>
          <ThemeBuilder refetchMetaData={refetchMetaData} />
        </Route>
        <Route exact path={`${path}/settings`}>
          <Settings
            overview={daoOverview}
            daoMetaData={daoMetaData}
            customTerms={customTerms}
          />
        </Route>
        <Route exact path={`${path}/settings/meta`}>
          <Meta
            daoMetaData={daoMetaData}
            isMember={isMember}
            refetchMetaData={refetchMetaData}
          />
        </Route>
        <Route exact path={`${path}/settings/audit`}>
          <MetaAudit daoMetaData={daoMetaData} />
        </Route>
        <Route exact path={`${path}/settings/proposals`}>
          <ProposalTypes
            daoMetaData={daoMetaData}
            refetchMetaData={refetchMetaData}
          />
        </Route>
        <Route exact path={`${path}/settings/spam`}>
          <SpamFilterSettings
            daoMetaData={daoMetaData}
            daoOverview={daoOverview}
          />
        </Route>
        <Route
          exact
          path={`${path}/settings/superfluid-minion/:minion`} // path={`${path}/settings/superfluid-minion/:minion(\b0x[0-9a-f]{10,40}\b)`}
        >
          <SuperfluidMinion
            activities={daoActivities}
            overview={daoOverview}
            daoMember={daoMember}
            members={daoMembers}
          />
        </Route>
        <Redirect
          from={`${path}/proposals/hardcore`}
          to={`${path}/proposals/audit`}
        />
        <Route exact path={`${path}/proposals/audit`}>
          <ProposalAudit daoProposals={daoProposals} />
        </Route>

        <Route exact path={`${path}/proposals/spam`}>
          <ProposalsSpam daoMetaData={daoMetaData} />
        </Route>
        <Route exact path={`${path}/proposals/:propid`}>
          <Proposal
            overview={daoOverview}
            daoMember={daoMember}
            activities={daoActivities}
            customTerms={customTerms}
            daoProposals={daoProposals}
            delegate={delegate}
          />
        </Route>
        <Route exact path={`${path}/profile/:userid`}>
          <Profile
            members={daoMembers}
            overview={daoOverview}
            daoTokens={currentDaoTokens}
            activities={daoActivities}
            daoMember={daoMember}
          />
        </Route>
        <Route exact path={`${path}/boost/mintgate`}>
          <MintGate daoMetaData={daoMetaData} />
        </Route>
        <Route exact path={`${path}/boost/snapshot/settings`}>
          <SnapshotSettings
            daoMetaData={daoMetaData}
            refetchMetaData={refetchMetaData}
          />
        </Route>
        <Route exact path={`${path}/boost/snapshot`}>
          <Snapshot
            isMember={isMember}
            daoMetaData={daoMetaData}
            refetchMetaData={refetchMetaData}
          />
        </Route>
        <Route exact path={`${path}/party-favor`}>
          <PartyFavor isMember={isMember} />
        </Route>
        <Route exact path={`${path}/docs`}>
          <DaoDocs />
        </Route>
        <Route exact path={`${path}/doc/:docId`}>
          <DaoDoc />
        </Route>
      </Switch>
    </Layout>
  );
};

export default DaoRouter;
