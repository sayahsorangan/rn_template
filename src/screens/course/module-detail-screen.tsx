import React from 'react';

import {ScrollView, StyleSheet} from 'react-native';

import {useRoute} from '@react-navigation/native';
import Markdown from 'react-native-markdown-display';

import {Box, useTheme} from '@app/themes';
import {Container} from '@components/container';
import {Header} from '@components/header';

const ModuleDetailScreen = () => {
  const route = useRoute<UseRoute<'moduleDetail'>>();
  const {module} = route.params;
  const theme = useTheme();

  const markdownStyles = StyleSheet.create({
    body: {
      color: theme.colors.black,
      fontSize: 15,
      lineHeight: 24,
    },
    heading1: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.black,
      marginVertical: 8,
    },
    heading2: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.black,
      marginVertical: 6,
    },
    heading3: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.black,
      marginVertical: 4,
    },
    paragraph: {
      marginVertical: 4,
    },
    code_inline: {
      backgroundColor: theme.colors.grey_light,
      color: theme.colors.primary_dark,
      paddingHorizontal: 4,
      borderRadius: 4,
      fontSize: 13,
    },
    fence: {
      backgroundColor: theme.colors.grey_light,
      padding: 12,
      borderRadius: 8,
      fontSize: 13,
    },
    blockquote: {
      backgroundColor: theme.colors.grey_light,
      borderLeftColor: theme.colors.primary,
      borderLeftWidth: 4,
      paddingLeft: 12,
      paddingVertical: 4,
      marginVertical: 8,
    },
    list_item: {
      marginVertical: 2,
    },
    bullet_list_icon: {
      color: theme.colors.primary,
    },
    ordered_list_icon: {
      color: theme.colors.primary,
    },
  });

  return (
    <Container translucent>
      <Header title={module.title} />
      <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 40}}>
        <Box flex={1}>
          <Markdown style={markdownStyles}>{module.content}</Markdown>
        </Box>
      </ScrollView>
    </Container>
  );
};

export default ModuleDetailScreen;
