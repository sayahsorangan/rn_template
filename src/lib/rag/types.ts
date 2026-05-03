/** A piece of source text with metadata */
export interface RagDocument {
  id: string;
  /** Human-readable name shown in the UI (e.g. filename) */
  name: string;
  /** Raw full text before chunking */
  text: string;
  /** Unix ms when added */
  createdAt: number;
}

/** A chunk derived from a RagDocument */
export interface RagChunk {
  id: string;
  /** Parent document id */
  documentId: string;
  /** Chunk text */
  text: string;
  /** Position index within the document */
  chunkIndex: number;
  /** Dense embedding vector */
  embedding: number[];
}

/** A stored chunk entry (without the full embedding, stored separately) */
export interface RagChunkMeta {
  id: string;
  documentId: string;
  text: string;
  chunkIndex: number;
}

/** Options for the chunker */
export interface ChunkOptions {
  /** Target tokens per chunk (approximate: 1 token ≈ 4 chars) */
  chunkSize?: number;
  /** Overlap in characters between consecutive chunks */
  overlap?: number;
}

/** A retrieved chunk with its similarity score */
export interface RetrievedChunk {
  chunk: RagChunkMeta;
  score: number;
}

/** Options for retrieval */
export interface RetrieveOptions {
  /** Number of top chunks to return (default: 4) */
  topK?: number;
  /** Minimum similarity score 0–1 to include (default: 0.0) */
  minScore?: number;
}

/** Options for the embedding model */
export interface EmbedModelOptions {
  modelPath: string;
  nGpuLayers?: number;
  contextSize?: number;
}

/** Ingestion progress callback */
export type IngestProgressCallback = (current: number, total: number) => void;
