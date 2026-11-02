import { useCallback, useEffect, useState } from 'react';

import { Action, Body, Notice, Row, Screen } from './components';

const SCENARIOS = ['happy', 'lost_ack', 'stale_status', 'delete_failure'] as const;

type MockState = {
  mode: string;
  stats: { createRequests: number; newJobs: number; duplicateHits: number; deleteRequests: number };
};

/** Talks only to the kit's /__test routes, for reviewers. Not part of the import flow. */
export function DiagnosticsScreen({ baseUrl, onBack }: { baseUrl: string; onBack: () => void }) {
  const [state, setState] = useState<MockState | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/__test/state`);
      setState((await response.json()) as MockState);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [baseUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  const post = async (path: string, body?: object) => {
    try {
      await fetch(`${baseUrl}${path}`, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
    } catch {
      setFailed(true);
    }
    await load();
  };

  return (
    <Screen title="Диагностика">
      <Row label="Адрес mock" value={baseUrl} />
      {failed && <Notice>Mock недоступен. Проверьте, что он запущен.</Notice>}
      {state && (
        <>
          <Row label="Сценарий" value={state.mode} />
          <Row label="createRequests" value={String(state.stats.createRequests)} />
          <Row label="newJobs" value={String(state.stats.newJobs)} />
          <Row label="duplicateHits" value={String(state.stats.duplicateHits)} />
          <Row label="deleteRequests" value={String(state.stats.deleteRequests)} />
        </>
      )}
      <Body muted>Выбрать сценарий mock:</Body>
      {SCENARIOS.map(mode => (
        <Action key={mode} label={mode} onPress={() => post('/__test/scenario', { mode })} />
      ))}
      <Action label="Обновить счётчики" onPress={load} />
      <Action label="Сбросить состояние mock" onPress={() => post('/__test/reset')} />
      <Action label="Назад" kind="primary" onPress={onBack} />
    </Screen>
  );
}
