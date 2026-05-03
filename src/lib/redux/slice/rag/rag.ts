import {persistReducer} from '@lib/storage/redux-storage';
import {storeKey} from '@redux-store/store-key';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type EmbedDownloadStatus = 'idle' | 'downloading' | 'loading' | 'ready' | 'error';

interface RagState {
  isEmbedModelLoaded: boolean;
  embedModelPath: string | null;
  documentCount: number;
  embedDownloadProgress: number;
  embedDownloadStatus: EmbedDownloadStatus;
  embedDownloadError: string | null;
}

const initialState: RagState = {
  isEmbedModelLoaded: false,
  embedModelPath: null,
  documentCount: 0,
  embedDownloadProgress: 0,
  embedDownloadStatus: 'idle',
  embedDownloadError: null,
};

const slice = createSlice({
  name: storeKey.Rag,
  initialState,
  reducers: {
    setEmbedModelLoaded: (state, {payload}: PayloadAction<boolean>) => {
      state.isEmbedModelLoaded = payload;
    },
    setEmbedModelPath: (state, {payload}: PayloadAction<string | null>) => {
      state.embedModelPath = payload;
    },
    setDocumentCount: (state, {payload}: PayloadAction<number>) => {
      state.documentCount = payload;
    },
    setEmbedDownloadProgress: (state, {payload}: PayloadAction<number>) => {
      state.embedDownloadProgress = payload;
    },
    setEmbedDownloadStatus: (state, {payload}: PayloadAction<EmbedDownloadStatus>) => {
      state.embedDownloadStatus = payload;
    },
    setEmbedDownloadError: (state, {payload}: PayloadAction<string | null>) => {
      state.embedDownloadError = payload;
    },
    onReset: () => initialState,
  },
});

export const rag_action = slice.actions;
export const RagReducer = persistReducer({key: storeKey.Rag}, slice.reducer);
