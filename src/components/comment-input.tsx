import React, {useState} from 'react';

import {TouchableOpacity} from 'react-native';

import {useTranslation} from 'react-i18next';

import {Icons} from '@app/assets/icons';
import {Box, useTheme} from '@app/themes';
import {TextInput} from '@components/inputs/text-input';

interface CommentInputProps {
  onSubmit: (message: string) => void;
  loading?: boolean;
}

export const CommentInput = React.memo(({onSubmit, loading}: CommentInputProps) => {
  const [message, setMessage] = useState('');
  const {colors, borderRadii} = useTheme();
  const {t} = useTranslation();

  const handleSubmit = () => {
    const trimmed = message.trim();
    if (trimmed) {
      onSubmit(trimmed);
      setMessage('');
    }
  };

  return (
    <Box flexDirection="row" alignItems="center" paddingVertical="xs">
      <Box flex={1} marginRight="xs">
        <TextInput value={message} onChangeText={setMessage} placeholder={t('write_comment')} editable={!loading} />
      </Box>
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!message.trim() || loading}
        style={{
          width: 48,
          height: 48,
          borderRadius: borderRadii.xs,
          backgroundColor: message.trim() ? colors.primary : colors.grey_light,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icons.Feather name="send" size={20} color={colors.white} />
      </TouchableOpacity>
    </Box>
  );
});
