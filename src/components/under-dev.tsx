import React from 'react';

import {Image, Text, View} from 'react-native';

import {Images} from '@app/assets/images';
import {theme} from '@app/themes';

export const UnderDev = React.memo(() => {
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', marginVertical: theme.spacing.md, flex: 1}}>
      <Image source={Images.under_dev} style={{resizeMode: 'contain', height: '40%'}} />
      <Text style={{...theme.textVariants.h_4_medium, marginTop: theme.spacing.xs, color: theme.colors.black}}>
        Under Development
      </Text>
    </View>
  );
});
