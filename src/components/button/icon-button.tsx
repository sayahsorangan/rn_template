import React from 'react';

import {ActivityIndicator, StyleProp, TextStyle, TouchableOpacity, ViewProps, ViewStyle} from 'react-native';

import {Icons} from '@app/assets/icons';
import {Box, Text, theme} from '@app/themes';

interface IconButtonProps extends ViewProps {
  onPress?: () => void;
  onIconPress?: () => void;
  icon_name?: string;
  icon_size?: number;
  ButtonStyle?: StyleProp<ViewStyle>;
  LabelStyle?: StyleProp<TextStyle>;
  icon_color?: string;
  label?: string;
  disabled?: boolean;
  left_icon?: boolean;
  center?: boolean;
  loading?: boolean;
}

export const IconButton = React.memo((props: IconButtonProps) => {
  const {colors, spacing, textVariants} = theme;
  const {
    onPress,
    icon_name = 'x',
    icon_size = 24,
    ButtonStyle,
    icon_color = colors.black,
    label,
    LabelStyle,
    disabled = false,
    left_icon = true,
    center = false,
    loading = false,
    onIconPress,
    ...other
  } = props;

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        {
          borderRadius: spacing.xl,
          backgroundColor: colors.white,
          padding: spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: loading ? 'center' : undefined,
        },
        ButtonStyle,
      ]}
      {...other}
    >
      {loading ? (
        <ActivityIndicator size={'small'} color={colors.white} />
      ) : (
        <>
          {left_icon ? (
            <TouchableOpacity disabled={!!!onIconPress} onPress={onIconPress}>
              <Icons.Feather name={icon_name} color={icon_color} size={icon_size} />
            </TouchableOpacity>
          ) : (
            center && <Box style={{width: icon_size + spacing.xs}} />
          )}
          {!!label && (
            <Text
              style={[
                {
                  ...textVariants.button_m_medium,
                  marginLeft: left_icon ? spacing.xs : 0,
                  marginRight: left_icon ? 0 : spacing.xs,
                },
                LabelStyle,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          )}
          {!left_icon ? (
            <TouchableOpacity disabled={!!!onIconPress} onPress={onIconPress}>
              <Icons.Feather name={icon_name} color={icon_color} size={icon_size} />
            </TouchableOpacity>
          ) : (
            center && <Box style={{width: icon_size + spacing.xs}} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
});
