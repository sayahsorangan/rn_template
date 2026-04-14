import {queryStorage} from '@lib/storage/query-storage';
import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister';
import {QueryClient} from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {cacheTime: 1000 * 60 * 60 * 24, networkMode: 'offlineFirst'},
  },
});

export const RQStorageKey = 'RQ_Cache_storage';

export const persister = createSyncStoragePersister({
  storage: queryStorage,
  key: RQStorageKey,
});
