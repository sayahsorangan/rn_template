import '@i18n';

import React, {useEffect, useState} from 'react';

import {Platform, StatusBar, UIManager} from 'react-native';

import moment from 'moment';

import {useAppSelector} from '@app/hooks/redux';
import {dark_theme, theme} from '@app/themes';
import {AppProvider} from '@components-organisms/provider';
import {ErrorBoundary} from '@components/atoms/error-boundary';
import {Container} from '@components/container';
import i18n from '@i18n';
import {MainNavigator} from '@router/main-navigation';
import SplashScreen from '@screens/splash-screen';
import {ThemeProvider} from '@shopify/restyle';

const App = () => {
  const [loading, setLoading] = useState(true);
  const themeMode = useAppSelector(state => state.AppReducer.themeMode);
  const language = useAppSelector(state => state.AppReducer.language);

  useEffect(() => {
    moment.locale('en');
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    StatusBar.setBarStyle(themeMode === 'dark' ? 'light-content' : 'dark-content');

    const timeout = setTimeout(() => setLoading(false), 1000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const activeTheme = themeMode === 'dark' ? dark_theme : theme;

  return (
    <ThemeProvider theme={activeTheme}>
      {loading ? (
        <Container translucent>
          <SplashScreen />
        </Container>
      ) : (
        <MainNavigator />
      )}
    </ThemeProvider>
  );
};

function RootApp() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default RootApp;
