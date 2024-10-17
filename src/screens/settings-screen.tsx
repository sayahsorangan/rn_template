import React from 'react';

import {ScrollView} from 'react-native';

import {Box, useTheme} from '@app/themes';
import {Button} from '@components/button';
import {Container} from '@components/container';
import {Divider} from '@components/divider';
import {TextInput} from '@components/inputs';

const SettingsScreen: React.FC = () => {
  const {colors, spacing} = useTheme();

  return (
    <Container backgroundColor={colors.white}>
      <ScrollView contentContainerStyle={{padding: spacing.md}}>
        <TextInput label="Server IP" />
        <Divider vertical="md" />
        <TextInput label="Port" />
        <Divider vertical="md" />
        <TextInput label="User Name" />
        <Divider vertical="md" />
        <TextInput label="Password" />
      </ScrollView>
      <Box padding={'md'}>
        <Button label="Save" ButtonStyle={{flex: undefined}} />
      </Box>
    </Container>
  );
};

export {SettingsScreen};
