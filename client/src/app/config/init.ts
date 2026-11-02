import StorageRepository from '@/packages/shared/repositories/storage';
import { generateUUID } from '@/packages/shared/utils/generators';

import config from '@/app/config/index';
import ImportOperationRepository from '@/packages/statementImport/repositories/importOperation';
import StatementFileRepository from '@/packages/statementImport/repositories/statementFile';
import StatementImportRepository from '@/packages/statementImport/repositories/statementImport';
import StatementImportService from '@/packages/statementImport/services/statementImport';
import { logImportEvent } from '@/packages/statementImport/utils/logger';

export const initApplicationContext = () => {
  const storageRepository = new StorageRepository(config.storage);
  const statementFileRepository = new StatementFileRepository();
  const statementImportRepository = new StatementImportRepository(
    config.api.url,
    statementFileRepository
  );
  const importOperationRepository = new ImportOperationRepository(storageRepository);

  const statementImportService = new StatementImportService(
    statementImportRepository,
    statementFileRepository,
    importOperationRepository,
    logImportEvent,
    generateUUID
  );

  return {
    repositories: {
      importOperation: importOperationRepository,
      statementFile: statementFileRepository,
      statementImport: statementImportRepository,
      storage: storageRepository,
    },
    services: {
      statementImport: statementImportService,
    },
  };
};

export type IApplicationContext = ReturnType<typeof initApplicationContext>;
