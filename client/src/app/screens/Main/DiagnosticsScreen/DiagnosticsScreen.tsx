import { type FC } from 'react';

import { useTranslation } from '@/packages/shared/hooks/translation';

import {
  BodyText,
  ImportButton,
  InfoRow,
  Notice,
  ScreenLayout,
} from '@/packages/statementImport/components';
import { MOCK_SCENARIOS } from '@/packages/statementImport/constants/statementImport';

import { useDiagnosticsScreen } from './useDiagnosticsScreen';

const DiagnosticsScreen: FC = () => {
  const { t } = useTranslation('statementImport');

  const {
    apiUrl,
    failed,
    handleBackPress,
    handleRefreshPress,
    handleResetPress,
    handleScenarioPress,
    mockState,
  } = useDiagnosticsScreen();

  return (
    <ScreenLayout title={t('diagnostics.title')}>
      <InfoRow label={t('diagnostics.address')} value={apiUrl} />

      {failed && <Notice>{t('diagnostics.unavailable')}</Notice>}

      {!!mockState && (
        <>
          <InfoRow label={t('diagnostics.scenario')} value={mockState.mode} />

          <InfoRow label="createRequests" value={String(mockState.stats.createRequests)} />

          <InfoRow label="newJobs" value={String(mockState.stats.newJobs)} />

          <InfoRow label="duplicateHits" value={String(mockState.stats.duplicateHits)} />

          <InfoRow label="deleteRequests" value={String(mockState.stats.deleteRequests)} />
        </>
      )}

      <BodyText muted>{t('diagnostics.chooseScenario')}</BodyText>

      {MOCK_SCENARIOS.map((scenario) => (
        <ImportButton
          key={scenario}
          title={scenario}
          onPress={() => handleScenarioPress(scenario)}
        />
      ))}

      <ImportButton title={t('diagnostics.refresh')} onPress={handleRefreshPress} />

      <ImportButton title={t('diagnostics.reset')} onPress={handleResetPress} />

      <ImportButton title={t('common.back')} variant="primary" onPress={handleBackPress} />
    </ScreenLayout>
  );
};

export default DiagnosticsScreen;
