import React from 'react';

import {TouchableOpacity, View} from 'react-native';

import {Icons} from '@app/assets/icons';
import {Text, theme} from '@app/themes';
import {Navigation} from '@router/navigation-helper';

import {STATUSBAR_HEIGHT} from './container';

interface HeaderProps {
  title: string;
  rightComponent?: React.ReactNode;
}

export const Header = React.memo((props: HeaderProps): JSX.Element => {
  const {title, rightComponent} = props;

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: theme.spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: STATUSBAR_HEIGHT + theme.spacing.xs,
      }}
    >
      <TouchableOpacity
        style={{
          padding: theme.spacing.xs,
        }}
        onPress={() => Navigation.back()}
      >
        <Icons.Feather name="chevron-left" size={32} color={theme.colors.grey_dark} />
      </TouchableOpacity>
      <Text numberOfLines={1} variant={'h_4_medium'} marginHorizontal={'xs'}>
        {title}
      </Text>

      {rightComponent ? rightComponent : <View style={{width: theme.spacing.xs * 2 + 24}} />}
    </View>
  );
});
