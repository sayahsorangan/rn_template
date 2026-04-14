import React from 'react';

import {NavigationContainer} from '@react-navigation/native';

import {linking} from './linking';
import {navigationRef} from './navigation-helper';
import {StackNavigator} from './stack-navigation';

export const MainNavigator = () => {
  const routeNameRef = React.useRef<string | undefined>('');

  const onReady = React.useCallback(async () => {
    routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
  }, []);

  async function onStateChange() {
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

    routeNameRef.current = currentRouteName;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onReady}
      onStateChange={onStateChange}
      documentTitle={{enabled: true}}
      linking={linking}
    >
      <StackNavigator />
    </NavigationContainer>
  );
};
