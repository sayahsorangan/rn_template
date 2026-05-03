import {createMMKV} from 'react-native-mmkv';

import {RagChunkMeta, RagDocument} from './types';

// Separate MMKV instance for RAG data
const ragStorage = createMMKV({id: 'rag-storage'});

const DOCS_KEY = 'rag:documents';
const CHUNKS_META_KEY = 'rag:chunks:meta';
const EMBEDDING_PREFIX = 'rag:emb:';

// ─── Documents ────────────────────────────────────────────────────────────────

export function saveDocument(doc: RagDocument): void {
  const existing = getAllDocuments();
  const updated = [...existing.filter(d => d.id !== doc.id), doc];
  ragStorage.set(DOCS_KEY, JSON.stringify(updated));
}

export function getAllDocuments(): RagDocument[] {
  const raw = ragStorage.getString(DOCS_KEY);
  return raw ? (JSON.parse(raw) as RagDocument[]) : [];
}

export function getDocument(id: string): RagDocument | undefined {
  return getAllDocuments().find(d => d.id === id);
}

export function deleteDocument(id: string): void {
  // Remove document
  const docs = getAllDocuments().filter(d => d.id !== id);
  ragStorage.set(DOCS_KEY, JSON.stringify(docs));

  // Remove associated chunks and embeddings
  const chunks = getAllChunksMeta().filter(c => {
    if (c.documentId === id) {
      ragStorage.remove(`${EMBEDDING_PREFIX}${c.id}`);
      return false;
    }
    return true;
  });
  ragStorage.set(CHUNKS_META_KEY, JSON.stringify(chunks));
}

// ─── Chunks ───────────────────────────────────────────────────────────────────

export function saveChunk(meta: RagChunkMeta, embedding: number[]): void {
  const existing = getAllChunksMeta();
  const updated = [...existing.filter(c => c.id !== meta.id), meta];
  ragStorage.set(CHUNKS_META_KEY, JSON.stringify(updated));
  ragStorage.set(`${EMBEDDING_PREFIX}${meta.id}`, JSON.stringify(embedding));
}

export function getAllChunksMeta(): RagChunkMeta[] {
  const raw = ragStorage.getString(CHUNKS_META_KEY);
  return raw ? (JSON.parse(raw) as RagChunkMeta[]) : [];
}

export function getChunkEmbedding(chunkId: string): number[] | null {
  const raw = ragStorage.getString(`${EMBEDDING_PREFIX}${chunkId}`);
  return raw ? (JSON.parse(raw) as number[]) : null;
}

export function getChunksForDocument(documentId: string): RagChunkMeta[] {
  return getAllChunksMeta().filter(c => c.documentId === documentId);
}

export function deleteChunksForDocument(documentId: string): void {
  const all = getAllChunksMeta();
  const remaining = all.filter(c => {
    if (c.documentId === documentId) {
      ragStorage.remove(`${EMBEDDING_PREFIX}${c.id}`);
      return false;
    }
    return true;
  });
  ragStorage.set(CHUNKS_META_KEY, JSON.stringify(remaining));
}

// ─── Clear all ────────────────────────────────────────────────────────────────

export function clearAllRagData(): void {
  ragStorage.clearAll();
}
