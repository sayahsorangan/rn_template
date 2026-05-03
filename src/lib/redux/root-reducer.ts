import {combineReducers} from 'redux';

import {AppReducer} from './slice/app';
import {LlmReducer} from './slice/llm';
import {RagReducer} from './slice/rag';
import {UserReducer} from './slice/user';

const baseReducer = {
  UserReducer,
  AppReducer,
  LlmReducer,
  RagReducer,
};

const orderedReducer = Object.keys(baseReducer)
  .sort()
  .reduce((acc, item) => {
    acc[item] = baseReducer[item];
    return acc;
  }, {}) as typeof baseReducer;

export const rootReducers = combineReducers(orderedReducer);
