import React from 'react';

import {
  StyleProp,
  TextInput as TIRN,
  TextInputProps as TIP,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {Icons} from '@app/assets/icons';
import {Text, theme} from '@app/themes';

interface TextInputProps extends TIP {
  value?: string;
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  TextInputStyle?: StyleProp<TextStyle>;
  onChangeText?: any;
  placeholder?: string;
  onRightIconPress?: () => void;
  iconLeftName?: string;
  iconRightName?: string;
}

export const TextInput = React.memo((props: TextInputProps): JSX.Element => {
  const {colors, textVariants, spacing} = theme;
  const {
    TextInputStyle,
    containerStyle,
    label,
    value,
    placeholderTextColor = colors.grey,
    onChangeText,
    placeholder,
    iconLeftName,
    iconRightName,
    onRightIconPress,
    ...other
  } = props;

  return (
    <>
      {!!label && (
        <Text
          style={{
            ...textVariants.body_helper_medium,
            color: colors.black,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          {
            paddingHorizontal: spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
          },
          containerStyle,
        ]}
      >
        <View style={{flex: 1, alignItems: 'center', marginHorizontal: spacing.xs, flexDirection: 'row'}}>
          {iconLeftName && (
            <View style={{marginRight: spacing.xs}}>
              <Icons.Feather name={iconLeftName} size={24} color={colors.grey} />
            </View>
          )}
          <View style={{flex: 1}}>
            <TIRN
              value={value}
              style={[
                {
                  ...textVariants.body_medium,
                  color: colors.black,
                  padding: 0,
                },
                TextInputStyle,
              ]}
              placeholderTextColor={placeholderTextColor}
              placeholder={placeholder || label}
              onChangeText={v => {
                onChangeText && onChangeText(v);
              }}
              {...other}
            />
          </View>
          {iconRightName && (
            <TouchableOpacity onPress={onRightIconPress} style={{paddingLeft: spacing.xs, height: '100%'}}>
              <Icons.Feather name={iconRightName} size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
});
