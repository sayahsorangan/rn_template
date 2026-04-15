import {storeKey} from '@lib/redux/store-key';
import {persistReducer} from '@lib/storage/redux-storage';
import {ICourse} from '@models/API/course';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface CommentsState {
  commentsByCourse: Record<string, ICourse.Comment[]>;
}

const initialState: CommentsState = {
  commentsByCourse: {},
};

const slice = createSlice({
  name: storeKey.Comments,
  initialState,
  reducers: {
    setComments: (state, {payload}: PayloadAction<{courseId: string; comments: ICourse.Comment[]}>) => {
      state.commentsByCourse[payload.courseId] = payload.comments;
    },
    addComment: (state, {payload}: PayloadAction<ICourse.Comment>) => {
      const courseId = payload.courseId;
      if (!state.commentsByCourse[courseId]) {
        state.commentsByCourse[courseId] = [];
      }
      state.commentsByCourse[courseId].unshift(payload);
    },
    deleteComment: (state, {payload}: PayloadAction<{commentId: string; courseId: string}>) => {
      const comments = state.commentsByCourse[payload.courseId];
      if (comments) {
        state.commentsByCourse[payload.courseId] = comments.filter(c => c.id !== payload.commentId);
      }
    },
    toggleLike: (state, {payload}: PayloadAction<{commentId: string; courseId: string}>) => {
      const comments = state.commentsByCourse[payload.courseId];
      if (comments) {
        const comment = comments.find(c => c.id === payload.commentId);
        if (comment) {
          comment.likedByUser = !comment.likedByUser;
          comment.likesCount += comment.likedByUser ? 1 : -1;
        }
      }
    },
  },
});

export const comments_action = slice.actions;

export const CommentsReducer = persistReducer({key: storeKey.Comments}, slice.reducer);
