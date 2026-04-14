import React from 'react';

import {TouchableOpacity} from 'react-native';

import moment from 'moment';

import {Icons} from '@app/assets/icons';
import {Box, Text, useTheme} from '@app/themes';
import {Avatar} from '@components/avatar';
import {ICourse} from '@models/API/course';

interface CommentItemProps {
  comment: ICourse.Comment;
  onToggleLike: () => void;
}

export const CommentItem = React.memo(({comment, onToggleLike}: CommentItemProps) => {
  const {colors, spacing} = useTheme();
  return (
    <Box flexDirection="row" paddingVertical="sm" borderBottomWidth={1} style={{borderBottomColor: colors.grey_light}}>
      <Avatar text={comment.user.name} size={36} />
      <Box flex={1} marginLeft="sm">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Text variant="body_medium">{comment.user.name}</Text>
          <Text variant="body_helper_regular" color="grey">
            {moment(comment.createdAt).fromNow()}
          </Text>
        </Box>
        <Text variant="body_regular" color="grey_dark" marginTop="xxs">
          {comment.message}
        </Text>
        <TouchableOpacity
          onPress={onToggleLike}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.xs,
          }}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        >
          <Icons.Feather name="thumbs-up" size={14} color={comment.likedByUser ? colors.primary : colors.grey} />
          <Text
            variant="body_helper_medium"
            marginLeft="xxs"
            style={{color: comment.likedByUser ? colors.primary : colors.grey}}
          >
            {comment.likesCount}
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
});
