import React, { useEffect, useContext } from 'react';

import { CustomThemeContext } from '../contexts/CustomThemeContext';
import Layout from '../components/layout';
import Main from './Main';
import { defaultHubData } from '../utils/navLinks';

const Hub = () => {
  const { theme, resetTheme } = useContext(CustomThemeContext);

  useEffect(() => {
    if (theme.active) {
      resetTheme();
    }
  }, [theme, resetTheme]);

  return (
    <Layout navLinks={defaultHubData}>
      <Main />
    </Layout>
  );
};

export default Hub;
