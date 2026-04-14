import {storeKey} from '@lib/redux/store-key';
import {persistReducer} from '@lib/storage/redux-storage';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';
export type AppLanguage = 'en' | 'id';

const initialState = {
  app_info: undefined as any,
  themeMode: 'light' as ThemeMode,
  language: 'en' as AppLanguage,
};

const slice = createSlice({
  name: storeKey.App,
  initialState,
  reducers: {
    setAppInfo: (state, {payload}: PayloadAction<any>) => {
      state.app_info = payload;
    },
    setThemeMode: (state, {payload}: PayloadAction<ThemeMode>) => {
      state.themeMode = payload;
    },
    toggleThemeMode: state => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
    setLanguage: (state, {payload}: PayloadAction<AppLanguage>) => {
      state.language = payload;
    },
  },
});

export const app_action = slice.actions;

export const AppReducer = persistReducer({key: storeKey.App}, slice.reducer);
