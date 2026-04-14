import '@i18n';

import React, {useEffect, useState} from 'react';

import {Platform, StatusBar, UIManager} from 'react-native';

import moment from 'moment';

import {theme} from '@app/themes';
import {AppProvider} from '@components-organisms/provider';
import {ErrorBoundary} from '@components/atoms/error-boundary';
import {Container} from '@components/container';
import {MainNavigator} from '@router/main-navigation';
import SplashScreen from '@screens/splash-screen';
import {ThemeProvider} from '@shopify/restyle';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moment.locale('en');
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    StatusBar.setBarStyle('dark-content');
    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return loading ? (
    <Container translucent>
      <SplashScreen />
    </Container>
  ) : (
    <MainNavigator />
  );
};

function RootApp() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default RootApp;
