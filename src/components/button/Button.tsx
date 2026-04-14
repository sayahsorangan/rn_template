import React from 'react';

import {ActivityIndicator, StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle} from 'react-native';

import {useTheme} from '@app/themes';

interface ButtonProps {
  children?: React.ReactNode;
  label?: string;
  onPress?: () => void;
  ButtonStyle?: StyleProp<ViewStyle>;
  LabelStyle?: StyleProp<TextStyle>;
  secondary?: boolean;
  disabled?: boolean;
  rightItem?: React.ReactNode;
  loading?: boolean;
}

export const Button = React.memo((props: ButtonProps) => {
  const {colors, borderRadii, textVariants} = useTheme();
  const {
    onPress,
    ButtonStyle,
    label = 'Test',
    secondary = false,
    disabled = false,
    LabelStyle,
    rightItem,
    children,
    loading,
  } = props;

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        {
          backgroundColor: disabled ? colors.grey : secondary ? colors.white : colors.primary_dark,
          borderRadius: borderRadii.xs,
          height: 48,
          borderWidth: disabled ? 0 : 1,
          borderColor: colors.primary_dark,
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          maxHeight: 56,
        },
        ButtonStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size={'small'} />
      ) : children ? (
        children
      ) : (
        <>
          <Text
            style={[
              {
                ...textVariants.button_m_bold,
                color: disabled ? colors.grey_light : secondary ? colors.primary : colors.white,
              },
              LabelStyle,
            ]}
          >
            {label}
          </Text>
          {rightItem ?? rightItem}
        </>
      )}
    </TouchableOpacity>
  );
});
