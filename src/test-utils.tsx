import React, {ReactElement} from 'react';

import {Provider} from 'react-redux';

import {NavigationContainer} from '@react-navigation/native';
import {render, RenderOptions} from '@testing-library/react-native';

import {theme} from '@app/themes/Theme';
import {rootReducers} from '@lib/redux/root-reducer';
import {configureStore} from '@reduxjs/toolkit';
import {ThemeProvider} from '@shopify/restyle';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Record<string, any>;
  store?: ReturnType<typeof configureStore>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: rootReducers,
      preloadedState,
      middleware: getDefault =>
        getDefault({
          serializableCheck: false,
        }),
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {retry: false},
      mutations: {retry: false},
    },
  });

  function Wrapper({children}: {children: React.ReactNode}) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <NavigationContainer>{children}</NavigationContainer>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    );
  }

  return {store, ...render(ui, {wrapper: Wrapper, ...renderOptions})};
}

export * from '@testing-library/react-native';
