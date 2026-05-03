export interface EmbedModelEntry {
  id: string;
  name: string;
  description: string;
  url: string;
  filename: string;
  sizeBytes: number;
  sizeLabel: string;
  quantization: string;
  /** Embedding vector dimension */
  dimensions: number;
  recommended?: boolean;
}

/** The single fixed embedding model used by the RAG layer. Auto-downloaded on first use. */
export const DEFAULT_EMBED_MODEL: EmbedModelEntry = {
  id: 'nomic-embed-text-v1.5-q4',
  name: 'Nomic Embed Text v1.5',
  description: 'Best quality/size ratio for RAG. 8192 context window.',
  url: 'https://huggingface.co/nomic-ai/nomic-embed-text-v1.5-GGUF/resolve/main/nomic-embed-text-v1.5.Q4_K_M.gguf',
  filename: 'nomic-embed-text-v1.5.Q4_K_M.gguf',
  sizeBytes: 92_000_000,
  sizeLabel: '~92 MB',
  quantization: 'Q4_K_M',
  dimensions: 768,
  recommended: true,
};

/** @deprecated Use DEFAULT_EMBED_MODEL. Kept for compatibility. */
export const EMBED_MODEL_CATALOG: EmbedModelEntry[] = [DEFAULT_EMBED_MODEL];
