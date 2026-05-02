import {NavigatorScreenParams} from '@react-navigation/native';

export const Route = {
  splash: 'splash',
  login: 'login',
  tab: 'tab',
  home: 'home',
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
  [Route.home]: undefined;
};

export type RouteStackNavigation = {
  [Route.tab]: NavigatorScreenParams<IBottomTabScreen>;
} & StackScreens;
