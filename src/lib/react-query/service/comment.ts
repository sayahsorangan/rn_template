import {Api} from '@lib/ky/base';
import {ApiResponse} from '@models/API/app';
import {ICourse} from '@models/API/course';

const addComment = async ({courseId, message}: {courseId: string; message: string}) => {
  const resp = await Api.post(`course/${courseId}/comments`, {json: {message}}).json<ApiResponse<ICourse.Comment>>();
  return resp.data;
};

const deleteComment = async (commentId: string) => {
  const resp = await Api.delete(`course/comments/${commentId}`).json<
    ApiResponse<{success: boolean; message: string}>
  >();
  return resp.data;
};

const toggleLike = async (commentId: string) => {
  const resp = await Api.post(`course/comments/${commentId}/like`).json<ApiResponse<{liked: boolean}>>();
  return resp.data;
};

export const CommentService = {
  addComment,
  deleteComment,
  toggleLike,
};
