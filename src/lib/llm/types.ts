export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LoadModelOptions {
  /** Absolute path to the .gguf model file on device */
  modelPath: string;
  /** Number of GPU layers to offload. 0 = CPU only. -1 = all layers on GPU */
  nGpuLayers?: number;
  /** Context window size in tokens */
  contextSize?: number;
}

export interface GenerateOptions {
  /** Max tokens to generate */
  maxTokens?: number;
  /** Temperature 0.0–1.0 */
  temperature?: number;
  /** Top-p sampling */
  topP?: number;
  /** Called with each streamed token */
  onToken?: (token: string) => void;
  /**
   * Override the prompt actually sent to the LLM (e.g. a RAG-augmented prompt).
   * The user bubble always shows the original userText; this is used only for LLM completion.
   */
  llmPrompt?: string;
}
