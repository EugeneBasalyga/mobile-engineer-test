import { createHash } from 'node:crypto';
import { readFileSync, truncateSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { MAX_FILE_BYTES } from '@/packages/statementImport/constants/statementImport';
import { type IOperation } from '@/packages/statementImport/models/statementImport';
import type StatementImportService from '@/packages/statementImport/services/statementImport';
import { applyServerView } from '@/packages/statementImport/utils/operation';
import { createService, DiskFiles, FIXTURES, MemoryStore, startMock, waitFor, type LogRecord, type Mock } from './support';

let mock: Mock;
let files: DiskFiles;
let store: MemoryStore;
const running: StatementImportService[] = [];

function launch(options: Parameters<typeof createService>[3] = {}) {
  const service = createService(mock.baseUrl, store, files, options);
  running.push(service);
  return service;
}

async function pickAndConfirm(service: StatementImportService, fixture = 'statement.csv') {
  await service.acceptPicked({ path: files.copyFixture(join(FIXTURES, fixture)), name: fixture });
  await service.confirmDraft();
}

const untilReady = (service: StatementImportService) =>
  waitFor(() => service.getState().operation?.view?.status === 'ready');

beforeAll(async () => {
  mock = await startMock();
});

afterAll(async () => {
  await mock.stop();
});

beforeEach(async () => {
  await mock.reset();
  files = new DiskFiles();
  store = new MemoryStore();
});

afterEach(() => {
  running.splice(0).forEach(service => service.dispose());
  files.cleanup();
});

describe('happy', () => {
  it.each(['statement.csv', 'statement.pdf'])('sends the real bytes of %s and shows data only after ready', async fixture => {
    const service = launch();
    const statuses: (string | undefined)[] = [];
    service.subscribe(() => statuses.push(service.getState().operation?.view?.status));
    await pickAndConfirm(service, fixture);
    await untilReady(service);

    const bytes = readFileSync(join(FIXTURES, fixture));
    const state = await mock.state();
    expect(state.jobs[0].sha256).toBe(createHash('sha256').update(bytes).digest('hex'));
    expect(state.jobs[0].bytes).toBe(bytes.length);
    expect(state.stats.newJobs).toBe(1);
    expect(statuses[statuses.findIndex(Boolean)]).toBe('queued');
    expect(service.getState().operation?.view?.items?.map(item => item.id)).toEqual(['rec-001', 'rec-002']);
  });

  it('removes the private copy and the file name once the job is known', async () => {
    const service = launch();
    await pickAndConfirm(service);
    await untilReady(service);
    expect(await files.listOwned()).toEqual([]);
    expect(store.value).not.toContain('statement.csv');
  });
});

describe('saved key', () => {
  it('is durable before the upload starts', async () => {
    const savedAtUpload: (string | null)[] = [];
    const service = launch({
      uploader: async () => {
        savedAtUpload.push(store.value);
        throw new Error('connection lost');
      },
    });
    await pickAndConfirm(service);
    expect(savedAtUpload).toHaveLength(1);
    expect(JSON.parse(savedAtUpload[0] as string).idempotencyKey).toEqual(service.getState().operation?.idempotencyKey);
  });

  it('does not send when the key cannot be saved', async () => {
    const service = launch();
    await service.acceptPicked({ path: files.copyFixture(join(FIXTURES, 'statement.csv')), name: 'statement.csv' });
    store.failNextSave = true;
    await service.confirmDraft();
    expect((await mock.state()).stats.createRequests).toBe(0);
    expect(service.getState().operation).toBeNull();
    expect(service.getState().draft).not.toBeNull();
  });
});

describe('double tap', () => {
  it('on confirm creates one key and one job', async () => {
    const service = launch();
    await service.acceptPicked({ path: files.copyFixture(join(FIXTURES, 'statement.csv')), name: 'statement.csv' });
    await Promise.all([service.confirmDraft(), service.confirmDraft()]);
    await untilReady(service);
    const { stats } = await mock.state();
    expect(stats.createRequests).toBe(1);
    expect(stats.newJobs).toBe(1);
  });

  it('on delete sends one request', async () => {
    const service = launch();
    await pickAndConfirm(service);
    await untilReady(service);
    await Promise.all([service.requestDelete(), service.requestDelete()]);
    expect((await mock.state()).stats.deleteRequests).toBe(1);
  });
});

describe('lost_ack', () => {
  it('recovers by key without a second job', async () => {
    await mock.scenario('lost_ack');
    const service = launch();
    await pickAndConfirm(service);
    await untilReady(service);
    const { stats } = await mock.state();
    expect(stats.newJobs).toBe(1);
    expect(stats.createRequests).toBe(1);
  });

  it('after a relaunch shows the job and never re-sends on its own', async () => {
    await mock.scenario('lost_ack');
    let serverAnswered = false;
    const first = launch({
      uploader: async request => {
        await fetch(request.url, { method: 'POST', headers: request.headers, body: readFileSync(request.path) }).catch(() => undefined);
        serverAnswered = true;
        return new Promise(() => undefined);
      },
    });
    await first.acceptPicked({ path: files.copyFixture(join(FIXTURES, 'statement.csv')), name: 'statement.csv' });
    void first.confirmDraft();
    await waitFor(() => serverAnswered);
    const key = first.getState().operation?.idempotencyKey as string;
    first.dispose();

    const second = launch();
    await second.start();
    await untilReady(second);
    const { stats } = await mock.state();
    expect(second.getState().operation?.idempotencyKey).toBe(key);
    expect(stats.newJobs).toBe(1);
    expect(stats.createRequests).toBe(1);
    expect(await files.listOwned()).toEqual([]);
  });

  it('a user retry with the same key and bytes reuses the job', async () => {
    const service = launch({
      uploader: async () => {
        throw new Error('connection lost before reaching the server');
      },
    });
    await pickAndConfirm(service);
    await waitFor(() => service.getState().operation?.recovery === 'notFound');
    expect(service.getState().operation?.phase).toBe('uncertain');
    const key = service.getState().operation?.idempotencyKey;
    service.dispose();

    const relaunched = launch();
    await relaunched.start();
    expect(relaunched.getState().operation?.recovery).toBe('notFound');
    expect((await mock.state()).stats.createRequests).toBe(0);

    await relaunched.retrySend();
    await untilReady(relaunched);
    expect(relaunched.getState().operation?.idempotencyKey).toBe(key);
    expect((await mock.state()).stats.newJobs).toBe(1);
  });

  it('reports a lost local copy instead of sending something else', async () => {
    const service = launch({
      uploader: async () => {
        throw new Error('connection lost');
      },
    });
    await pickAndConfirm(service);
    await waitFor(() => service.getState().operation?.recovery === 'notFound');
    await files.remove(service.getState().operation?.tempPath as string);
    await service.retrySend();
    expect(service.getState().operation?.phase).toBe('failed');
    expect(service.getState().operation?.failure).toBe('localCopyLost');
  });
});

describe('stale_status', () => {
  it('stays on ready/revision 3 when processing/revision 2 arrives', async () => {
    const service = launch();
    await pickAndConfirm(service);
    await untilReady(service);
    service.dispose();

    await mock.scenario('stale_status');
    const records: LogRecord[] = [];
    const relaunched = launch({ records });
    await relaunched.start();
    await relaunched.refresh();
    expect(records.filter(record => record.event === 'stale_view_ignored').map(record => record.fields?.revision)).toContain(2);
    expect(relaunched.getState().operation?.view).toMatchObject({ status: 'ready', revision: 3 });
    expect(relaunched.getState().operation?.view?.items).toHaveLength(2);
  });

  it('survives the repeated POST answer queued/revision 1', async () => {
    const service = launch();
    await pickAndConfirm(service);
    await untilReady(service);
    const operation = service.getState().operation;
    const original = readFileSync(join(FIXTURES, 'statement.csv'));
    const replay = await fetch(`${mock.baseUrl}/imports`, {
      method: 'POST',
      headers: { 'Idempotency-Key': operation?.idempotencyKey as string, 'X-File-Name': 'x.csv' },
      body: original,
    });
    expect(await replay.json()).toMatchObject({ status: 'queued', revision: 1 });
    await service.refresh();
    expect(service.getState().operation?.view?.status).toBe('ready');
    expect((await mock.state()).stats.duplicateHits).toBe(1);
  });
});

describe('delete_failure', () => {
  it('does not claim deletion on 503, then the same key reaches deleted', async () => {
    const service = launch();
    await pickAndConfirm(service);
    await untilReady(service);

    await mock.scenario('delete_failure');
    await service.requestDelete();
    const refused = service.getState().operation;
    expect(refused?.phase).toBe('deleteRequested');
    expect(refused?.deleteOutcome).toBe('refused');
    expect(refused?.view?.status).toBe('ready');
    expect((await mock.state()).jobs[0].status).toBe('ready');

    await mock.scenario('happy');
    await service.requestDelete();
    expect(service.getState().operation?.deleteKey).toBe(refused?.deleteKey);
    expect(service.getState().operation?.phase).toBe('deleteRequested');
    await waitFor(() => service.getState().operation?.phase === 'deleted');
    expect((await mock.state()).jobs[0].status).toBe('deleted');
  });

  it('after a relaunch reports an unknown outcome rather than a deletion', async () => {
    const service = launch();
    await pickAndConfirm(service);
    await untilReady(service);
    await mock.scenario('delete_failure');
    await service.requestDelete();
    service.dispose();
    const saved = JSON.parse(store.value as string);
    store.value = JSON.stringify({ ...saved, deleteOutcome: 'pending' });

    const relaunched = launch();
    await relaunched.start();
    expect(relaunched.getState().operation?.deleteOutcome).toBe('unknown');
    expect(relaunched.getState().operation?.phase).toBe('deleteRequested');
  });
});

describe('deleted job', () => {
  async function deleted() {
    const service = launch();
    await pickAndConfirm(service);
    await untilReady(service);
    await service.requestDelete();
    await waitFor(() => service.getState().operation?.phase === 'deleted');
    return service;
  }

  it('a late response does not bring it back', async () => {
    let holdNextGet = false;
    let release: () => void = () => undefined;
    let held = false;
    const service = launch({
      onResponse: async response => {
        if (holdNextGet && response.config.method === 'get') {
          holdNextGet = false;
          held = true;
          await new Promise<void>(resolve => {
            release = resolve;
          });
        }
      },
    });
    await pickAndConfirm(service);
    await untilReady(service);

    holdNextGet = true;
    const lateRefresh = service.refresh();
    await waitFor(() => held);
    await service.requestDelete();
    await waitFor(() => service.getState().operation?.phase === 'deleted');

    release();
    await lateRefresh;
    expect(service.getState().operation?.phase).toBe('deleted');
    expect(service.getState().operation?.view?.status).toBe('deleted');
  });

  it('a repeated POST answer does not bring it back', async () => {
    const service = await deleted();
    const operation = service.getState().operation as IOperation;
    const jobId = operation.jobId as string;
    expect(applyServerView(operation, { jobId, status: 'queued', revision: 1 })).toBe(operation);
    expect(applyServerView(operation, { jobId, status: 'ready', revision: 9 })).toBe(operation);
  });

  it('stays deleted after a relaunch', async () => {
    const service = await deleted();
    service.dispose();
    const relaunched = launch();
    await relaunched.start();
    expect(relaunched.getState().operation?.phase).toBe('deleted');
  });
});

describe('local rejection', () => {
  async function createRequests() {
    return (await mock.state()).stats.createRequests;
  }

  it('rejects spoofed.pdf before any POST and removes the copy', async () => {
    const service = launch();
    await service.acceptPicked({ path: files.copyFixture(join(FIXTURES, 'spoofed.pdf')), name: 'spoofed.pdf' });
    expect(service.getState().rejection).toBe('unsupportedContent');
    expect(service.getState().draft).toBeNull();
    await service.confirmDraft();
    expect(await createRequests()).toBe(0);
    expect(await files.listOwned()).toEqual([]);
  });

  it('rejects a file over 10 MiB before any POST and removes the copy', async () => {
    const service = launch();
    const path = join(files.directory, 'oversize-source');
    writeFileSync(path, 'date,description,amount\n');
    truncateSync(path, MAX_FILE_BYTES + 1);
    await service.acceptPicked({ path, name: 'oversize.csv' });
    expect(service.getState().rejection).toBe('tooLarge');
    await service.confirmDraft();
    expect(await createRequests()).toBe(0);
    expect(await files.listOwned()).toEqual([]);
  });

  it('accepts a file of exactly 10 MiB', async () => {
    const service = launch();
    const path = join(files.directory, 'limit-source');
    writeFileSync(path, 'date,description,amount\n');
    truncateSync(path, MAX_FILE_BYTES);
    await service.acceptPicked({ path, name: 'limit.csv' });
    expect(service.getState().rejection).toBeNull();
    expect(service.getState().draft?.byteSize).toBe(MAX_FILE_BYTES);
  });

  it('removes the copy when the file cannot be inspected', async () => {
    const service = launch();
    const path = files.copyFixture(join(FIXTURES, 'statement.csv'));
    const readHead = jest.spyOn(files, 'readHead').mockRejectedValueOnce(new Error('read failed'));
    await expect(service.acceptPicked({ path, name: 'statement.csv' })).rejects.toThrow('read failed');
    readHead.mockRestore();
    expect(await files.listOwned()).toEqual([]);
    expect(service.getState().draft).toBeNull();
  });

  it('removes the copy when the user cancels before sending', async () => {
    const service = launch();
    await service.acceptPicked({ path: files.copyFixture(join(FIXTURES, 'statement.csv')), name: 'statement.csv' });
    expect(await files.listOwned()).toHaveLength(1);
    await service.cancelDraft();
    expect(await files.listOwned()).toEqual([]);
  });

  it('sweeps copies left by a killed process on start', async () => {
    files.copyFixture(join(FIXTURES, 'statement.csv'));
    await launch().start();
    expect(await files.listOwned()).toEqual([]);
  });
});

describe('privacy', () => {
  it('logs no file name or content across the whole flow', async () => {
    const records: LogRecord[] = [];
    const service = launch({ records });
    const name = 'very-private-name.csv';
    await service.acceptPicked({ path: files.copyFixture(join(FIXTURES, 'statement.csv')), name });
    await service.confirmDraft();
    await untilReady(service);
    await service.requestDelete();
    await waitFor(() => service.getState().operation?.phase === 'deleted');

    const output = JSON.stringify(records);
    expect(records.length).toBeGreaterThan(3);
    for (const secret of [name, 'StreamBeam', 'BrightGrid', '19.99', 'date,description']) {
      expect(output).not.toContain(secret);
    }
  });
});
