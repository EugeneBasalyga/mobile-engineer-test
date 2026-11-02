import { useSyncExternalStore } from 'react';

import { useApplicationContext } from '@/packages/shared/contexts/ApplicationContext';

export const useImportCoordinator = () => {
  const {
    services: { statementImport: coordinator },
  } = useApplicationContext();

  const state = useSyncExternalStore(coordinator.subscribe, coordinator.getState);

  return { coordinator, state };
};
