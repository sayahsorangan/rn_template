import React, {useEffect, useRef} from 'react';

import {Animated, View} from 'react-native';

import {Images} from '@app/assets/images';
import {SCREEN_WIDTH} from '@app/constan/dimensions';
import {useTheme} from '@app/themes';
import {Container} from '@components/container';
import {store} from '@redux-store/store';
import {Navigation, navigationRef} from '@router/navigation-helper';

const SplashScreen = () => {
  const theme = useTheme();

  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 4,
        bounciness: 14,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!navigationRef.isReady()) {
        return;
      }
      store.subscribe(store.getState);
      const {UserReducer} = store.getState();
      const isAuthenticated = !!UserReducer.auth?.accessToken;
      if (isAuthenticated) {
        Navigation.replace('tab', {screen: 'home'});
      } else {
        Navigation.replace('login');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [scale, opacity, rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <Container translucent backgroundColor={theme.colors.white}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Animated.Image
          source={Images.logo}
          style={{
            width: SCREEN_WIDTH / 2,
            height: SCREEN_WIDTH / 2,
            borderRadius: theme.borderRadii.round,
            opacity,
            transform: [{scale}, {rotate: spin}],
          }}
        />
      </View>
    </Container>
  );
};

export default SplashScreen;
