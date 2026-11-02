import { render, screen } from '@testing-library/react-native';

import { applyServerView, type Operation, type ServerView } from '../../src/core/operation';
import { StatusScreen } from '../../src/ui/StatusScreen';

const jobId = 'job-demo-001';
const sending: Operation = { opId: 'op', idempotencyKey: 'key-00000001', phase: 'sending', format: 'csv', byteSize: 112 };
const queued: ServerView = { jobId, status: 'queued', revision: 1 };
const processing: ServerView = { jobId, status: 'processing', revision: 2 };
const ready: ServerView = {
  jobId,
  status: 'ready',
  revision: 3,
  currency: 'AUD',
  items: [
    { id: 'rec-001', merchant: 'StreamBeam', amountMinor: 1999, cadence: 'monthly', lastSeen: '2026-10-01' },
    { id: 'rec-002', merchant: 'BrightGrid', amountMinor: 13200, cadence: 'monthly', lastSeen: '2026-10-03' },
  ],
};
const deleting: ServerView = { jobId, status: 'deleting', revision: 4 };
const deleted: ServerView = { jobId, status: 'deleted', revision: 5 };

const noop = () => undefined;

async function show(operation: Operation) {
  await render(
    <StatusScreen
      operation={operation}
      connectionLost={false}
      busy={false}
      onRetrySend={noop}
      onRecover={noop}
      onRefresh={noop}
      onDelete={noop}
      onDismiss={noop}
      onOpenItem={noop}
      onDiagnostics={noop}
    />,
  );
}

const through = (...views: ServerView[]) => views.reduce(applyServerView, sending);

describe('StatusScreen', () => {
  it('does not present the 202 answer as a report', async () => {
    await show(through(queued));
    expect(screen.getByText('В очереди')).toBeTruthy();
    expect(screen.queryByText('StreamBeam')).toBeNull();
  });

  it('shows the report and the 151.99 AUD total at ready', async () => {
    await show(through(queued, processing, ready));
    expect(screen.getByText('151.99 AUD/мес')).toBeTruthy();
    expect(screen.getByText('StreamBeam')).toBeTruthy();
    expect(screen.getByText('BrightGrid')).toBeTruthy();
  });

  it('does not roll back when processing/revision 2 arrives after ready', async () => {
    await show(through(queued, processing, ready, processing));
    expect(screen.getByText('Отчёт готов')).toBeTruthy();
    expect(screen.queryByText('Обрабатывается')).toBeNull();
    expect(screen.getByText('151.99 AUD/мес')).toBeTruthy();
  });

  it('does not say deleted after a refused DELETE', async () => {
    await show({ ...through(queued, processing, ready), phase: 'deleteRequested', deleteKey: 'delete-key', deleteOutcome: 'refused' });
    expect(screen.getByText('Импорт не удалён')).toBeTruthy();
    expect(screen.getByText('Повторить удаление')).toBeTruthy();
    expect(screen.queryByText('Импорт удалён')).toBeNull();
  });

  it('does not say deleted while the server reports deleting', async () => {
    await show(through(ready, deleting));
    expect(screen.getByText('Удаляем импорт')).toBeTruthy();
    expect(screen.queryByText('Импорт удалён')).toBeNull();
  });

  it('says deleted only after status=deleted', async () => {
    await show(through(ready, deleting, deleted));
    expect(screen.getByText('Импорт удалён')).toBeTruthy();
  });

  it('keeps showing deleted when a late ready arrives', async () => {
    await show(through(ready, deleting, deleted, ready));
    expect(screen.getByText('Импорт удалён')).toBeTruthy();
    expect(screen.queryByText('StreamBeam')).toBeNull();
  });

  it('does not treat an unknown job as a deletion', async () => {
    await show({ ...through(ready), phase: 'missingOnServer' });
    expect(screen.getByText(/Это не подтверждение удаления/)).toBeTruthy();
    expect(screen.queryByText('Импорт удалён')).toBeNull();
  });

  it('offers a same-key retry when the POST outcome is unknown', async () => {
    await show({ ...sending, phase: 'uncertain', recovery: 'notFound' });
    expect(screen.getByText('Результат отправки неизвестен')).toBeTruthy();
    expect(screen.getByText('Отправить повторно')).toBeTruthy();
  });
});
