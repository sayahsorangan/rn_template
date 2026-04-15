import React from 'react';

import {Box, Text, useTheme} from '@app/themes';

interface AvatarProps {
  text?: string;
  size: number;
}

export const Avatar = React.memo((props: AvatarProps) => {
  const {text, size = 48} = props;
  const {colors} = useTheme();

  return (
    <Box
      style={{
        borderRadius: size,
        width: size,
        height: size,
        backgroundColor: colors.primary_light,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text fontSize={24 * (size / 48)} color={'primary'}>
        {text ? text[0]?.toUpperCase() : 'X'}
      </Text>
    </Box>
  );
});
