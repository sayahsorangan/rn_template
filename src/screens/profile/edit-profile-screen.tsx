import React, {useState} from 'react';

import {useTranslation} from 'react-i18next';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {useAppDispatch, useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {Button} from '@components/button/Button';
import {Container} from '@components/container';
import {Header} from '@components/header';
import {TextInput} from '@components/inputs/text-input';
import {AuthQuery} from '@react-query/query-hooks';
import {user_action} from '@redux-store/slice/user';
import {Navigation} from '@router/navigation-helper';

const EditProfileScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.UserReducer.user);
  const theme = useTheme();
  const {t} = useTranslation();
  const [name, setName] = useState(user?.fullName || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [nameError, setNameError] = useState('');

  const updateMutation = AuthQuery.updateProfile({
    onSuccess: updatedProfile => {
      dispatch(
        user_action.updateUserProfile({
          fullName: updatedProfile.fullName,
          avatar: updatedProfile.avatar,
          bio: updatedProfile.bio,
        }),
      );
      Navigation.back();
    },
    onError: () => {
      // Silently fail remote sync — local state is already updated
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      setNameError(t('name_required'));
      return;
    }
    setNameError('');

    updateMutation.mutate({
      fullName: name.trim(),
      avatar: avatar.trim() || undefined,
      bio: bio.trim() || undefined,
    });
  };

  return (
    <Container translucent>
      <Header title={t('edit_profile')} />
      <KeyboardAwareScrollView
        contentContainerStyle={{padding: theme.spacing.md, paddingBottom: 100}}
        keyboardShouldPersistTaps="handled"
      >
        <Box marginBottom="md">
          <TextInput
            label={t('name_label')}
            placeholder={t('enter_name')}
            value={name}
            onChangeText={(v: string) => {
              setName(v);
              if (nameError) {
                setNameError('');
              }
            }}
            iconLeftName="user"
          />
          {!!nameError && (
            <Text variant="body_helper_regular" style={{color: theme.colors.danger}} marginTop="xxs">
              {nameError}
            </Text>
          )}
        </Box>

        <Box marginBottom="md">
          <TextInput
            label={t('avatar_url')}
            placeholder={t('enter_avatar_url')}
            value={avatar}
            onChangeText={setAvatar}
            iconLeftName="image"
            autoCapitalize="none"
          />
        </Box>

        <Box marginBottom="lg">
          <TextInput
            label={t('bio_label')}
            placeholder={t('tell_about_yourself')}
            value={bio}
            onChangeText={setBio}
            iconLeftName="file-text"
            multiline
          />
        </Box>

        <Button
          label={t('save_changes')}
          onPress={handleSave}
          loading={updateMutation.isLoading}
          disabled={updateMutation.isLoading}
        />
      </KeyboardAwareScrollView>
    </Container>
  );
};

export default EditProfileScreen;
