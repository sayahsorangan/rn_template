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
import {useTheme} from '@app/themes';

interface SearchInputProps extends TIP {
  value?: string;
  containerStyle?: StyleProp<ViewStyle>;
  TextInputStyle?: StyleProp<TextStyle>;
  onChangeText?: any;
  placeholder?: string;
  onRightIconPress?: () => void;
  iconRightName?: string;
}

export const SearchInput = React.memo((props: SearchInputProps) => {
  const {colors, textVariants, spacing, borderRadii} = useTheme();
  const {
    TextInputStyle,
    containerStyle,
    value,
    placeholderTextColor = colors.grey,
    onChangeText,
    placeholder,
    iconRightName = 'search',
    onRightIconPress,
    ...other
  } = props;

  return (
    <View
      style={[
        {
          height: 48,
          paddingHorizontal: spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.white,
          borderRadius: borderRadii.sm,
        },
        containerStyle,
      ]}
    >
      <View style={{flex: 1, alignItems: 'center', marginHorizontal: spacing.xs, flexDirection: 'row'}}>
        <TIRN
          value={value}
          style={[
            {
              ...textVariants.body_medium,
              color: colors.grey_dark,
              padding: 0,
              flex: 1,
            },
            TextInputStyle,
          ]}
          placeholderTextColor={placeholderTextColor}
          placeholder={placeholder}
          onChangeText={onChangeText}
          {...other}
        />
        {iconRightName && (
          <TouchableOpacity onPress={onRightIconPress} style={{paddingLeft: spacing.xs, height: '100%'}}>
            <Icons.Feather name={iconRightName} size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});
