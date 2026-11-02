import StorageRepository from '@/packages/shared/repositories/storage';
import LanguageService from '@/packages/shared/services/language';
import TokenService from '@/packages/shared/services/token';

import config from '@/app/config/index';
import { createCoordinator } from '@/packages/statementImport/platform/createCoordinator';

export const initApplicationContext = () => {
  const storageRepository = new StorageRepository(config.storage);

  const languageService = new LanguageService(storageRepository);
  const tokenService = new TokenService(storageRepository);
  const statementImport = createCoordinator(config.api.url, storageRepository);

  return {
    repositories: { storage: storageRepository },
    services: { language: languageService, statementImport, token: tokenService },
  };
};

export type IApplicationContext = ReturnType<typeof initApplicationContext>;
