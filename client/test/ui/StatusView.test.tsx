import { render, screen } from '@testing-library/react-native';

import StatusView from '@/packages/statementImport/components/StatusView';
import {
  applyServerView,
  type Operation,
  type ServerView,
} from '@/packages/statementImport/core/operation';

const jobId = 'job-demo-001';
const sending: Operation = {
  byteSize: 112,
  format: 'csv',
  idempotencyKey: 'key-00000001',
  opId: 'op',
  phase: 'sending',
};
const queued: ServerView = { jobId, revision: 1, status: 'queued' };
const processing: ServerView = { jobId, revision: 2, status: 'processing' };
const ready: ServerView = {
  currency: 'AUD',
  items: [
    { amountMinor: 1999, cadence: 'monthly', id: 'rec-001', lastSeen: '2026-10-01', merchant: 'StreamBeam' },
    { amountMinor: 13200, cadence: 'monthly', id: 'rec-002', lastSeen: '2026-10-03', merchant: 'BrightGrid' },
  ],
  jobId,
  revision: 3,
  status: 'ready',
};
const deleting: ServerView = { jobId, revision: 4, status: 'deleting' };
const deleted: ServerView = { jobId, revision: 5, status: 'deleted' };

const noop = () => undefined;

const show = (operation: Operation) =>
  render(
    <StatusView
      busy={false}
      connectionLost={false}
      operation={operation}
      onDelete={noop}
      onDiagnostics={noop}
      onDismiss={noop}
      onOpenItem={noop}
      onRecover={noop}
      onRefresh={noop}
      onRetrySend={noop}
    />
  );

const through = (...views: ServerView[]) => views.reduce(applyServerView, sending);

describe('StatusView', () => {
  it('does not present the 202 answer as a report', () => {
    show(through(queued));
    expect(screen.getByText('В очереди')).toBeTruthy();
    expect(screen.queryByText('StreamBeam')).toBeNull();
  });

  it('shows the report and the 151.99 AUD total at ready', () => {
    show(through(queued, processing, ready));
    expect(screen.getByText('151.99 AUD/мес')).toBeTruthy();
    expect(screen.getByText('StreamBeam')).toBeTruthy();
    expect(screen.getByText('BrightGrid')).toBeTruthy();
  });

  it('does not roll back when processing/revision 2 arrives after ready', () => {
    show(through(queued, processing, ready, processing));
    expect(screen.getByText('Отчёт готов')).toBeTruthy();
    expect(screen.queryByText('Обрабатывается')).toBeNull();
    expect(screen.getByText('151.99 AUD/мес')).toBeTruthy();
  });

  it('does not say deleted after a refused DELETE', () => {
    show({
      ...through(queued, processing, ready),
      deleteKey: 'delete-key',
      deleteOutcome: 'refused',
      phase: 'deleteRequested',
    });
    expect(screen.getByText('Импорт не удалён')).toBeTruthy();
    expect(screen.getByText('Повторить удаление')).toBeTruthy();
    expect(screen.queryByText('Импорт удалён')).toBeNull();
  });

  it('does not say deleted while the server reports deleting', () => {
    show(through(ready, deleting));
    expect(screen.getByText('Удаляем импорт')).toBeTruthy();
    expect(screen.queryByText('Импорт удалён')).toBeNull();
  });

  it('says deleted only after status=deleted', () => {
    show(through(ready, deleting, deleted));
    expect(screen.getByText('Импорт удалён')).toBeTruthy();
  });

  it('keeps showing deleted when a late ready arrives', () => {
    show(through(ready, deleting, deleted, ready));
    expect(screen.getByText('Импорт удалён')).toBeTruthy();
    expect(screen.queryByText('StreamBeam')).toBeNull();
  });

  it('does not treat an unknown job as a deletion', () => {
    show({ ...through(ready), phase: 'missingOnServer' });
    expect(screen.getByText(/Это не подтверждение удаления/)).toBeTruthy();
    expect(screen.queryByText('Импорт удалён')).toBeNull();
  });

  it('offers a same-key retry when the POST outcome is unknown', () => {
    show({ ...sending, phase: 'uncertain', recovery: 'notFound' });
    expect(screen.getByText('Результат отправки неизвестен')).toBeTruthy();
    expect(screen.getByText('Отправить повторно')).toBeTruthy();
  });
});
