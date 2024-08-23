import {storeKey} from '@lib/redux/store-key';
import {persistReducer} from '@lib/storage/redux-storage';
import {IApp} from '@models/API/app';
import {IUser} from '@models/API/user';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState = {
  auth: undefined as IApp.IAuth | undefined,
  user: undefined as IUser.User | undefined,
};

const slice = createSlice({
  name: storeKey.User,
  initialState,
  reducers: {
    setAuth: (state, {payload}: PayloadAction<IApp.IAuth>) => {
      state.auth = payload;
    },
    setUser: (state, {payload}: PayloadAction<any>) => {
      state.user = payload;
    },
    onLogout: state => {
      state.auth = undefined;
      state.user = undefined;
    },
  },
});

export const user_action = slice.actions;

export const UserReducer = persistReducer({key: storeKey.User}, slice.reducer);
