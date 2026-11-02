import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

import type StorageRepository from '@/packages/shared/repositories/storage';

export const createQueryClient = (storage: StorageRepository) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    },
  });

  const storagePersister = createAsyncStoragePersister({
    storage: {
      getItem(key: string) {
        return storage.getItem(key);
      },
      removeItem(key: string) {
        storage.removeItem(key);
      },
      setItem(key: string, value: string) {
        storage.setItem(key, value);
      },
    },
  });

  persistQueryClient({
    persister: storagePersister,
    queryClient,
  });

  return queryClient;
};
