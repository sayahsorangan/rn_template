import {Api} from '@lib/ky/base';
import {ApiResponse, PaginatedResponse, PaginationParams} from '@models/API/app';
import {ICourse} from '@models/API/course';

const getCourses = async ({page, limit}: PaginationParams) => {
  const resp = await Api.get('courses', {searchParams: {page, limit}}).json<PaginatedResponse<ICourse.Course>>();
  return resp;
};

const getCourseById = async (id: string) => {
  const resp = await Api.get(`courses/${id}`).json<ApiResponse<ICourse.Course>>();
  return resp.data;
};

export const CourseService = {
  getCourses,
  getCourseById,
};
