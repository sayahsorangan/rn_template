import {getAppInfo} from './hooks/app';
import {getMe, login, logout, register, updateProfile} from './hooks/auth';
import {addComment, deleteComment, toggleLike} from './hooks/comment';
import {
  deleteCourse,
  getCourseDetail,
  getCourses,
  getCoursesPaginated,
  getFavorites,
  getMyCourses,
  regenerateModule,
  toggleFavorite,
} from './hooks/course';

export const AppQuery = {
  getAppInfo,
};

export const AuthQuery = {
  login,
  register,
  getMe,
  updateProfile,
  logout,
};

export const CourseQuery = {
  getCourses,
  getCoursesPaginated,
  getMyCourses,
  getCourseDetail,
  getFavorites,
  toggleFavorite,
  deleteCourse,
  regenerateModule,
};

export const CommentQuery = {
  addComment,
  deleteComment,
  toggleLike,
};
