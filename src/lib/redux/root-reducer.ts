import {combineReducers} from 'redux';

import {AppReducer} from './slice/app';
import {CommentsReducer} from './slice/comments';
import {FavoritesReducer} from './slice/favorites';
import {UserReducer} from './slice/user';

const baseReducer = {
  UserReducer,
  AppReducer,
  FavoritesReducer,
  CommentsReducer,
};

const orderedReducer = Object.keys(baseReducer)
  .sort()
  .reduce((acc, item) => {
    acc[item] = baseReducer[item];
    return acc;
  }, {}) as typeof baseReducer;

export const rootReducers = combineReducers(orderedReducer);
