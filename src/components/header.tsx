import React from 'react';

import {TouchableOpacity, View} from 'react-native';

import {Icons} from '@app/assets/icons';
import {Text, useTheme} from '@app/themes';
import {Navigation} from '@router/navigation-helper';

import {STATUSBAR_HEIGHT} from './container';

interface HeaderProps {
  title: string;
  rightComponent?: React.ReactNode;
}

export const Header = React.memo((props: HeaderProps) => {
  const {title, rightComponent} = props;
  const {colors, spacing} = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: STATUSBAR_HEIGHT + spacing.xs,
      }}
    >
      <TouchableOpacity
        style={{
          padding: spacing.xs,
        }}
        onPress={() => Navigation.back()}
      >
        <Icons.Feather name="chevron-left" size={24} color={colors.grey_dark} />
      </TouchableOpacity>
      <View style={{flex: 1}}>
        <Text numberOfLines={1} variant={'h_5_medium'} marginHorizontal={'xs'}>
          {title}
        </Text>
      </View>
      {rightComponent ? rightComponent : <View style={{width: spacing.xs * 2 + 24}} />}
    </View>
  );
});
