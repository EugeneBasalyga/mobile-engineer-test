import uuid from 'react-native-uuid';

import type StorageRepository from '@/packages/shared/repositories/storage';

import { createImportApi } from '@/packages/statementImport/api/client';
import {
  ImportCoordinator,
  type OperationStore,
} from '@/packages/statementImport/core/importCoordinator';
import { devLogger } from '@/packages/statementImport/core/log';
import { type Operation } from '@/packages/statementImport/core/operation';
import { nativeFiles } from '@/packages/statementImport/platform/files';
import { nativeUploader } from '@/packages/statementImport/platform/uploader';

const OPERATION_KEY = 'statementImport.operation.v1';

const createOperationStore = (storage: StorageRepository): OperationStore => ({
  async load() {
    const value = storage.getItem(OPERATION_KEY);

    return value ? (JSON.parse(value) as Operation) : null;
  },
  async save(operation) {
    if (operation) {
      storage.setItem(OPERATION_KEY, JSON.stringify(operation));
    } else {
      storage.removeItem(OPERATION_KEY);
    }
  },
});

export const createCoordinator = (apiUrl: string, storage: StorageRepository) =>
  new ImportCoordinator({
    api: createImportApi(apiUrl, nativeUploader),
    files: nativeFiles,
    log: devLogger,
    newId: () => String(uuid.v4()),
    pollIntervalMs: 1000,
    store: createOperationStore(storage),
  });
