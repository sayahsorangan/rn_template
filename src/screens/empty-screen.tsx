import React from 'react';

import {useTheme} from '@app/themes';
import {Container} from '@components/container';
import {UnderDev} from '@components/under-dev';

const EmptyScreen: React.FC = () => {
  const {colors} = useTheme();

  return (
    <Container backgroundColor={colors.white} translucent>
      <UnderDev />
    </Container>
  );
};

export {EmptyScreen};
