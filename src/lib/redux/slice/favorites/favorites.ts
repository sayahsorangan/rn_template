import {storeKey} from '@lib/redux/store-key';
import {persistReducer} from '@lib/storage/redux-storage';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface FavoritesState {
  savedCourseIds: string[];
}

const initialState: FavoritesState = {
  savedCourseIds: [],
};

const slice = createSlice({
  name: storeKey.Favorites,
  initialState,
  reducers: {
    toggleFavorite: (state, {payload}: PayloadAction<string>) => {
      const index = state.savedCourseIds.indexOf(payload);
      if (index >= 0) {
        state.savedCourseIds.splice(index, 1);
      } else {
        state.savedCourseIds.push(payload);
      }
    },
    removeFavorite: (state, {payload}: PayloadAction<string>) => {
      state.savedCourseIds = state.savedCourseIds.filter(id => id !== payload);
    },
    clearFavorites: () => initialState,
  },
});

export const favorites_action = slice.actions;

export const FavoritesReducer = persistReducer({key: storeKey.Favorites}, slice.reducer);
