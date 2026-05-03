import {persistReducer} from '@lib/storage/redux-storage';
import {storeKey} from '@redux-store/store-key';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface LlmMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export type DownloadStatus = 'idle' | 'downloading' | 'done' | 'error';

export interface DownloadEntry {
  status: DownloadStatus;
  progress: number;
  filePath?: string;
  error?: string;
}

interface LlmState {
  modelPath: string | null;
  isModelLoaded: boolean;
  isGenerating: boolean;
  generatingRoomId: string | null;
  messages: LlmMessage[];
  systemPrompt: string;
  language: string;
  downloads: Record<string, DownloadEntry>;
}

const initialState: LlmState = {
  modelPath: null,
  isModelLoaded: false,
  isGenerating: false,
  generatingRoomId: null,
  messages: [],
  systemPrompt:
    'You are a knowledgeable and friendly assistant. Answer questions naturally and conversationally. ' +
    'When your message contains an [INTERNAL KNOWLEDGE] block, use that information to answer accurately ' +
    'without mentioning that you were given any context — respond as if you simply know it. ' +
    'Keep answers concise unless the user asks for more detail.',
  language: 'auto',
  downloads: {},
};

const slice = createSlice({
  name: storeKey.Llm,
  initialState,
  reducers: {
    setModelPath: (state, {payload}: PayloadAction<string | null>) => {
      state.modelPath = payload;
    },
    setModelLoaded: (state, {payload}: PayloadAction<boolean>) => {
      state.isModelLoaded = payload;
    },
    setGenerating: (state, {payload}: PayloadAction<boolean>) => {
      state.isGenerating = payload;
    },
    setGeneratingRoomId: (state, {payload}: PayloadAction<string | null>) => {
      state.generatingRoomId = payload;
    },
    addMessage: (state, {payload}: PayloadAction<LlmMessage>) => {
      state.messages.push(payload);
    },
    appendToLastAssistantMessage: (state, {payload}: PayloadAction<string>) => {
      const last = state.messages[state.messages.length - 1];
      if (last && last.role === 'assistant') {
        last.content += payload;
      }
    },
    setSystemPrompt: (state, {payload}: PayloadAction<string>) => {
      state.systemPrompt = payload;
    },
    setLanguage: (state, {payload}: PayloadAction<string>) => {
      state.language = payload;
    },
    clearMessages: state => {
      state.messages = [];
    },
    setMessages: (state, {payload}: PayloadAction<LlmMessage[]>) => {
      state.messages = payload;
    },
    setDownloadProgress: (
      state,
      {payload}: PayloadAction<{modelId: string; progress: number; status: DownloadStatus}>,
    ) => {
      state.downloads[payload.modelId] = {
        ...state.downloads[payload.modelId],
        status: payload.status,
        progress: payload.progress,
        error: undefined,
      };
    },
    setDownloadDone: (state, {payload}: PayloadAction<{modelId: string; filePath: string}>) => {
      state.downloads[payload.modelId] = {
        status: 'done',
        progress: 100,
        filePath: payload.filePath,
      };
    },
    setDownloadError: (state, {payload}: PayloadAction<{modelId: string; error: string}>) => {
      state.downloads[payload.modelId] = {
        ...state.downloads[payload.modelId],
        status: 'error',
        progress: 0,
        error: payload.error,
      };
    },
    onReset: () => initialState,
  },
});

export const llm_action = slice.actions;

export const LlmReducer = persistReducer({key: storeKey.Llm}, slice.reducer);
