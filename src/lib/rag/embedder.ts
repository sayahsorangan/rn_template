import RNFS from 'react-native-fs';

import {initLlama, LlamaContext} from 'llama.rn';

import {DEFAULT_EMBED_MODEL} from './catalog';
import {EmbedModelOptions} from './types';

let _embedContext: LlamaContext | null = null;
let _embedModelPath: string | null = null;

/**
 * Load a dedicated embedding model. Keep separate from the chat LlamaManager
 * so both models can run independently.
 */
export async function loadEmbedModel(
  options: EmbedModelOptions,
  onProgress?: (progress: number) => void,
): Promise<void> {
  if (_embedContext && _embedModelPath === options.modelPath) {
    return; // Already loaded
  }

  await releaseEmbedModel();

  _embedContext = await initLlama(
    {
      model: options.modelPath,
      n_gpu_layers: options.nGpuLayers ?? 0,
      n_ctx: options.contextSize ?? 512,
      embedding: true,
    },
    (pgrs: number) => onProgress?.(Math.round(pgrs)),
  );

  _embedModelPath = options.modelPath;
}

export async function releaseEmbedModel(): Promise<void> {
  if (_embedContext) {
    await _embedContext.release();
    _embedContext = null;
    _embedModelPath = null;
  }
}

export function isEmbedModelLoaded(): boolean {
  return _embedContext !== null;
}

export function getEmbedModelPath(): string | null {
  return _embedModelPath;
}

/**
 * Embed a single text string into a float vector.
 * Throws if no embedding model is loaded.
 */
export async function embed(text: string): Promise<number[]> {
  if (!_embedContext) {
    throw new Error('Embedding model not loaded. Call loadEmbedModel() first.');
  }

  // llama.rn exposes embedding() on the context
  const result = await (_embedContext as any).embedding(text);

  // llama.rn returns { embedding: number[] }
  const vec: number[] = result?.embedding ?? result;

  if (!Array.isArray(vec) || vec.length === 0) {
    throw new Error('Embedding returned empty vector.');
  }

  return vec;
}

/**
 * Batch embed multiple strings. Returns vectors in the same order.
 */
export async function embedBatch(
  texts: string[],
  onProgress?: (current: number, total: number) => void,
): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i++) {
    results.push(await embed(texts[i]));
    onProgress?.(i + 1, texts.length);
  }
  return results;
}

// ─── Default model helpers ────────────────────────────────────────────────────

/** Absolute path where the default embedding model will be stored. */
export function getDefaultEmbedModelPath(): string {
  return `${RNFS.DocumentDirectoryPath}/${DEFAULT_EMBED_MODEL.filename}`;
}

/**
 * Silently downloads the embed model file to disk in the background.
 * Called automatically whenever a chat model is downloaded — the user never
 * needs to trigger this manually.
 *
 * No-op if the file already exists. Errors are silently swallowed so they
 * never interrupt the chat model download flow.
 *
 * When the user first uses RAG, downloadAndLoadDefaultEmbedModel() will
 * detect the file is present and skip straight to loading the context.
 */
export async function downloadEmbedModelFile(): Promise<void> {
  const destPath = getDefaultEmbedModelPath();

  const exists = await RNFS.exists(destPath);
  if (exists) {
    return;
  }

  try {
    const {promise} = RNFS.downloadFile({
      fromUrl: DEFAULT_EMBED_MODEL.url,
      toFile: destPath,
      background: true,
      discretionary: true, // low-priority — won't compete with chat model download
      begin: () => {},
      progress: () => {},
    });

    const result = await promise;
    if (result.statusCode !== 200) {
      await RNFS.unlink(destPath).catch(() => {});
    }
  } catch {
    await RNFS.unlink(destPath).catch(() => {});
    // Silently swallow — will retry on next startDownload or first RAG use
  }
}

/**
 * Ensures the default embedding model (nomic-embed-text-v1.5, ~92 MB) is
 * downloaded and loaded. Safe to call multiple times — no-op if already loaded.
 *
 * @param onDownloadProgress  0–100 during the one-time file download
 * @param onLoadProgress      0–100 while llama.rn initialises the context
 */
export async function downloadAndLoadDefaultEmbedModel(
  onDownloadProgress?: (pct: number) => void,
  onLoadProgress?: (pct: number) => void,
): Promise<void> {
  const destPath = getDefaultEmbedModelPath();

  // Already loaded with the same model → nothing to do
  if (_embedContext && _embedModelPath === destPath) {
    return;
  }

  // Download if the file is missing
  const exists = await RNFS.exists(destPath);
  if (!exists) {
    await new Promise<void>((resolve, reject) => {
      const {promise} = RNFS.downloadFile({
        fromUrl: DEFAULT_EMBED_MODEL.url,
        toFile: destPath,
        background: true,
        discretionary: false,
        progressInterval: 250,
        begin: () => {},
        progress: res => {
          if (res.contentLength > 0) {
            const pct = Math.round((res.bytesWritten / res.contentLength) * 100);
            onDownloadProgress?.(pct);
          }
        },
      });

      promise
        .then(result => {
          if (result.statusCode === 200) {
            resolve();
          } else {
            RNFS.unlink(destPath).catch(() => {});
            reject(new Error(`HTTP ${result.statusCode} while downloading embed model`));
          }
        })
        .catch(async e => {
          await RNFS.unlink(destPath).catch(() => {});
          reject(e);
        });
    });
  }

  await loadEmbedModel({modelPath: destPath}, onLoadProgress);
}
