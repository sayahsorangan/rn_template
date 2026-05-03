import {ChunkOptions} from './types';

const DEFAULT_CHUNK_SIZE = 512; // chars (~128 tokens)
const DEFAULT_OVERLAP = 64; // chars

/**
 * Splits text into overlapping character-window chunks.
 * Tries to break at sentence boundaries (. ! ?) or paragraph boundaries (\n)
 * within a tolerance window to avoid cutting mid-sentence.
 */
export function chunkText(text: string, options?: ChunkOptions): string[] {
  const size = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options?.overlap ?? DEFAULT_OVERLAP;
  const tolerance = Math.floor(size * 0.15); // 15% tolerance for boundary search

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  if (normalized.length <= size) {
    return normalized.length > 0 ? [normalized] : [];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + size, normalized.length);

    if (end < normalized.length) {
      // Try to find a natural break point near the end
      const searchStart = Math.max(end - tolerance, start + 1);
      const window = normalized.slice(searchStart, end + tolerance);

      // Prefer paragraph break → sentence break → word break
      const paraIdx = window.lastIndexOf('\n\n');
      const sentIdx = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '));
      const wordIdx = window.lastIndexOf(' ');

      if (paraIdx !== -1) {
        end = searchStart + paraIdx + 2;
      } else if (sentIdx !== -1) {
        end = searchStart + sentIdx + 2;
      } else if (wordIdx !== -1) {
        end = searchStart + wordIdx + 1;
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start = Math.max(start + 1, end - overlap);
  }

  return chunks;
}
