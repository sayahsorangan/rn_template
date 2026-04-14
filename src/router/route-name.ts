import {NavigatorScreenParams} from '@react-navigation/native';

export const Route = {
  tab: 'tab',
  home: 'home',
} as const;

export interface IBottomTabScreen {
  home: 'home';
}

export type StackScreens = {
  [Route.home]: any;
};

export type RouteStackNavigation = {
  [Route.tab]: NavigatorScreenParams<IBottomTabScreen>;
} & StackScreens;
