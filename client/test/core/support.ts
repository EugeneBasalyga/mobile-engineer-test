import { spawn, type ChildProcess } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, openSync, readFileSync, readSync, closeSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

import { type AxiosResponse } from 'axios';

import {
  type IImportOperationRepository,
  type IOperation,
  type IStatementFileRepository,
  type IUploadRequest,
  type IUploadResponse,
  type PickResult,
} from '@/packages/statementImport/models/statementImport';
import StatementImportRepository from '@/packages/statementImport/repositories/statementImport';
import StatementImportService from '@/packages/statementImport/services/statementImport';
import { type IImportLogFields, type ImportLogEvent } from '@/packages/statementImport/utils/logger';

export const FIXTURES = join(__dirname, '../../../kit/fixtures');

export type Mock = {
  baseUrl: string;
  scenario(mode: string): Promise<void>;
  reset(): Promise<void>;
  state(): Promise<{ stats: Record<string, number>; jobs: { status: string; sha256: string; bytes: number }[] }>;
  stop(): Promise<void>;
};

export async function startMock(): Promise<Mock> {
  const directory = mkdtempSync(join(tmpdir(), 'import-test-mock-'));
  const child: ChildProcess = spawn(process.execPath, [join(__dirname, 'mockHarness.mjs'), join(directory, 'state.json')], {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const port = await new Promise<number>((resolve, reject) => {
    child.stdout!.once('data', chunk => resolve(Number(String(chunk).trim())));
    child.once('exit', code => reject(new Error(`mock exited: ${code}`)));
  });
  const baseUrl = `http://127.0.0.1:${port}`;
  const post = (path: string, body?: unknown) =>
    fetch(`${baseUrl}${path}`, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  return {
    baseUrl,
    scenario: async mode => void (await post('/__test/scenario', { mode })),
    reset: async () => void (await post('/__test/reset')),
    state: async () => (await fetch(`${baseUrl}/__test/state`)).json() as never,
    stop: async () => {
      child.removeAllListeners('exit');
      await new Promise(resolve => {
        child.once('exit', resolve);
        child.kill();
      });
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

export class MemoryStore implements IImportOperationRepository {
  value: string | null = null;
  failNextSave = false;

  getOperation() {
    return this.value ? (JSON.parse(this.value) as IOperation) : null;
  }

  saveOperation(operation: IOperation) {
    if (this.failNextSave) {
      this.failNextSave = false;
      throw new Error('disk full');
    }
    this.value = JSON.stringify(operation);
  }

  removeOperation() {
    this.value = null;
  }
}

export class DiskFiles implements IStatementFileRepository {
  readonly directory = mkdtempSync(join(tmpdir(), 'import-test-files-'));

  copyFixture(source: string): string {
    const path = join(this.directory, `picked-${randomUUID()}`);
    copyFileSync(source, path);
    return path;
  }

  async size(path: string) {
    return statSync(path).size;
  }

  async readHead(path: string, length: number) {
    const descriptor = openSync(path, 'r');
    const buffer = Buffer.alloc(length);
    const read = readSync(descriptor, buffer, 0, length, 0);
    closeSync(descriptor);
    return new Uint8Array(buffer.subarray(0, read));
  }

  async adopt(path: string, baseName: string, format: string) {
    const target = join(this.directory, `${baseName}.${format}`);
    renameSync(path, target);
    return target;
  }

  async exists(path: string) {
    return existsSync(path);
  }

  async remove(path: string) {
    rmSync(path, { force: true });
  }

  async listOwned() {
    return readdirSync(this.directory).map(name => join(this.directory, name));
  }

  async pick(): Promise<PickResult> {
    return { kind: 'canceled' };
  }

  upload(request: IUploadRequest) {
    return fetchUploader(request);
  }

  cleanup() {
    rmSync(this.directory, { recursive: true, force: true });
  }
}

export type Uploader = (request: IUploadRequest) => Promise<IUploadResponse>;

export async function fetchUploader({ headers, path, url }: IUploadRequest) {
  const response = await fetch(url, { method: 'POST', headers, body: readFileSync(path) });
  return { status: response.status, body: await response.text() };
}

export type LogRecord = { event: ImportLogEvent; fields?: IImportLogFields };

type ServiceOptions = {
  uploader?: Uploader;
  onResponse?: (response: AxiosResponse) => Promise<void>;
  records?: LogRecord[];
};

export function createService(
  baseUrl: string,
  store: IImportOperationRepository,
  files: IStatementFileRepository,
  options: ServiceOptions = {},
) {
  const repository = new StatementImportRepository(baseUrl, { upload: options.uploader ?? fetchUploader });
  const { onResponse } = options;
  if (onResponse) {
    repository.http.addResponseInterceptor(async response => {
      await onResponse(response);
      return response;
    });
  }
  return new StatementImportService(
    repository,
    files,
    store,
    (event, fields) => options.records?.push({ event, fields }),
    randomUUID,
    50,
  );
}

export async function waitFor(condition: () => boolean, timeoutMs = 5000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error('waitFor timed out');
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}
