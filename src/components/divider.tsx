import React from 'react';

import {View} from 'react-native';

import {theme} from '@app/themes';

interface DividerProps {
  horizontal?: keyof typeof theme.spacing;
  vertical?: keyof typeof theme.spacing;
}

export const Divider = React.memo((props: DividerProps) => {
  const {horizontal, vertical} = props;

  return (
    <View
      style={{
        marginTop: vertical ? theme.spacing[vertical] : 0,
        marginRight: horizontal ? theme.spacing[horizontal] : 0,
      }}
    />
  );
});
