import {getAppInfo} from './hooks/app';
import {getUsers, loginByEmail, updateUser} from './hooks/auth';
import {addComment, getCommentsByCourse, updateComment} from './hooks/comment';
import {getCourseDetail, getCourses} from './hooks/course';

export const AppQuery = {
  getAppInfo,
};

export const AuthQuery = {
  getUsers,
  loginByEmail,
  updateUser,
};

export const CourseQuery = {
  getCourses,
  getCourseDetail,
};

export const CommentQuery = {
  getCommentsByCourse,
  addComment,
  updateComment,
};
