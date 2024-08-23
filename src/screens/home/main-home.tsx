import React from 'react';

import {ScrollView} from 'react-native';

import {Container} from '@components/container';

const MainHomeScreen: React.FC = () => {
  return (
    <Container whithImageBg={1}>
      <ScrollView />
    </Container>
  );
};

export {MainHomeScreen};
