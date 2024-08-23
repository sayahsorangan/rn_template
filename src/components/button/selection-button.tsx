import React from 'react';

import {StyleProp, Text, TouchableOpacity, View, ViewStyle} from 'react-native';

import {Icons} from '@app/assets/icons';
import {theme} from '@app/themes';

interface SelectionButtonProps {
  onPress?: () => void;
  is_active: boolean;
  label: any;
  disabled?: boolean;
  ButtonStyle?: StyleProp<ViewStyle>;
}

export const SelectionButton = React.memo((props: SelectionButtonProps): JSX.Element => {
  const {colors, spacing, textVariants, borderRadii} = theme;
  const {onPress, is_active, label, disabled = false, ButtonStyle} = props;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          paddingVertical: spacing.xs,
          paddingLeft: spacing.m,
          paddingRight: spacing.l,
          borderRadius: borderRadii.l,
          backgroundColor: is_active ? colors.primary : colors.grey_lighter,
          borderWidth: 1,
          borderColor: is_active ? colors.primary : colors.grey_lighter,
          alignSelf: 'flex-start',
          alignItems: 'center',
          flexDirection: 'row',
        },
        ButtonStyle,
      ]}
    >
      <View>
        <Text style={{...textVariants.body_1_bold, marginRight: spacing.s}} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <View style={{position: 'absolute', right: 16}}>
        <Icons.Feather size={20} name="check" color={is_active ? colors.white : colors.grey_lighter} />
      </View>
    </TouchableOpacity>
  );
});
