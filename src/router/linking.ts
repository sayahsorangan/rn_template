import {LinkingOptions} from '@react-navigation/native';

import {Route} from './route-name';

const config: PickOnce<LinkingOptions<RouteStack>, 'config'> = {
  screens: {
    [Route.tab]: {
      path: '/',
      exact: true,
      screens: {},
    },
  },
};

const linking: LinkingOptions<RouteStack> = {
  prefixes: ['https://template.app', 'template.app://'],
  config,
};
export {linking};
