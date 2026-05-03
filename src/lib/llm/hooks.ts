import {useCallback, useState} from 'react';

import {initLlama} from 'llama.rn';

import {useAppDispatch, useAppSelector} from '@app/hooks/redux';
import {llm_action, LlmMessage} from '@redux-store/slice/llm';

import {LlamaManager} from './';
import {GenerateOptions, LoadModelOptions} from './types';

export function useLoadModel() {
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const isModelLoaded = useAppSelector(state => state.LlmReducer.isModelLoaded);
  const modelPath = useAppSelector(state => state.LlmReducer.modelPath);

  const loadModel = useCallback(
    async (options: LoadModelOptions) => {
      try {
        setError(null);
        setProgress(0);
        dispatch(llm_action.setModelLoaded(false));

        await LlamaManager.release();

        const context = await initLlama(
          {
            model: options.modelPath,
            n_gpu_layers: options.nGpuLayers ?? 0,
            n_ctx: options.contextSize ?? 2048,
          },
          (pgrs: number) => setProgress(Math.round(pgrs)),
        );

        LlamaManager.setContext(context);
        dispatch(llm_action.setModelPath(options.modelPath));
        dispatch(llm_action.setModelLoaded(true));
        setProgress(100);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load model');
        dispatch(llm_action.setModelLoaded(false));
      }
    },
    [dispatch],
  );

  const unloadModel = useCallback(async () => {
    await LlamaManager.release();
    dispatch(llm_action.setModelLoaded(false));
    dispatch(llm_action.setModelPath(null));
    setProgress(0);
  }, [dispatch]);

  return {loadModel, unloadModel, isModelLoaded, modelPath, progress, error};
}

export function useChat() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(state => state.LlmReducer.messages);
  const isGenerating = useAppSelector(state => state.LlmReducer.isGenerating);
  const systemPrompt = useAppSelector(state => state.LlmReducer.systemPrompt);
  const language = useAppSelector(state => state.LlmReducer.language);
  const isModelLoaded = useAppSelector(state => state.LlmReducer.isModelLoaded);

  const sendMessage = useCallback(
    async (userText: string, options?: GenerateOptions) => {
      const context = LlamaManager.getContext();
      if (!context || !userText.trim()) return;

      const userMsg: LlmMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userText.trim(),
        createdAt: Date.now(),
      };
      dispatch(llm_action.addMessage(userMsg));

      const assistantMsg: LlmMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
      };
      dispatch(llm_action.addMessage(assistantMsg));
      dispatch(llm_action.setGenerating(true));

      try {
        const langInstruction = language && language !== 'auto' ? ` Always respond in ${language}.` : '';
        const currentMessages = [
          {role: 'system' as const, content: systemPrompt + langInstruction},
          ...messages.map(m => ({role: m.role as 'user' | 'assistant', content: m.content})),
          {role: 'user' as const, content: options?.llmPrompt ?? userText.trim()},
        ];

        await context.completion(
          {
            messages: currentMessages,
            n_predict: options?.maxTokens ?? 512,
            temperature: options?.temperature ?? 0.7,
            top_p: options?.topP ?? 0.9,
          },
          data => {
            if (data.token) {
              dispatch(llm_action.appendToLastAssistantMessage(data.token));
              options?.onToken?.(data.token);
            }
          },
        );
      } catch (e: any) {
        dispatch(llm_action.appendToLastAssistantMessage('\n\n[Error: ' + (e?.message ?? 'Generation failed') + ']'));
      } finally {
        dispatch(llm_action.setGenerating(false));
      }
    },
    [dispatch, messages, systemPrompt, language],
  );

  const clearChat = useCallback(() => {
    dispatch(llm_action.clearMessages());
  }, [dispatch]);

  const setLanguage = useCallback(
    (lang: string) => {
      dispatch(llm_action.setLanguage(lang));
    },
    [dispatch],
  );

  return {messages, isGenerating, isModelLoaded, sendMessage, clearChat, language, setLanguage};
}
