import {NavigatorScreenParams} from '@react-navigation/native';

export const Route = {
  splash: 'splash',
  login: 'login',
  register: 'register',
  tab: 'tab',
  home: 'home',
  chat: 'chat',
  knowledge: 'knowledge',
  addKnowledge: 'addKnowledge',
  profile: 'profile',
} as const;

export interface IBottomTabScreen {
  [key: string]: undefined;
  home: undefined;
  knowledge: undefined;
  profile: undefined;
}

export type StackScreens = {
  [Route.splash]: undefined;
  [Route.login]: undefined;
  [Route.register]: undefined;
  [Route.home]: undefined;
  [Route.chat]: {roomId?: string} | undefined;
  [Route.knowledge]: undefined;
  [Route.addKnowledge]: undefined;
  [Route.profile]: undefined;
};

export type RouteStackNavigation = {
  [Route.tab]: NavigatorScreenParams<IBottomTabScreen>;
} & StackScreens;
