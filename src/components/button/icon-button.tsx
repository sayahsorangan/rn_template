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

export const IconButton = React.memo((props: IconButtonProps): JSX.Element => {
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
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          borderRadius: spacing.xl,
          backgroundColor: colors.white,
          padding: spacing.s,
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
            center && <Box style={{width: icon_size + spacing.s}} />
          )}
          {!!label && (
            <Text
              style={[
                {
                  ...textVariants.body_2_semibold,
                  marginLeft: left_icon ? spacing.s : 0,
                  marginRight: left_icon ? 0 : spacing.s,
                },
                LabelStyle,
              ]}
            >
              {label}
            </Text>
          )}
          {!left_icon ? (
            <TouchableOpacity disabled={!!!onIconPress} onPress={onIconPress}>
              <Icons.Feather name={icon_name} color={icon_color} size={icon_size} />
            </TouchableOpacity>
          ) : (
            center && <Box style={{width: icon_size + spacing.s}} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
});
