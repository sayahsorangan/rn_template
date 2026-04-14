import React from 'react';

import {TouchableOpacity} from 'react-native';

import {Icons} from '@app/assets/icons';
import {useTheme} from '@app/themes';

interface CheckBoxProps {
  onPress?: (value: boolean) => void;
  value: boolean;
}

export const CheckBox = React.memo(({onPress, value}: CheckBoxProps) => {
  const {colors, spacing} = useTheme();

  return (
    <TouchableOpacity
      onPress={() => (onPress ? onPress(!value) : undefined)}
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        width: 24,
        height: 24,
        borderRadius: spacing.xs,
        borderWidth: 1.5,
        borderColor: colors.primary,
        backgroundColor: value ? colors.primary : undefined,
      }}
    >
      {value && <Icons.Feather name="check" color={colors.white} size={16} />}
    </TouchableOpacity>
  );
});
