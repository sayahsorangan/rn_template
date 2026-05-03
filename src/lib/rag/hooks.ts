import {useCallback, useState} from 'react';

import RNFS from 'react-native-fs';

import {useAppDispatch, useAppSelector} from '@app/hooks/redux';
import {rag_action} from '@redux-store/slice/rag';

import {chunkText} from './chunker';
import {
  downloadAndLoadDefaultEmbedModel,
  embed,
  embedBatch,
  getDefaultEmbedModelPath,
  isEmbedModelLoaded,
  releaseEmbedModel,
} from './embedder';
import {buildRagPrompt, retrieve} from './retriever';
import {IngestProgressCallback, RagChunkMeta, RagDocument, RetrievedChunk, RetrieveOptions} from './types';
import {deleteDocument, getAllDocuments, getChunksForDocument, saveChunk, saveDocument} from './vector-store';

// ─── Embed model lifecycle ────────────────────────────────────────────────────

/**
 * Ensures the default embedding model (nomic-embed-text-v1.5, ~92 MB) is
 * downloaded and loaded. Auto-downloads on first use — no manual model
 * selection needed.
 */
export function useEnsureEmbedModel() {
  const dispatch = useAppDispatch();
  const isLoaded = useAppSelector(state => state.RagReducer.isEmbedModelLoaded);
  const status = useAppSelector(state => state.RagReducer.embedDownloadStatus);
  const downloadProgress = useAppSelector(state => state.RagReducer.embedDownloadProgress);

  const ensureLoaded = useCallback(async () => {
    if (isEmbedModelLoaded()) {
      return;
    }
    try {
      dispatch(rag_action.setEmbedDownloadProgress(0));
      dispatch(rag_action.setEmbedDownloadStatus('downloading'));
      dispatch(rag_action.setEmbedDownloadError(null));

      await downloadAndLoadDefaultEmbedModel(
        pct => dispatch(rag_action.setEmbedDownloadProgress(pct)),
        () => dispatch(rag_action.setEmbedDownloadStatus('loading')),
      );

      dispatch(rag_action.setEmbedModelLoaded(true));
      dispatch(rag_action.setEmbedModelPath(getDefaultEmbedModelPath()));
      dispatch(rag_action.setEmbedDownloadStatus('ready'));
    } catch (e: any) {
      dispatch(rag_action.setEmbedDownloadStatus('error'));
      dispatch(rag_action.setEmbedDownloadError(e?.message ?? 'Failed to load embedding model'));
      dispatch(rag_action.setEmbedModelLoaded(false));
    }
  }, [dispatch]);

  const unloadModel = useCallback(async () => {
    await releaseEmbedModel();
    dispatch(rag_action.setEmbedModelLoaded(false));
    dispatch(rag_action.setEmbedModelPath(null));
    dispatch(rag_action.setEmbedDownloadStatus('idle'));
    dispatch(rag_action.setEmbedDownloadProgress(0));
  }, [dispatch]);

  return {ensureLoaded, unloadModel, isLoaded, status, downloadProgress};
}

// ─── Document ingestion ───────────────────────────────────────────────────────

