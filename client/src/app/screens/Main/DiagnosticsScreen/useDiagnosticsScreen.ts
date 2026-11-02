import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { useMount } from '@/packages/shared/hooks/lifecycle';

import config from '@/app/config';
import { type MainNavigationProps } from '@/app/models/navigation/main';
import { type MAIN_ROUTE } from '@/app/routes/routes';
import { useStatementImportRepository } from '@/packages/statementImport/hooks/statementImportRepository';
import {
  type IMockState,
  type MockScenario,
} from '@/packages/statementImport/models/statementImport';

export const useDiagnosticsScreen = () => {
  const navigation = useNavigation<MainNavigationProps<typeof MAIN_ROUTE.DIAGNOSTICS>>();

  const { getMockState, resetMock, setMockScenario } = useStatementImportRepository();

  const [mockState, setMockState] = useState<IMockState | null>(null);
  const [failed, setFailed] = useState(false);

  const handleRefreshPress = useCallback(async () => {
    try {
      setMockState(await getMockState());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [getMockState]);

  useMount(() => {
    handleRefreshPress();
  });

  const changeMock = useCallback(
    async (change: () => Promise<void>) => {
      try {
        await change();
      } catch {
        setFailed(true);
      }

      await handleRefreshPress();
    },
    [handleRefreshPress]
  );

  const handleScenarioPress = useCallback(
    (scenario: MockScenario) => {
      changeMock(() => setMockScenario(scenario));
    },
    [changeMock, setMockScenario]
  );

  const handleResetPress = useCallback(() => {
    changeMock(resetMock);
  }, [changeMock, resetMock]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    apiUrl: config.api.url,
    failed,
    handleBackPress,
    handleRefreshPress,
    handleResetPress,
    handleScenarioPress,
    mockState,
  };
};
