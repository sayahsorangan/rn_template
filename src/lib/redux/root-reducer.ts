import {combineReducers} from 'redux';

import {AppReducer} from './slice/app';
import {UserReducer} from './slice/user';

const baseReducer = {
  UserReducer,
  AppReducer,
};

const orderedReducer = Object.keys(baseReducer)
  .sort()
  .reduce((acc, item) => {
    acc[item] = baseReducer[item];
    return acc;
  }, {}) as typeof baseReducer;

export const rootReducers = combineReducers(orderedReducer);
