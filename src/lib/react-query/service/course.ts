import {Api} from '@lib/ky/base';
import {ApiResponse} from '@models/API/app';
import {ICourse} from '@models/API/course';

interface GetCoursesParams {
  page?: number;
  limit?: number;
  category?: string;
}

const getCourses = async (params?: GetCoursesParams) => {
  const searchParams: Record<string, string | number> = {};
  if (params?.page) {
    searchParams.page = params.page;
  }
  if (params?.limit) {
    searchParams.limit = params.limit;
  }
  if (params?.category) {
    searchParams.category = params.category;
  }
  const resp = await Api.get('course', {searchParams}).json<ApiResponse<ICourse.Course[]>>();
  return resp.data;
};

const getMyCourses = async () => {
  const resp = await Api.get('course/my-courses').json<ApiResponse<ICourse.Course[]>>();
  return resp.data;
};

const getCourseById = async (id: string) => {
  const resp = await Api.get(`course/${id}`).json<ApiResponse<ICourse.CourseDetail>>();
  return resp.data;
};

const deleteCourse = async (id: string) => {
  const resp = await Api.delete(`course/${id}`).json<ApiResponse<{success: boolean; message: string}>>();
  return resp.data;
};

const toggleFavorite = async (id: string) => {
  const resp = await Api.post(`course/${id}/favorite`).json<ApiResponse<{favorited: boolean}>>();
  return resp.data;
};

const getFavorites = async () => {
  const resp = await Api.get('course/favorites').json<ApiResponse<ICourse.Course[]>>();
  return resp.data;
};

const regenerateModule = async (moduleId: string) => {
  const resp = await Api.post(`course/modules/${moduleId}/regenerate`, {timeout: 120000}).json<
    ApiResponse<ICourse.CourseModule>
  >();
  return resp.data;
};

export const CourseService = {
  getCourses,
  getMyCourses,
  getCourseById,
  deleteCourse,
  toggleFavorite,
  getFavorites,
  regenerateModule,
};
