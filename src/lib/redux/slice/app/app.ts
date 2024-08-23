import {storeKey} from '@lib/redux/store-key';
import {persistReducer} from '@lib/storage/redux-storage';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState = {
  app_info: undefined as any,
};

const slice = createSlice({
  name: storeKey.App,
  initialState,
  reducers: {
    setAppInfo: (state, {payload}: PayloadAction<any>) => {
      state.app_info = payload;
    },
  },
});

export const app_action = slice.actions;

export const AppReducer = persistReducer({key: storeKey.App}, slice.reducer);
