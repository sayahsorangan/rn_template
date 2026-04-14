import React from 'react';

import {Text, View} from 'react-native';

import {Icons} from '@app/assets/icons';
import {theme} from '@app/themes';

export const EmptyData = React.memo(({text}: {text?: string}) => {
  return (
    <View style={{justifyContent: 'center', alignItems: 'center', marginVertical: theme.spacing.md, flex: 1}}>
      <Icons.Feather name="x-circle" color={theme.colors.grey} size={56} />
      <Text style={{...theme.textVariants.body_regular, marginTop: theme.spacing.xs, color: theme.colors.black}}>
        {text ? text : 'No Data Found'}
      </Text>
    </View>
  );
});
