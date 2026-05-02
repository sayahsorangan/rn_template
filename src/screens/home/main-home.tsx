import React from 'react';

import {useTranslation} from 'react-i18next';

import {Text} from '@app/themes';
import {Container} from '@components/container';

const MainHomeScreen: React.FC = () => {
  const {t} = useTranslation();

  return (
    <Container translucent>
      <Text variant={'h_3_bold'} marginBottom={'md'}>
        {t('home.welcomeBack')}
      </Text>
    </Container>
  );
};

export {MainHomeScreen};
