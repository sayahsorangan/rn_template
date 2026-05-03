import React, {useCallback} from 'react';

import {Alert, FlatList, TouchableOpacity} from 'react-native';

import {TAB_HEIGHT} from '@app/constan/dimensions';
import {Box, Text, useTheme} from '@app/themes';
import {IconButton} from '@components/button/icon-button';
import {Container} from '@components/container';
import {useEnsureEmbedModel, useIngest, useRagDocuments} from '@lib/rag/hooks';
import {Navigation} from '@router/navigation-helper';
import {Route} from '@router/route-name';

/* ─── Main Screen ────────────────────────────────────────────────────────────*/
const KnowledgeScreen: React.FC = () => {
  const theme = useTheme();
  const {documents, getChunkCount} = useRagDocuments();
  const {removeDocument} = useIngest();
  const {status: embedStatus, downloadProgress} = useEnsureEmbedModel();

  const handleDelete = useCallback(
    (docId: string, docName: string) => {
      Alert.alert('Remove document', `Remove "${docName}" from knowledge base?`, [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Remove', style: 'destructive', onPress: () => removeDocument(docId)},
      ]);
    },
    [removeDocument],
  );

  const isEmbedReady = embedStatus === 'ready';
  const isEmbedBusy = embedStatus === 'downloading' || embedStatus === 'loading';

  return (
    <Container>
      <Text variant="h_5_semibold" paddingHorizontal="md" paddingTop="md">
        AI Knowledge
      </Text>
      {/* Embed model status banner */}
      {!isEmbedReady ? (
        <Box
          marginHorizontal="md"
          marginBottom="sm"
          padding="md"
          borderRadius="md"
          backgroundColor={embedStatus === 'error' ? 'danger_light' : 'primary_light'}
        >
          {isEmbedBusy ? (
            <>
              <Text variant="body_helper_semibold" color="primary_dark" marginBottom="xxs">
                {embedStatus === 'downloading' ? `Downloading AI model… ${downloadProgress}%` : 'Loading AI model…'}
              </Text>
              <Box height={4} borderRadius="round" backgroundColor="white" overflow="hidden">
                <Box
                  height={4}
                  borderRadius="round"
                  backgroundColor="primary"
                  style={{width: `${downloadProgress}%`}}
                />
              </Box>
            </>
          ) : embedStatus === 'error' ? (
            <Text variant="body_helper_regular" color="danger">
              AI model failed to load. Try adding a document to retry.
            </Text>
          ) : (
            <Text variant="body_helper_regular" color="primary_dark">
              AI model not yet loaded. Add a document to initialise.
            </Text>
          )}
        </Box>
      ) : null}

      <FlatList
        data={documents}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          padding: theme.spacing.md,
          paddingBottom: theme.spacing.xl,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <Box flex={1} alignItems="center" justifyContent="center" paddingTop="xxl">
            <Text variant="h_5_medium" color="grey" textAlign="center">
              No knowledge yet
            </Text>
            <Text variant="body_helper_regular" color="grey" textAlign="center" marginTop="xs">
              Tap "+ Add" to add text or a .txt file.
            </Text>
          </Box>
        }
        renderItem={({item}) => (
          <Box
            borderRadius="md"
            borderWidth={1}
            style={{borderColor: theme.colors.grey_light}}
            padding="md"
            marginBottom="sm"
            backgroundColor="white"
          >
            <Box flexDirection="row" alignItems="flex-start" justifyContent="space-between">
              <Box flex={1} marginRight="sm">
                <Text variant="body_semibold" numberOfLines={2}>
                  {item.name}
                </Text>
                <Text variant="body_helper_regular" color="grey" marginTop="xxs">
                  {getChunkCount(item.id)} chunk{getChunkCount(item.id) !== 1 ? 's' : ''} ·{' '}
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text variant="body_helper_regular" color="grey" numberOfLines={2} marginTop="xxs">
                  {item.text.slice(0, 100)}
                  {item.text.length > 100 ? '…' : ''}
                </Text>
              </Box>
              <TouchableOpacity
                onPress={() => handleDelete(item.id, item.name)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              >
                <Text variant="body_helper_semibold" color="danger">
                  Remove
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        )}
      />
      <Box position={'absolute'} right={theme.spacing.md} bottom={TAB_HEIGHT + theme.spacing.xl}>
        <IconButton
          onPress={() => Navigation.navigate(Route.addKnowledge)}
          icon_name="plus"
          icon_color={theme.colors.white}
          style={{
            backgroundColor: theme.colors.primary,
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadii.round,
          }}
        />
      </Box>
    </Container>
  );
};

export default KnowledgeScreen;
