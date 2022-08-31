import React, { useEffect, useState } from 'react';
import { RiTrophyLine, RiLinksLine } from 'react-icons/ri';
import { Stack } from '@chakra-ui/react';

import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { useDaoPlugin } from '../contexts/DaoPluginContext';

import NavLink from './navlink';
import {
  defaultHubData,
  generateDaoLinks,
  generateDaoLinksLoading,
} from '../utils/navLinks';
import { getTerm } from '../utils/metadata';

const NavLinkList = ({ dao, view, toggleNav = null }) => {
  const { address } = useInjectedProvider();
  const { pluginMenus } = useDaoPlugin();

  const [navLinks, setNavLinks] = useState([]);
  const [pluginLinks, setPluginLinks] = useState([]);

  useEffect(async () => {
    if (dao?.chainID && dao?.daoID) {
      const navLinks =
        dao.daoProposals && dao.daoVaults && dao.daoMetaData
          ? generateDaoLinks(
              dao.chainID,
              dao.daoID,
              dao.daoProposals,
              dao.daoVaults,
              dao.daoMetaData,
            )
          : generateDaoLinksLoading(dao.chainID, dao.daoID);
      setNavLinks(navLinks);

      setPluginLinks(pluginMenus);
    } else {
      setNavLinks(defaultHubData);
    }
  }, [address, dao]);

  return (
    <Stack
      spacing={[1, null, null, 3]}
      d='flex'
      mt={[3, null, null, 12]}
      flexDirection='column'
    >
      {navLinks &&
        navLinks.map(link => {
          return (
            <NavLink
              key={link.path || link.href}
              label={
                dao?.customTermsConfig
                  ? getTerm(dao.customTermsConfig, link.label)
                  : link.label
              }
              path={link.path}
              href={link.href}
              icon={link.icon}
              view={view}
              onClick={toggleNav}
            />
          );
        })}
      {pluginLinks &&
        pluginLinks.map(config => {
          return (
            <NavLink
              key={config.key}
              label={config.title}
              path={`${config.path}`}
              href={`${config.path}`}
              icon={config.logo || RiLinksLine}
              view={view}
              onClick={toggleNav}
            />
          );
        })}
    </Stack>
  );
};

export default NavLinkList;