export function useIngest() {
  const dispatch = useAppDispatch();
  const [ingesting, setIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ingest plain text directly.
   * Auto-downloads and loads the embedding model on first call (~92 MB one-time).
   */
  const ingestText = useCallback(
    async (name: string, text: string, onProgress?: IngestProgressCallback) => {
      try {
        setError(null);
        setIngesting(true);

        // Auto-ensure the default embedding model is ready
        if (!isEmbedModelLoaded()) {
          dispatch(rag_action.setEmbedDownloadProgress(0));
          dispatch(rag_action.setEmbedDownloadStatus('downloading'));
          dispatch(rag_action.setEmbedDownloadError(null));
          try {
            await downloadAndLoadDefaultEmbedModel(
              pct => dispatch(rag_action.setEmbedDownloadProgress(pct)),
              () => dispatch(rag_action.setEmbedDownloadStatus('loading')),
            );
            dispatch(rag_action.setEmbedModelLoaded(true));
            dispatch(rag_action.setEmbedModelPath(getDefaultEmbedModelPath()));
            dispatch(rag_action.setEmbedDownloadStatus('ready'));
          } catch (embedErr: any) {
            dispatch(rag_action.setEmbedDownloadStatus('error'));
            dispatch(rag_action.setEmbedDownloadError(embedErr?.message ?? 'Failed to load embedding model'));
            setError(embedErr?.message ?? 'Failed to load embedding model');
            return;
          }
        }

        const doc: RagDocument = {
          id: `doc_${Date.now()}`,
          name,
          text,
          createdAt: Date.now(),
        };

        const chunkTexts = chunkText(text);

        const embeddings = await embedBatch(chunkTexts, (current, _total) => {
          const pct = Math.round((current / chunkTexts.length) * 100);
          setIngestProgress(pct);
          onProgress?.(current, _total);
        });

        for (let i = 0; i < chunkTexts.length; i++) {
          const meta: RagChunkMeta = {
            id: `${doc.id}_c${i}`,
            documentId: doc.id,
            text: chunkTexts[i],
            chunkIndex: i,
          };
          saveChunk(meta, embeddings[i]);
        }

        saveDocument(doc);
        dispatch(rag_action.setDocumentCount(getAllDocuments().length));
      } catch (e: any) {
        setError(e?.message ?? 'Ingestion failed');
      } finally {
        setIngesting(false);
        setIngestProgress(0);
      }
    },
    [dispatch],
  );

  /**
   * Ingest a text file from the device filesystem by path.
   */
  const ingestFile = useCallback(
    async (filePath: string, onProgress?: IngestProgressCallback) => {
      const name = filePath.split('/').pop() ?? filePath;
      const text = await RNFS.readFile(filePath, 'utf8');
      await ingestText(name, text, onProgress);
    },
    [ingestText],
  );

  /**
   * Remove a document and all its chunks/embeddings.
   */
  const removeDocument = useCallback(
    (documentId: string) => {
      deleteDocument(documentId);
      dispatch(rag_action.setDocumentCount(getAllDocuments().length));
    },
    [dispatch],
  );

  return {ingestText, ingestFile, removeDocument, ingesting, ingestProgress, error};
}

// ─── Retrieval ────────────────────────────────────────────────────────────────

export function useRag() {
  const dispatch = useAppDispatch();
  const [retrieving, setRetrieving] = useState(false);
  const [lastChunks, setLastChunks] = useState<RetrievedChunk[]>([]);

  /**
   * Find the top-K chunks most relevant to the query.
   * Auto-reloads the embed model into memory if the JS context was reset
   * (e.g. Metro hot-reload or app restart) but the model file is on disk.
   */
  const retrieveChunks = useCallback(
    async (query: string, options?: RetrieveOptions) => {
      setRetrieving(true);
      try {
        // If context was lost (hot reload / restart), reload from disk silently
        if (!isEmbedModelLoaded()) {
          dispatch(rag_action.setEmbedDownloadStatus('loading'));
          await downloadAndLoadDefaultEmbedModel();
          dispatch(rag_action.setEmbedModelLoaded(true));
          dispatch(rag_action.setEmbedModelPath(getDefaultEmbedModelPath()));
          dispatch(rag_action.setEmbedDownloadStatus('ready'));
        }
        const chunks = await retrieve(query, options);
        setLastChunks(chunks);
        return chunks;
      } finally {
        setRetrieving(false);
      }
    },
    [dispatch],
  );

  /**
   * Embed a query and return a full RAG prompt ready to send to the chat model.
   */
  const buildPrompt = useCallback(
    async (query: string, options?: RetrieveOptions) => {
      const chunks = await retrieveChunks(query, options);
      return buildRagPrompt(query, chunks);
    },
    [retrieveChunks],
  );

  /**
   * Direct access to cosine similarity without side effects.
   */
  const embedQuery = useCallback(async (text: string) => {
    return embed(text);
  }, []);

  return {retrieveChunks, buildPrompt, embedQuery, retrieving, lastChunks};
}

// ─── Document list ────────────────────────────────────────────────────────────

export function useRagDocuments() {
  // Re-read from MMKV whenever documentCount changes (updated after every ingest/remove)
  useAppSelector(state => state.RagReducer.documentCount);
  const documents = getAllDocuments();

  const getChunkCount = useCallback((documentId: string) => {
    return getChunksForDocument(documentId).length;
  }, []);

  return {documents, getChunkCount};
}
