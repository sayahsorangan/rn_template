import React from 'react';

import {Box, Text, theme} from '@app/themes';

interface AvatarProps {
  text?: string;
  size: number;
}

export const Avatar = React.memo((props: AvatarProps): JSX.Element => {
  const {text, size = 48} = props;

  return (
    <Box
      style={{
        borderRadius: size,
        width: size,
        height: size,
        backgroundColor: theme.colors.primary_light,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text fontSize={24 * (size / 48)} marginTop={'xs'} color={'primary'}>
        {text ? text[0]?.toUpperCase() : 'X'}
      </Text>
    </Box>
  );
});
