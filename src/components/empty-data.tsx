import React from 'react';

import {Text, View} from 'react-native';

import {useTranslation} from 'react-i18next';

import {Icons} from '@app/assets/icons';
import {useTheme} from '@app/themes';

export const EmptyData = React.memo(({text}: {text?: string}) => {
  const {colors, spacing, textVariants} = useTheme();
  const {t} = useTranslation();
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', marginVertical: spacing.md, flex: 1}}>
      <Icons.Feather name="x-circle" color={colors.grey} size={56} />
      <Text style={{...textVariants.body_regular, marginTop: spacing.xs, color: colors.black}}>
        {text ? text : t('no_data_found')}
      </Text>
    </View>
  );
});
