import {NavigatorScreenParams} from '@react-navigation/native';

export const Route = {
  splash: 'splash',
  login: 'login',
  register: 'register',
  tab: 'tab',
  home: 'home',
  courseDetail: 'courseDetail',
  moduleDetail: 'moduleDetail',
  favorites: 'favorites',
  profile: 'profile',
  editProfile: 'editProfile',
} as const;

export interface IBottomTabScreen {
  [key: string]: undefined;
  home: undefined;
  favorites: undefined;
  profile: undefined;
}

export type StackScreens = {
  [Route.splash]: undefined;
  [Route.login]: undefined;
  [Route.register]: undefined;
  [Route.home]: undefined;
  [Route.courseDetail]: {courseId: string};
  [Route.moduleDetail]: {module: import('@models/API/course').ICourse.CourseModule};
  [Route.favorites]: undefined;
  [Route.profile]: undefined;
  [Route.editProfile]: undefined;
};

export type RouteStackNavigation = {
  [Route.tab]: NavigatorScreenParams<IBottomTabScreen>;
} & StackScreens;
