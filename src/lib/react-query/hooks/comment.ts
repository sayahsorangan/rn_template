/* eslint-disable react-hooks/rules-of-hooks */

import {ICourse} from '@models/API/course';
import {useMQ, UseMQOptions} from '@react-query/custom-hooks';
import {CommentQueryKey} from '@react-query/query-key';
import {CommentService} from '@react-query/service/comment';

export function addComment(options?: UseMQOptions<ICourse.Comment, {courseId: string; message: string}>) {
  return useMQ([CommentQueryKey.addComment], CommentService.addComment, options);
}

export function deleteComment(options?: UseMQOptions<{success: boolean; message: string}, string>) {
  return useMQ([CommentQueryKey.deleteComment], CommentService.deleteComment, options);
}

export function toggleLike(options?: UseMQOptions<{liked: boolean}, string>) {
  return useMQ([CommentQueryKey.toggleLike], CommentService.toggleLike, options);
}
