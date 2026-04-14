/* eslint-disable react-hooks/rules-of-hooks */

import {PaginatedResponse} from '@models/API/app';
import {ICourse} from '@models/API/course';
import {UseInfiniteOptions, useInfiniteRQ, useMQ, UseMQOptions} from '@react-query/custom-hooks';
import {CommentQueryKey} from '@react-query/query-key';
import {CommentService} from '@react-query/service/comment';

const COMMENTS_PER_PAGE = 10;

type CommentsKey = readonly [string, string];

export function getCommentsByCourse(
  courseId: string,
  options?: UseInfiniteOptions<PaginatedResponse<ICourse.Comment>, CommentsKey>,
) {
  return useInfiniteRQ<PaginatedResponse<ICourse.Comment>, CommentsKey>(
    [CommentQueryKey.getComments, courseId] as const,
    ({pageParam = 1}) => CommentService.getCommentsByCourse(courseId, {page: pageParam, limit: COMMENTS_PER_PAGE}),
    {
      enabled: !!courseId,
      getNextPageParam: lastPage => {
        const pagination = lastPage?.pagination;
        if (!pagination) {
          return undefined;
        }
        return pagination.page < pagination.totalPages ? pagination.page + 1 : undefined;
      },
      ...options,
    },
  );
}

export function addComment(options?: UseMQOptions<ICourse.Comment, Omit<ICourse.Comment, 'id'>>) {
  return useMQ([CommentQueryKey.getComments], CommentService.addComment, options);
}

export function updateComment(options?: UseMQOptions<ICourse.Comment, {id: string; data: Partial<ICourse.Comment>}>) {
  return useMQ([CommentQueryKey.getComments], CommentService.updateComment, options);
}
