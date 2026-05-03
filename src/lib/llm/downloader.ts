import RNFS from 'react-native-fs';

import {downloadEmbedModelFile} from '@lib/rag/embedder';
import {AppDispatch} from '@lib/redux/store';
import {llm_action} from '@redux-store/slice/llm';

import {ModelEntry} from './catalog';

export const MODEL_DIR = RNFS.DocumentDirectoryPath;

export function getModelFilePath(filename: string): string {
  return `${MODEL_DIR}/${filename}`;
}

// In-memory map of modelId → RNFS jobId
const activeJobs = new Map<string, number>();

export async function startDownload(model: ModelEntry, dispatch: AppDispatch): Promise<void> {
  const destPath = getModelFilePath(model.filename);

  const exists = await RNFS.exists(destPath);
  if (exists) {
    dispatch(llm_action.setDownloadDone({modelId: model.id, filePath: destPath}));
    return;
  }

  dispatch(llm_action.setDownloadProgress({modelId: model.id, progress: 0, status: 'downloading'}));

  const {jobId, promise} = RNFS.downloadFile({
    fromUrl: model.url,
    toFile: destPath,
    background: true,
    discretionary: false,
    progressInterval: 250,
    begin: () => {},
    progress: res => {
      if (res.contentLength > 0) {
        const pct = Math.round((res.bytesWritten / res.contentLength) * 100);
        dispatch(
          llm_action.setDownloadProgress({
            modelId: model.id,
            progress: pct,
            status: 'downloading',
          }),
        );
      }
    },
  });

  activeJobs.set(model.id, jobId);

  try {
    const result = await promise;
    activeJobs.delete(model.id);
    if (result.statusCode === 200) {
      dispatch(llm_action.setDownloadDone({modelId: model.id, filePath: destPath}));
      // Silently pre-download the embedding model so RAG is ready without
      // any extra action from the user.
      downloadEmbedModelFile().catch(() => {});
    } else {
      await RNFS.unlink(destPath).catch(() => {});
      dispatch(
        llm_action.setDownloadError({
          modelId: model.id,
          error: `Server returned HTTP ${result.statusCode}`,
        }),
      );
    }
  } catch (e: any) {
    activeJobs.delete(model.id);
    const isCancelled = e?.message?.toLowerCase().includes('cancel') || e?.message?.toLowerCase().includes('stop');
    if (isCancelled) {
      await RNFS.unlink(destPath).catch(() => {});
      dispatch(llm_action.setDownloadProgress({modelId: model.id, progress: 0, status: 'idle'}));
    } else {
      await RNFS.unlink(destPath).catch(() => {});
      dispatch(
        llm_action.setDownloadError({
          modelId: model.id,
          error: e?.message ?? 'Download failed',
        }),
      );
    }
  }
}

export function cancelDownload(modelId: string, dispatch: AppDispatch): void {
  const jobId = activeJobs.get(modelId);
  if (jobId !== undefined) {
    RNFS.stopDownload(jobId);
    activeJobs.delete(modelId);
  }
  dispatch(llm_action.setDownloadProgress({modelId, progress: 0, status: 'idle'}));
}

export async function deleteModel(modelId: string, filename: string, dispatch: AppDispatch): Promise<void> {
  const path = getModelFilePath(filename);
  const exists = await RNFS.exists(path);
  if (exists) {
    await RNFS.unlink(path);
  }
  dispatch(llm_action.setDownloadProgress({modelId, progress: 0, status: 'idle'}));
}

export async function scanLocalModels(): Promise<{name: string; path: string; size: number}[]> {
  try {
    const items = await RNFS.readDir(MODEL_DIR);
    return items
      .filter(item => item.isFile() && item.name.endsWith('.gguf'))
      .map(item => ({name: item.name, path: item.path, size: Number(item.size)}));
  } catch {
    return [];
  }
}

export async function isModelDownloaded(filename: string): Promise<boolean> {
  return RNFS.exists(getModelFilePath(filename));
}
