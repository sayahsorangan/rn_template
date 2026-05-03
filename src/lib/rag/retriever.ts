import {embed} from './embedder';
import {RetrievedChunk, RetrieveOptions} from './types';
import {getAllChunksMeta, getChunkEmbedding} from './vector-store';

/** Cosine similarity between two equal-length vectors */
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Retrieve the top-K most relevant chunks for a query string.
 * Requires the embedding model to be loaded via loadEmbedModel().
 */
export async function retrieve(query: string, options?: RetrieveOptions): Promise<RetrievedChunk[]> {
  const topK = options?.topK ?? 4;
  const minScore = options?.minScore ?? 0.0;

  const queryEmbedding = await embed(query);
  const allChunks = getAllChunksMeta();

  const scored: RetrievedChunk[] = [];

  for (const chunk of allChunks) {
    const embedding = getChunkEmbedding(chunk.id);
    if (!embedding) continue;

    const score = cosineSimilarity(queryEmbedding, embedding);
    if (score >= minScore) {
      scored.push({chunk, score});
    }
  }

  // Sort descending by score, take top-K
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Build a RAG prompt string from retrieved chunks + user query.
 * The context is woven in silently — the model answers as if it knows the
 * information, without referencing "provided context" or "documents".
 */
export function buildRagPrompt(query: string, chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return query;
  }

  const context = chunks.map(r => r.chunk.text).join('\n\n');

  return `[INTERNAL KNOWLEDGE]\n${context}\n[/INTERNAL KNOWLEDGE]\n\n${query}`;
}
