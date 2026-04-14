import {Api} from '@lib/ky/base';
import {ApiResponse, PaginatedResponse, PaginationParams} from '@models/API/app';
import {ICourse} from '@models/API/course';

const getCommentsByCourse = async (courseId: string, {page, limit}: PaginationParams) => {
  const resp = await Api.get('comments', {searchParams: {courseId, page, limit}}).json<
    PaginatedResponse<ICourse.Comment>
  >();
  return resp;
};

const addComment = async (data: Omit<ICourse.Comment, 'id'>) => {
  const resp = await Api.post('comments', {json: data}).json<ApiResponse<ICourse.Comment>>();
  return resp.data;
};

const updateComment = async ({id, data}: {id: string; data: Partial<ICourse.Comment>}) => {
  const resp = await Api.put(`comments/${id}`, {json: data}).json<ApiResponse<ICourse.Comment>>();
  return resp.data;
};

export const CommentService = {
  getCommentsByCourse,
  addComment,
  updateComment,
};
