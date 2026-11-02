import { useNavigation } from '@react-navigation/native';
import { type FC, useState } from 'react';

import { useMount } from '@/packages/shared/hooks/lifecycle';
import { useTranslation } from '@/packages/shared/hooks/translation';

import config from '@/app/config';
import { type MainNavigationProps } from '@/app/models/navigation/main';
import { type MAIN_ROUTE } from '@/app/routes/routes';
import { Action, Body, Notice, Row, Screen } from '@/packages/statementImport/components/Layout';

const SCENARIOS = ['happy', 'lost_ack', 'stale_status', 'delete_failure'] as const;

interface MockState {
  mode: string;
  stats: {
    createRequests: number;
    deleteRequests: number;
    duplicateHits: number;
    newJobs: number;
  };
}

/** Talks only to the kit's /__test routes, for reviewers. Not part of the import flow. */
const DiagnosticsScreen: FC = () => {
  const { t } = useTranslation('statementImport');

  const navigation = useNavigation<MainNavigationProps<typeof MAIN_ROUTE.DIAGNOSTICS>>();

  const [mockState, setMockState] = useState<MockState | null>(null);
  const [failed, setFailed] = useState(false);

  const load = async () => {
    try {
      const response = await fetch(`${config.api.url}/__test/state`);

      setMockState((await response.json()) as MockState);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };

  useMount(() => {
    load();
  });

  const post = async (path: string, body?: object) => {
    try {
      await fetch(`${config.api.url}${path}`, {
        body: body ? JSON.stringify(body) : undefined,
        method: 'POST',
      });
    } catch {
      setFailed(true);
    }

    await load();
  };

  return (
    <Screen title={t('diagnostics.title')}>
      <Row label={t('diagnostics.address')} value={config.api.url} />

      {failed && <Notice>{t('diagnostics.unavailable')}</Notice>}

      {mockState && (
        <>
          <Row label={t('diagnostics.scenario')} value={mockState.mode} />

          <Row label="createRequests" value={String(mockState.stats.createRequests)} />

          <Row label="newJobs" value={String(mockState.stats.newJobs)} />

          <Row label="duplicateHits" value={String(mockState.stats.duplicateHits)} />

          <Row label="deleteRequests" value={String(mockState.stats.deleteRequests)} />
        </>
      )}

      <Body muted>{t('diagnostics.chooseScenario')}</Body>

      {SCENARIOS.map((mode) => (
        <Action key={mode} title={mode} onPress={() => post('/__test/scenario', { mode })} />
      ))}

      <Action title={t('diagnostics.refresh')} onPress={load} />

      <Action title={t('diagnostics.reset')} onPress={() => post('/__test/reset')} />

      <Action title={t('common.back')} variant="primary" onPress={navigation.goBack} />
    </Screen>
  );
};

export default DiagnosticsScreen;
