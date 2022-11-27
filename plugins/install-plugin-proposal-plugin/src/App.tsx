import React from 'react';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import PluginManagement from './pages/PluginManagement';
import PluginDetail from './pages/PluginDetail';
import { ChakraProvider } from '@chakra-ui/react';
import { OverlayProvider } from './contexts/OverlayContext';
import { useSubAppContext } from './contexts/SubAppContext';

const App = () => {
  const { theme } = useSubAppContext();

  const routes = (
    <Switch>
      <Route exact path="/" component={() => <Redirect to="/home" />} />
      <Route exact path="/home" component={() => <PluginManagement />} />
      <Route path="/plugin/:pluginId" component={() => <PluginDetail />} />
    </Switch>
  );

  return (
    <ChakraProvider theme={theme}>
      <OverlayProvider>
        {routes}
      </OverlayProvider>
    </ChakraProvider>
  )
};

export default App;
