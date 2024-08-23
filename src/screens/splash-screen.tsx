import React from 'react';

import {Image, View} from 'react-native';

import {Images} from '@app/assets/images';
import {SCREEN_WIDTH} from '@app/constan/dimensions';
import {theme} from '@app/themes';
import {Container} from '@components/container';

const SplashScreen = () => {
  return (
    <Container translucent whithImageBg={1} backgroundColor={theme.colors.white}>
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Image source={Images.logo} style={{width: SCREEN_WIDTH / 2, height: SCREEN_WIDTH / 2}} />
      </View>
    </Container>
  );
};

export default SplashScreen;
