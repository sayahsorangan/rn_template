import React, {useCallback, useState} from 'react';

import {useTranslation} from 'react-i18next';

import {Box, Text} from '@app/themes';
import {CommentInput} from '@components/comment-input';
import {CommentItem} from '@components/comment-item';
import {ICourse} from '@models/API/course';
import {CommentQuery} from '@react-query/query-hooks';

interface CommentsSectionProps {
  courseId: string;
  comments: ICourse.Comment[];
  onRefresh: () => void;
}

export const CommentsSection = ({courseId, comments, onRefresh}: CommentsSectionProps) => {
  const {t} = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addCommentMutation = CommentQuery.addComment({
    onSuccess: () => {
      setIsSubmitting(false);
      onRefresh();
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const toggleLikeMutation = CommentQuery.toggleLike({
    onSuccess: () => {
      onRefresh();
    },
  });

  const handleToggleLike = useCallback(
    (commentId: string) => {
      toggleLikeMutation.mutate(commentId);
    },
    [toggleLikeMutation],
  );

  const handleAddComment = useCallback(
    (message: string) => {
      setIsSubmitting(true);
      addCommentMutation.mutate({courseId, message});
    },
    [courseId, addCommentMutation],
  );

  return (
    <Box paddingHorizontal="md" paddingTop="md">
      <Text variant="h_5_bold" marginBottom="sm">
        {t('comments')}
      </Text>

      <CommentInput onSubmit={handleAddComment} loading={isSubmitting} />

      {comments.length === 0 ? (
        <Box paddingVertical="lg" alignItems="center">
          <Text variant="body_regular" color="grey">
            {t('no_comments_yet')}
          </Text>
        </Box>
      ) : (
        <>
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} onToggleLike={() => handleToggleLike(comment.id)} />
          ))}
        </>
      )}
    </Box>
  );
};
