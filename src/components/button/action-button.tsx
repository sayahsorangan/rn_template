import React from 'react';

import {TouchableOpacity} from 'react-native';

import {Icons} from '@app/assets/icons';
import {Text, theme, useTheme} from '@app/themes';

interface ActionButtonProps {
  label?: string;
  icon_name?: string;
  onPress?: () => void;
  bg_color?: keyof typeof theme.colors;
  label_n_icon_color?: keyof typeof theme.colors;
}

export const ActionButton = React.memo((props: ActionButtonProps): JSX.Element => {
  const {spacing, colors, borderRadii} = useTheme();
  const {label, icon_name, onPress, label_n_icon_color, bg_color} = props;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: spacing.m,
        backgroundColor: colors[bg_color || 'primary_lighter'],
        borderRadius: borderRadii.sm,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Text style={{flex: 1}} color={label_n_icon_color || 'primary'}>
        {label}
      </Text>
      <Icons.Feather size={24} name={icon_name} color={colors[label_n_icon_color || 'primary']} />
    </TouchableOpacity>
  );
});
