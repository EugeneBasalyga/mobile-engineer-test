import { createHash } from 'node:crypto';
import { readFileSync, truncateSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ImportCoordinator } from '@/packages/statementImport/core/importCoordinator';
import { applyServerView, type Operation } from '@/packages/statementImport/core/operation';
import { MAX_FILE_BYTES } from '@/packages/statementImport/core/validateFile';
import { createCoordinator, DiskFiles, FIXTURES, MemoryStore, startMock, waitFor, type LogRecord, type Mock } from './support';

let mock: Mock;
let files: DiskFiles;
let store: MemoryStore;
const running: ImportCoordinator[] = [];

function launch(options: Parameters<typeof createCoordinator>[3] = {}) {
  const coordinator = createCoordinator(mock.baseUrl, store, files, options);
  running.push(coordinator);
  return coordinator;
}

async function pickAndConfirm(coordinator: ImportCoordinator, fixture = 'statement.csv') {
  await coordinator.acceptPicked({ path: files.pick(join(FIXTURES, fixture)), name: fixture });
  await coordinator.confirmDraft();
}

const untilReady = (coordinator: ImportCoordinator) =>
  waitFor(() => coordinator.getState().operation?.view?.status === 'ready');

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
  running.splice(0).forEach(coordinator => coordinator.dispose());
  files.cleanup();
});

describe('happy', () => {
  it.each(['statement.csv', 'statement.pdf'])('sends the real bytes of %s and shows data only after ready', async fixture => {
    const coordinator = launch();
    const statuses: (string | undefined)[] = [];
    coordinator.subscribe(() => statuses.push(coordinator.getState().operation?.view?.status));
    await pickAndConfirm(coordinator, fixture);
    await untilReady(coordinator);

    const bytes = readFileSync(join(FIXTURES, fixture));
    const state = await mock.state();
    expect(state.jobs[0].sha256).toBe(createHash('sha256').update(bytes).digest('hex'));
    expect(state.jobs[0].bytes).toBe(bytes.length);
    expect(state.stats.newJobs).toBe(1);
    expect(statuses[statuses.findIndex(Boolean)]).toBe('queued');
    expect(coordinator.getState().operation?.view?.items?.map(item => item.id)).toEqual(['rec-001', 'rec-002']);
  });

  it('removes the private copy and the file name once the job is known', async () => {
    const coordinator = launch();
    await pickAndConfirm(coordinator);
    await untilReady(coordinator);
    expect(await files.listOwned()).toEqual([]);
    expect(store.value).not.toContain('statement.csv');
  });
});

describe('saved key', () => {
  it('is durable before the upload starts', async () => {
    const savedAtUpload: (string | null)[] = [];
    const coordinator = launch({
      uploader: async () => {
        savedAtUpload.push(store.value);
        throw new Error('connection lost');
      },
    });
    await pickAndConfirm(coordinator);
    expect(savedAtUpload).toHaveLength(1);
    expect(JSON.parse(savedAtUpload[0] as string).idempotencyKey).toEqual(coordinator.getState().operation?.idempotencyKey);
  });

  it('does not send when the key cannot be saved', async () => {
    const coordinator = launch();
    await coordinator.acceptPicked({ path: files.pick(join(FIXTURES, 'statement.csv')), name: 'statement.csv' });
    store.failNextSave = true;
    await coordinator.confirmDraft();
    expect((await mock.state()).stats.createRequests).toBe(0);
    expect(coordinator.getState().operation).toBeNull();
    expect(coordinator.getState().draft).not.toBeNull();
  });
});

describe('double tap', () => {
  it('on confirm creates one key and one job', async () => {
    const coordinator = launch();
    await coordinator.acceptPicked({ path: files.pick(join(FIXTURES, 'statement.csv')), name: 'statement.csv' });
    await Promise.all([coordinator.confirmDraft(), coordinator.confirmDraft()]);
    await untilReady(coordinator);
    const { stats } = await mock.state();
    expect(stats.createRequests).toBe(1);
    expect(stats.newJobs).toBe(1);
  });

  it('on delete sends one request', async () => {
    const coordinator = launch();
    await pickAndConfirm(coordinator);
    await untilReady(coordinator);
    await Promise.all([coordinator.requestDelete(), coordinator.requestDelete()]);
    expect((await mock.state()).stats.deleteRequests).toBe(1);
  });
});

