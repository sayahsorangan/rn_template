import React from 'react';

import {Image, Text, View} from 'react-native';

import {useTranslation} from 'react-i18next';

import {Images} from '@app/assets/images';
import {useTheme} from '@app/themes';

export const UnderDev = React.memo(() => {
  const {colors, spacing, textVariants} = useTheme();
  const {t} = useTranslation();
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', marginVertical: spacing.md, flex: 1}}>
      <Image source={Images.under_dev} style={{resizeMode: 'contain', height: '40%'}} />
      <Text style={{...textVariants.h_4_medium, marginTop: spacing.xs, color: colors.black}}>
        {t('under_development')}
      </Text>
    </View>
  );
});
