import React, {useCallback, useState} from 'react';

import {ActivityIndicator, Alert, ScrollView, TouchableOpacity} from 'react-native';

import {onLogout} from '@app/helpers/auth';
import {useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {Avatar} from '@components/avatar';
import {Container} from '@components/container';
import {Modal} from '@components/modal';
import {ModelPickerSheet} from '@components/model-picker-sheet';
import {useChat, useLoadModel} from '@lib/llm/hooks';

const LANGUAGES = [
  {label: 'Auto (follow prompt)', value: 'auto'},
  {label: 'English', value: 'English'},
  {label: 'Indonesian', value: 'Indonesian'},
  {label: 'Arabic', value: 'Arabic'},
  {label: 'Chinese', value: 'Chinese'},
  {label: 'Japanese', value: 'Japanese'},
  {label: 'Korean', value: 'Korean'},
  {label: 'Spanish', value: 'Spanish'},
  {label: 'French', value: 'French'},
  {label: 'German', value: 'German'},
];

const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const user = useAppSelector(state => state.UserReducer.user);
  const {language, setLanguage, isModelLoaded, isGenerating} = useChat();
  const {loadModel, unloadModel, modelPath, progress} = useLoadModel();

  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleSelectModel = useCallback(
    async (path: string) => {
      if (isGenerating) {
        Alert.alert('Cannot Change Model', 'Please wait for the current response to finish generating.');
        return;
      }
      setShowModelPicker(false);
      await loadModel({modelPath: path, nGpuLayers: -1, contextSize: 2048});
    },
    [loadModel, isGenerating],
  );

  const handleLogout = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Sign Out', style: 'destructive', onPress: onLogout},
    ]);
  }, []);

  const displayName = user?.fullName ?? user?.email ?? 'User';
  const initials = displayName.charAt(0).toUpperCase();
  const selectedLang = LANGUAGES.find(l => l.value === language)?.label ?? 'Auto';

  return (
    <Container>
      <ScrollView contentContainerStyle={{paddingBottom: theme.spacing.xxl}}>
        {/* Avatar + name */}
        <Box alignItems="center" paddingTop="xl" paddingBottom="lg">
          <Avatar text={initials} size={72} />
          <Text variant="h_4_semibold" marginTop="md">
            {user?.fullName ?? 'No Name'}
          </Text>
          <Text variant="body_helper_regular" color="grey" marginTop="xxs">
            {user?.email}
          </Text>
        </Box>

        {/* Settings section */}
        <Box marginHorizontal="md">
          <Text variant="body_helper_semibold" color="grey" marginBottom="xs" marginLeft="xs">
            AI SETTINGS
          </Text>
          <Box backgroundColor="white" borderRadius="md" overflow="hidden">
            {/* Model */}
            <TouchableOpacity
              onPress={() => {
                if (isGenerating) {
                  Alert.alert('Cannot Change Model', 'Please wait for the current response to finish generating.');
                } else {
                  setShowModelPicker(true);
                }
              }}
              disabled={progress > 0 && progress < 100}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                paddingHorizontal="md"
                paddingVertical="sm"
                borderBottomWidth={1}
                style={{borderBottomColor: theme.colors.grey_light}}
              >
                <Box flex={1}>
                  <Text variant="body_regular">AI Model</Text>
                  {progress > 0 && progress < 100 ? (
                    <Box flexDirection="row" alignItems="center" marginTop="xs">
                      <ActivityIndicator size="small" color={theme.colors.primary} />
                      <Text variant="body_helper_regular" color="primary" marginLeft="sm">
                        Loading… {progress}%
                      </Text>
                    </Box>
                  ) : isModelLoaded && modelPath ? (
                    <Text variant="body_helper_regular" color="primary" numberOfLines={1}>
                      {modelPath.split('/').pop()}
                    </Text>
                  ) : (
                    <Text variant="body_helper_regular" color="grey">
                      No model selected
                    </Text>
                  )}
                </Box>
                {!(progress > 0 && progress < 100) && (
                  <Text variant="body_helper_semibold" color="primary">
                    {isModelLoaded ? 'Change' : 'Select'}
                  </Text>
                )}
              </Box>
            </TouchableOpacity>

            {/* Unload model */}
            {isModelLoaded ? (
              <TouchableOpacity
                onPress={() => {
                  if (isGenerating) {
                    Alert.alert('Cannot Unload Model', 'Please wait for the current response to finish generating.');
                  } else {
                    unloadModel();
                  }
                }}
                disabled={isGenerating}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  paddingHorizontal="md"
                  paddingVertical="sm"
                  borderBottomWidth={1}
                  style={{borderBottomColor: theme.colors.grey_light}}
                >
                  <Text variant="body_regular">Unload Model</Text>
                  <Text variant="body_helper_semibold" color={isGenerating ? 'grey' : 'danger'}>
                    Unload
                  </Text>
                </Box>
              </TouchableOpacity>
            ) : null}

            {/* Language */}
            <TouchableOpacity onPress={() => setShowLangPicker(true)}>
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                paddingHorizontal="md"
                paddingVertical="sm"
              >
                <Text variant="body_regular">Response Language</Text>
                <Text variant="body_helper_semibold" color="primary">
                  {selectedLang}
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>

          {/* Account section */}
          <Text variant="body_helper_semibold" color="grey" marginBottom="xs" marginLeft="xs" marginTop="lg">
            ACCOUNT
          </Text>
          <Box backgroundColor="white" borderRadius="md" overflow="hidden">
            <TouchableOpacity onPress={handleLogout}>
              <Box paddingHorizontal="md" paddingVertical="sm">
                <Text variant="body_regular" color="danger">
                  Sign Out
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>
      </ScrollView>

      <ModelPickerSheet
        visible={showModelPicker}
        onClose={() => setShowModelPicker(false)}
        onSelectModel={handleSelectModel}
      />

      <Modal
        show={showLangPicker}
        onDissmiss={() => setShowLangPicker(false)}
        animationType="slide"
        style={{justifyContent: 'flex-end', alignItems: 'stretch'}}
      >
        <Box backgroundColor="white" borderTopLeftRadius="xl" borderTopRightRadius="xl" paddingBottom="xl">
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            paddingHorizontal="md"
            paddingVertical="md"
            borderBottomWidth={1}
            style={{borderBottomColor: theme.colors.grey_light}}
          >
            <Text variant="h_5_semibold">Response Language</Text>
            <TouchableOpacity onPress={() => setShowLangPicker(false)} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text variant="body_regular" color="primary">
                Done
              </Text>
            </TouchableOpacity>
          </Box>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.value}
              onPress={() => {
                setLanguage(lang.value);
                setShowLangPicker(false);
              }}
            >
              <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                paddingHorizontal="md"
                paddingVertical="sm"
                borderBottomWidth={1}
                style={{borderBottomColor: theme.colors.grey_light}}
              >
                <Text variant="body_regular">{lang.label}</Text>
                {language === lang.value ? (
                  <Box
                    width={20}
                    height={20}
                    borderRadius="round"
                    backgroundColor="primary"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text variant="body_helper_regular" color="white">
                      ✓
                    </Text>
                  </Box>
                ) : null}
              </Box>
            </TouchableOpacity>
          ))}
        </Box>
      </Modal>
    </Container>
  );
};

export default ProfileScreen;
