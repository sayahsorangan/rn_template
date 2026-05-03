import React, {useCallback, useState} from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
} from 'react-native';

import DocumentPicker from 'react-native-document-picker';

import {Box, Text, useTheme} from '@app/themes';
import {Button} from '@components/button/Button';
import {Container} from '@components/container';
import {useIngest} from '@lib/rag/hooks';
import {Navigation} from '@router/navigation-helper';

type AddMode = 'text' | 'file';

const AddKnowledgeScreen: React.FC = () => {
  const theme = useTheme();
  const {ingestText, ingestFile, ingesting, ingestProgress, error} = useIngest();

  const [addMode, setAddMode] = useState<AddMode>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pickedFileName, setPickedFileName] = useState<string | null>(null);
  const [pickedFilePath, setPickedFilePath] = useState<string | null>(null);

  const handlePickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.plainText],
        copyTo: 'cachesDirectory',
      });
      const uri = result.fileCopyUri ?? result.uri;
      // Strip file:// prefix for RNFS compatibility on iOS; Android content URIs are handled by RNFS
      const path = Platform.OS === 'ios' ? decodeURIComponent(uri.replace(/^file:\/\//, '')) : uri;
      setPickedFilePath(path);
      setPickedFileName(result.name ?? 'document.txt');
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        Alert.alert('Error', 'Could not open the file picker.');
      }
    }
  }, []);

  const handleAdd = useCallback(async () => {
    if (addMode === 'text') {
      if (!title.trim() || !content.trim()) {
        Alert.alert('Missing fields', 'Please enter both a title and content.');
        return;
      }
      await ingestText(title.trim(), content.trim());
    } else {
      if (!pickedFilePath) {
        Alert.alert('No file selected', 'Please pick a .txt file first.');
        return;
      }
      await ingestFile(pickedFilePath);
    }

    if (!error) {
      Navigation.back();
    }
  }, [addMode, title, content, pickedFilePath, ingestText, ingestFile, error]);

  return (
    <Container translucent>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{flexGrow: 1, padding: theme.spacing.md}}
        >
          {/* Mode tabs */}
          <Box
            flexDirection="row"
            marginBottom="md"
            height={42}
            borderRadius="sm"
            backgroundColor="grey_light"
            padding="xxs"
          >
            {(['text', 'file'] as AddMode[]).map(mode => (
              <TouchableOpacity key={mode} onPress={() => setAddMode(mode)} style={{flex: 1}}>
                <Box
                  flex={1}
                  borderRadius="xs"
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={addMode === mode ? 'white' : undefined}
                >
                  <Text variant="body_helper_semibold" color={addMode === mode ? 'black' : 'grey'}>
                    {mode === 'text' ? 'Write Text' : 'From File (.txt)'}
                  </Text>
                </Box>
              </TouchableOpacity>
            ))}
          </Box>

          {addMode === 'text' ? (
            <>
              <Text variant="body_helper_semibold" marginBottom="xxs">
                Title
              </Text>
              <Box
                borderRadius="md"
                borderWidth={1}
                style={{borderColor: theme.colors.grey_light}}
                paddingHorizontal="md"
                paddingVertical="xs"
                marginBottom="md"
              >
                <RNTextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Document title"
                  placeholderTextColor={theme.colors.grey}
                  style={{color: theme.colors.black, fontSize: 14}}
                />
              </Box>

              <Text variant="body_helper_semibold" marginBottom="xxs">
                Content
              </Text>
              <Box
                borderRadius="md"
                borderWidth={1}
                style={{borderColor: theme.colors.grey_light}}
                paddingHorizontal="md"
                paddingVertical="xs"
                marginBottom="md"
                minHeight={180}
              >
                <RNTextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Paste or type the text you want the AI to know about…"
                  placeholderTextColor={theme.colors.grey}
                  multiline
                  style={{
                    color: theme.colors.black,
                    fontSize: 14,
                    lineHeight: 20,
                    minHeight: 160,
                    textAlignVertical: 'top',
                  }}
                />
              </Box>
            </>
          ) : (
            <>
              <Text variant="body_helper_semibold" marginBottom="xxs">
                Select a .txt file
              </Text>
              <Text variant="body_helper_regular" color="grey" marginBottom="sm">
                Tap the button below to pick a plain text file from your device.
              </Text>

              <TouchableOpacity onPress={handlePickFile} disabled={ingesting}>
                <Box
                  borderRadius="md"
                  borderWidth={1}
                  borderStyle="dashed"
                  style={{borderColor: pickedFileName ? theme.colors.primary : theme.colors.grey_light}}
                  padding="lg"
                  alignItems="center"
                  justifyContent="center"
                  marginBottom="md"
                  backgroundColor={pickedFileName ? 'primary_light' : undefined}
                >
                  {pickedFileName ? (
                    <>
                      <Text variant="body_semibold" color="primary" textAlign="center">
                        {pickedFileName}
                      </Text>
                      <Text variant="body_helper_regular" color="grey" marginTop="xxs">
                        Tap to change
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text variant="body_semibold" color="grey" textAlign="center">
                        Tap to pick a file
                      </Text>
                      <Text variant="body_helper_regular" color="grey" marginTop="xxs">
                        .txt files only
                      </Text>
                    </>
                  )}
                </Box>
              </TouchableOpacity>
            </>
          )}

          {ingesting ? (
            <Box marginBottom="md">
              <Box height={6} borderRadius="round" backgroundColor="grey_light" overflow="hidden" marginBottom="xxs">
                <Box height={6} borderRadius="round" backgroundColor="primary" style={{width: `${ingestProgress}%`}} />
              </Box>
              <Text variant="body_helper_regular" color="grey" textAlign="center">
                Processing… {ingestProgress}%
              </Text>
            </Box>
          ) : null}

          {error ? (
            <Box borderRadius="md" backgroundColor="danger_light" padding="sm" marginBottom="md">
              <Text variant="body_helper_regular" color="danger">
                {error}
              </Text>
            </Box>
          ) : null}

          <Button
            label={ingesting ? 'Processing…' : 'Add to Knowledge Base'}
            onPress={handleAdd}
            loading={ingesting}
            disabled={ingesting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};

export default AddKnowledgeScreen;