describe('lost_ack', () => {
  it('recovers by key without a second job', async () => {
    await mock.scenario('lost_ack');
    const coordinator = launch();
    await pickAndConfirm(coordinator);
    await untilReady(coordinator);
    const { stats } = await mock.state();
    expect(stats.newJobs).toBe(1);
    expect(stats.createRequests).toBe(1);
  });

  it('after a relaunch shows the job and never re-sends on its own', async () => {
    await mock.scenario('lost_ack');
    let serverAnswered = false;
    const first = launch({
      // The process dies while the request is on the wire, so no client code sees its outcome.
      uploader: async request => {
        await fetch(request.url, { method: 'POST', headers: request.headers, body: readFileSync(request.path) }).catch(() => undefined);
        serverAnswered = true;
        return new Promise(() => undefined);
      },
    });
    await first.acceptPicked({ path: files.pick(join(FIXTURES, 'statement.csv')), name: 'statement.csv' });
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
    const coordinator = launch({
      uploader: async () => {
        throw new Error('connection lost before reaching the server');
      },
    });
    await pickAndConfirm(coordinator);
    await waitFor(() => coordinator.getState().operation?.recovery === 'notFound');
    expect(coordinator.getState().operation?.phase).toBe('uncertain');
    const key = coordinator.getState().operation?.idempotencyKey;
    coordinator.dispose();

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
    const coordinator = launch({
      uploader: async () => {
        throw new Error('connection lost');
      },
    });
    await pickAndConfirm(coordinator);
    await waitFor(() => coordinator.getState().operation?.recovery === 'notFound');
    await files.remove(coordinator.getState().operation?.tempPath as string);
    await coordinator.retrySend();
    expect(coordinator.getState().operation?.phase).toBe('failed');
    expect(coordinator.getState().operation?.failure).toBe('localCopyLost');
  });
});

describe('stale_status', () => {
  it('stays on ready/revision 3 when processing/revision 2 arrives', async () => {
    const coordinator = launch();
    await pickAndConfirm(coordinator);
    await untilReady(coordinator);
    coordinator.dispose();

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
    const coordinator = launch();
    await pickAndConfirm(coordinator);
    await untilReady(coordinator);
    const operation = coordinator.getState().operation;
    const original = readFileSync(join(FIXTURES, 'statement.csv'));
    const replay = await fetch(`${mock.baseUrl}/imports`, {
      method: 'POST',
      headers: { 'Idempotency-Key': operation?.idempotencyKey as string, 'X-File-Name': 'x.csv' },
      body: original,
    });
    expect(await replay.json()).toMatchObject({ status: 'queued', revision: 1 });
    await coordinator.refresh();
    expect(coordinator.getState().operation?.view?.status).toBe('ready');
    expect((await mock.state()).stats.duplicateHits).toBe(1);
  });
});

