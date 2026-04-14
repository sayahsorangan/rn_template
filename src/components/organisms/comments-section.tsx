import React, {useCallback, useEffect, useMemo} from 'react';

import {ActivityIndicator, TouchableOpacity} from 'react-native';

import {useTranslation} from 'react-i18next';

import {useAppDispatch, useAppSelector} from '@app/hooks/redux';
import {Box, Text, useTheme} from '@app/themes';
import {CommentInput} from '@components/comment-input';
import {CommentItem} from '@components/comment-item';
import {ICourse} from '@models/API/course';
import {CommentQuery} from '@react-query/query-hooks';
import {comments_action} from '@redux-store/slice/comments';

interface CommentsSectionProps {
  courseId: string;
}

export const CommentsSection = ({courseId}: CommentsSectionProps) => {
  const dispatch = useAppDispatch();
  const {colors, spacing} = useTheme();
  const {t} = useTranslation();
  const user = useAppSelector(state => state.UserReducer.user);
  const commentsByCourse = useAppSelector(state => state.CommentsReducer.commentsByCourse);
  const localComments = commentsByCourse[courseId] || [];

  const {data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage} = CommentQuery.getCommentsByCourse(courseId);

  const comments = useMemo(() => data?.pages.flatMap(page => page.data) ?? [], [data]);

  const addCommentMutation = CommentQuery.addComment({
    onSuccess: (newComment: ICourse.Comment) => {
      dispatch(comments_action.addComment(newComment));
    },
  });

  useEffect(() => {
    if (comments.length) {
      dispatch(comments_action.setComments({courseId, comments}));
    }
  }, [comments, courseId, dispatch]);

  const handleToggleLike = useCallback(
    (commentId: string) => {
      dispatch(comments_action.toggleLike({commentId, courseId}));
    },
    [courseId, dispatch],
  );

  const handleAddComment = useCallback(
    (message: string) => {
      if (!user) {
        return;
      }
      const newComment: Omit<ICourse.Comment, 'id'> = {
        courseId,
        user: {id: user.id, name: user.name},
        message,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedByUser: false,
      };
      addCommentMutation.mutate(newComment);
    },
    [courseId, user, addCommentMutation],
  );

  return (
    <Box paddingHorizontal="md" paddingTop="md">
      <Text variant="h_5_bold" marginBottom="sm">
        {t('comments')}
      </Text>

      <CommentInput onSubmit={handleAddComment} loading={addCommentMutation.isLoading} />

      {isLoading ? (
        <Box paddingVertical="lg" alignItems="center">
          <ActivityIndicator size="small" color={colors.primary} />
        </Box>
      ) : localComments.length === 0 ? (
        <Box paddingVertical="lg" alignItems="center">
          <Text variant="body_regular" color="grey">
            {t('no_comments_yet')}
          </Text>
        </Box>
      ) : (
        <>
          {localComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} onToggleLike={() => handleToggleLike(comment.id)} />
          ))}
          {hasNextPage && (
            <TouchableOpacity
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              style={{alignItems: 'center', paddingVertical: spacing.sm}}
            >
              {isFetchingNextPage ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text variant="body_medium" color="primary">
                  {t('load_more_comments')}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </>
      )}
    </Box>
  );
};
