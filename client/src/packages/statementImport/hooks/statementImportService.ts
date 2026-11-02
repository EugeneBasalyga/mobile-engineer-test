import { useSyncExternalStore } from 'react';

import { useApplicationContext } from '@/packages/shared/contexts/ApplicationContext';

export const useStatementImportService = () => {
  const {
    services: { statementImport: statementImportService },
  } = useApplicationContext();

  return statementImportService;
};

export const useStatementImportState = () => {
  const { getState, subscribe } = useStatementImportService();

  return useSyncExternalStore(subscribe, getState);
};