describe('delete_failure', () => {
  it('does not claim deletion on 503, then the same key reaches deleted', async () => {
    const coordinator = launch();
    await pickAndConfirm(coordinator);
    await untilReady(coordinator);

    await mock.scenario('delete_failure');
    await coordinator.requestDelete();
    const refused = coordinator.getState().operation;
    expect(refused?.phase).toBe('deleteRequested');
    expect(refused?.deleteOutcome).toBe('refused');
    expect(refused?.view?.status).toBe('ready');
    expect((await mock.state()).jobs[0].status).toBe('ready');

    await mock.scenario('happy');
    await coordinator.requestDelete();
    expect(coordinator.getState().operation?.deleteKey).toBe(refused?.deleteKey);
    expect(coordinator.getState().operation?.phase).toBe('deleteRequested');
    await waitFor(() => coordinator.getState().operation?.phase === 'deleted');
    expect((await mock.state()).jobs[0].status).toBe('deleted');
  });

  it('after a relaunch reports an unknown outcome rather than a deletion', async () => {
    const coordinator = launch();
    await pickAndConfirm(coordinator);
    await untilReady(coordinator);
    await mock.scenario('delete_failure');
    await coordinator.requestDelete();
    coordinator.dispose();
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
    const coordinator = launch();
    await pickAndConfirm(coordinator);
    await untilReady(coordinator);
    await coordinator.requestDelete();
    await waitFor(() => coordinator.getState().operation?.phase === 'deleted');
    return coordinator;
  }

  it('a late response does not bring it back', async () => {
    let holdNextGet = false;
    let release: () => void = () => undefined;
    let held = false;
    const coordinator = launch({
      fetcher: (async (input: RequestInfo | URL, init?: RequestInit) => {
        const response = await fetch(input, init);
        if (holdNextGet && init?.method !== 'DELETE') {
          holdNextGet = false;
          held = true;
          await new Promise<void>(resolve => {
            release = resolve;
          });
        }
        return response;
      }) as typeof fetch,
    });
    await pickAndConfirm(coordinator);
    await untilReady(coordinator);

    holdNextGet = true;
    const lateRefresh = coordinator.refresh();
    await waitFor(() => held);
    await coordinator.requestDelete();
    await waitFor(() => coordinator.getState().operation?.phase === 'deleted');

    release();
    await lateRefresh;
    expect(coordinator.getState().operation?.phase).toBe('deleted');
    expect(coordinator.getState().operation?.view?.status).toBe('deleted');
  });

  it('a repeated POST answer does not bring it back', async () => {
    const coordinator = await deleted();
    const operation = coordinator.getState().operation as Operation;
    const jobId = operation.jobId as string;
    expect(applyServerView(operation, { jobId, status: 'queued', revision: 1 })).toBe(operation);
    expect(applyServerView(operation, { jobId, status: 'ready', revision: 9 })).toBe(operation);
  });

  it('stays deleted after a relaunch', async () => {
    const coordinator = await deleted();
    coordinator.dispose();
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
    const coordinator = launch();
    await coordinator.acceptPicked({ path: files.pick(join(FIXTURES, 'spoofed.pdf')), name: 'spoofed.pdf' });
    expect(coordinator.getState().rejection).toBe('unsupportedContent');
    expect(coordinator.getState().draft).toBeNull();
    await coordinator.confirmDraft();
    expect(await createRequests()).toBe(0);
    expect(await files.listOwned()).toEqual([]);
  });

  it('rejects a file over 10 MiB before any POST and removes the copy', async () => {
    const coordinator = launch();
    const path = join(files.directory, 'oversize-source');
    writeFileSync(path, 'date,description,amount\n');
    truncateSync(path, MAX_FILE_BYTES + 1);
    await coordinator.acceptPicked({ path, name: 'oversize.csv' });
    expect(coordinator.getState().rejection).toBe('tooLarge');
    await coordinator.confirmDraft();
    expect(await createRequests()).toBe(0);
    expect(await files.listOwned()).toEqual([]);
  });

  it('accepts a file of exactly 10 MiB', async () => {
    const coordinator = launch();
    const path = join(files.directory, 'limit-source');
    writeFileSync(path, 'date,description,amount\n');
    truncateSync(path, MAX_FILE_BYTES);
    await coordinator.acceptPicked({ path, name: 'limit.csv' });
    expect(coordinator.getState().rejection).toBeNull();
    expect(coordinator.getState().draft?.byteSize).toBe(MAX_FILE_BYTES);
  });

  it('removes the copy when the user cancels before sending', async () => {
    const coordinator = launch();
    await coordinator.acceptPicked({ path: files.pick(join(FIXTURES, 'statement.csv')), name: 'statement.csv' });
    expect(await files.listOwned()).toHaveLength(1);
    await coordinator.cancelDraft();
    expect(await files.listOwned()).toEqual([]);
  });

  it('sweeps copies left by a killed process on start', async () => {
    files.pick(join(FIXTURES, 'statement.csv'));
    await launch().start();
    expect(await files.listOwned()).toEqual([]);
  });
});

describe('privacy', () => {
  it('logs no file name or content across the whole flow', async () => {
    const records: LogRecord[] = [];
    const coordinator = launch({ records });
    const name = 'very-private-name.csv';
    await coordinator.acceptPicked({ path: files.pick(join(FIXTURES, 'statement.csv')), name });
    await coordinator.confirmDraft();
    await untilReady(coordinator);
    await coordinator.requestDelete();
    await waitFor(() => coordinator.getState().operation?.phase === 'deleted');

    const output = JSON.stringify(records);
    expect(records.length).toBeGreaterThan(3);
    for (const secret of [name, 'StreamBeam', 'BrightGrid', '19.99', 'date,description']) {
      expect(output).not.toContain(secret);
    }
  });
});
