import React from 'react';

import {View} from 'react-native';

import {useTheme} from '@app/themes';

interface DividerProps {
  horizontal?: string;
  vertical?: string;
}

export const Divider = React.memo((props: DividerProps) => {
  const {horizontal, vertical} = props;
  const {spacing} = useTheme();

  return (
    <View
      style={{
        marginTop: vertical ? spacing[vertical] : 0,
        marginRight: horizontal ? spacing[horizontal] : 0,
      }}
    />
  );
});
