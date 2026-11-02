import { randomUUID } from 'expo-crypto';

import { createImportApi } from '../api/client';
import { ImportCoordinator } from '../core/importCoordinator';
import { devLogger } from '../core/log';
import { nativeFiles } from './files';
import { nativeStore } from './store';
import { nativeUploader } from './uploader';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8787';

export function createCoordinator(): ImportCoordinator {
  return new ImportCoordinator({
    api: createImportApi(API_BASE_URL, nativeUploader),
    store: nativeStore,
    files: nativeFiles,
    log: devLogger,
    newId: randomUUID,
    pollIntervalMs: 1000,
  });
}
