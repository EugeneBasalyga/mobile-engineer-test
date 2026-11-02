import {
  applyServerView,
  isSettled,
  type Failure,
  type Operation,
  type ServerView,
} from '@/packages/statementImport/core/operation';
import {
  detectFormat,
  exceedsLimit,
  HEAD_BYTES,
  type FileFormat,
  type Rejection,
} from '@/packages/statementImport/core/validateFile';

import type { ImportApi } from '@/packages/statementImport/api/client';
import type { Logger } from '@/packages/statementImport/core/log';

export type OperationStore = {
  load(): Promise<Operation | null>;
  save(operation: Operation | null): Promise<void>;
};

export type LocalFiles = {
  /** Moves a picked file into the app's private import folder and returns the new path. */
  adopt(path: string, baseName: string, format: FileFormat): Promise<string>;
  exists(path: string): Promise<boolean>;
  listOwned(): Promise<string[]>;
  readHead(path: string, length: number): Promise<Uint8Array>;
  remove(path: string): Promise<void>;
  size(path: string): Promise<number>;
};

export type PickedFile = { name: string; path: string; declaredSize?: number };
export type Draft = {
  byteSize: number;
  draftId: string;
  format: FileFormat;
  name: string;
  tempPath: string;
};

export type CoordinatorState = {
  busy: boolean;
  /** True when the last refresh failed, so the shown status may be out of date. */
  connectionLost: boolean;
  draft: Draft | null;
  operation: Operation | null;
  ready: boolean;
  rejection: Rejection | null;
};

export type CoordinatorDeps = {
  api: ImportApi;
  files: LocalFiles;
  log: Logger;
  newId: () => string;
  pollIntervalMs: number;
  store: OperationStore;
};

const INITIAL_STATE: CoordinatorState = {
  busy: false,
  connectionLost: false,
  draft: null,
  operation: null,
  ready: false,
  rejection: null,
};

const withoutLocalFile = (operation: Operation) => {
  const rest = { ...operation };
  const { tempPath } = operation;

  delete rest.fileName;
  delete rest.tempPath;

  return { rest, tempPath };
};

export class ImportCoordinator {
  private state = INITIAL_STATE;
  private listeners = new Set<() => void>();
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;
  private saveChain: Promise<void> = Promise.resolve();

  constructor(private readonly deps: CoordinatorDeps) {}

  getState = (): CoordinatorState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Restores the saved operation. It only ever reads from the server; it never sends the file. */
  async start(): Promise<void> {
    const operation = await this.deps.store.load();
    this.setState({ operation, ready: true });
    await this.removeOrphanCopies(operation);
    if (!operation) return;
    if (operation.jobId) {
      await this.refresh();
    } else if (operation.phase === 'sending' || operation.phase === 'uncertain') {
      await this.recover();
    }
  }

  dispose(): void {
    this.disposed = true;
    this.stopPolling();
    this.listeners.clear();
  }

  async acceptPicked(picked: PickedFile): Promise<void> {
    const rejection = await this.inspect(picked);
    if (rejection) {
      await this.removeCopy(picked.path);
      this.deps.log('file_rejected');
      this.setState({ draft: null, rejection });
      return;
    }
    const byteSize = await this.deps.files.size(picked.path);
    const head = await this.deps.files.readHead(picked.path, HEAD_BYTES);
    const format = detectFormat(head) as FileFormat;
    const draftId = this.deps.newId();
    const tempPath = await this.deps.files.adopt(picked.path, draftId, format);
    this.setState({
      draft: { byteSize, draftId, format, name: picked.name, tempPath },
      rejection: null,
    });
  }

  async cancelDraft(): Promise<void> {
    const draft = this.state.draft;
    this.setState({ draft: null, rejection: null });
    if (draft) await this.removeCopy(draft.tempPath);
  }

  clearRejection(): void {
    this.setState({ rejection: null });
  }

  /** For a file the picker already reports as too large, so it is never copied at all. */
  rejectTooLarge(): void {
    this.deps.log('file_rejected');
    this.setState({ draft: null, rejection: 'tooLarge' });
  }

  /** The key is durable before the first byte leaves the device; a failed save means no POST. */
  async confirmDraft(): Promise<void> {
    const draft = this.state.draft;
    if (!draft || this.state.operation) return;
    // Taken synchronously: a double tap must not create a second key, and so a second job.
    this.setState({ busy: true, draft: null });
    const operation: Operation = {
      byteSize: draft.byteSize,
      fileName: draft.name,
      format: draft.format,
      idempotencyKey: this.deps.newId(),
      opId: draft.draftId,
      phase: 'sending',
      tempPath: draft.tempPath,
    };
    try {
      await this.commit(operation);
    } catch {
      this.setState({ busy: false, draft, operation: null });
      return;
    }
    await this.send(operation.opId);
  }

  /** User-initiated retry after an unknown outcome: same key, same bytes. */
  async retrySend(): Promise<void> {
    const operation = this.state.operation;
    if (operation?.phase !== 'uncertain' || this.state.busy) return;
    this.setState({ busy: true });
    try {
      await this.commit({ ...operation, phase: 'sending', recovery: undefined });
    } catch {
      this.setState({ busy: false });
      return;
    }
    await this.send(operation.opId);
  }

  async recover(): Promise<void> {
    const operation = this.state.operation;
    if (!operation || operation.jobId) return;
    const opId = operation.opId;
    await this.commit({ ...operation, phase: 'uncertain', recovery: 'checking' });
    try {
      const result = await this.deps.api.findByKey(operation.idempotencyKey);
      if (!this.isCurrent(opId)) return;
      if (result.kind === 'found') {
        this.deps.log('import_recovered', { revision: result.view.revision });
        await this.receiveView(result.view);
        await this.afterJobKnown();
        this.schedulePoll();
      } else {
        await this.commit({ ...this.current(), recovery: 'notFound' });
      }
    } catch {
      if (this.isCurrent(opId)) await this.commit({ ...this.current(), recovery: 'unreachable' });
    }
  }

  /** GET is the authority on job state. Failure keeps the last known status and flags it as stale. */
  async refresh(): Promise<void> {
    const operation = this.state.operation;
    if (!operation?.jobId) return;
    const opId = operation.opId;
    try {
      const result = await this.deps.api.getJob(operation.jobId);
      if (!this.isCurrent(opId)) return;
      this.setState({ connectionLost: false });
      if (result.kind === 'notFound') {
        if (this.current().phase !== 'deleted') {
          await this.commit({ ...this.current(), phase: 'missingOnServer' });
        }
      } else {
        await this.receiveView(result.view);
        await this.noteUnconfirmedDelete();
      }
    } catch {
      if (this.isCurrent(opId)) this.setState({ connectionLost: true });
    }
    if (this.isCurrent(opId)) this.schedulePoll();
  }

  /** Also serves as the retry: the delete key is created once and then reused. */
  async requestDelete(): Promise<void> {
    const operation = this.state.operation;
    if (!operation?.jobId || operation.phase === 'deleted' || this.state.busy) return;
    if (operation.view?.status === 'deleting') return;
    const opId = operation.opId;
    const deleteKey = operation.deleteKey ?? this.deps.newId();
    this.setState({ busy: true });
    try {
      await this.commit({
        ...operation,
        deleteKey,
        deleteOutcome: 'pending',
        phase: 'deleteRequested',
      });
      this.deps.log('delete_requested');
      const result = await this.deps.api.deleteJob(operation.jobId, deleteKey);
      if (!this.isCurrent(opId)) return;
      if (result.kind === 'accepted') {
        await this.receiveView(result.view);
      } else if (result.kind === 'notFound') {
        await this.commit({
          ...this.current(),
          deleteOutcome: undefined,
          phase: 'missingOnServer',
        });
      } else {
        this.deps.log('delete_refused', { httpStatus: result.status });
        await this.commit({ ...this.current(), deleteOutcome: 'refused' });
      }
    } catch {
      if (this.isCurrent(opId)) await this.commit({ ...this.current(), deleteOutcome: 'unknown' });
    } finally {
      this.setState({ busy: false });
    }
    if (this.isCurrent(opId)) this.schedulePoll();
  }

  /** Forgets the local record and copy. Server data is untouched and the UI must say so first. */
  async dismiss(): Promise<void> {
    const operation = this.state.operation;
    this.stopPolling();
    this.setState({ connectionLost: false });
    await this.commit(null);
    if (operation?.tempPath) await this.removeCopy(operation.tempPath);
  }

  private async inspect(picked: PickedFile): Promise<Rejection | null> {
    if (picked.declaredSize !== undefined && exceedsLimit(picked.declaredSize)) return 'tooLarge';
    const byteSize = await this.deps.files.size(picked.path);
    if (exceedsLimit(byteSize)) return 'tooLarge';
    if (byteSize === 0) return 'empty';
    const head = await this.deps.files.readHead(picked.path, HEAD_BYTES);
    return detectFormat(head) ? null : 'unsupportedContent';
  }

  private async send(opId: string): Promise<void> {
    const operation = this.current();
    const { fileName, idempotencyKey, tempPath } = operation;
    if (!tempPath || !(await this.deps.files.exists(tempPath))) {
      this.setState({ busy: false });
      await this.fail(opId, 'localCopyLost');
      return;
    }
    this.setState({ busy: true });
    this.deps.log('import_sent');
    try {
      const result = await this.deps.api.create(tempPath, idempotencyKey, fileName ?? '');
      if (!this.isCurrent(opId)) return;
      this.setState({ busy: false });
      if (result.kind === 'accepted') {
        this.deps.log('import_accepted', { revision: result.view.revision });
        await this.receiveView(result.view);
        await this.afterJobKnown();
        this.schedulePoll();
      } else {
        this.deps.log(
          'import_refused',
          'status' in result ? { httpStatus: result.status } : undefined
        );
        const failures: Record<typeof result.kind, Failure> = {
          conflict: 'conflict',
          rejected: 'rejectedByServer',
          tooLarge: 'tooLargeForServer',
          unexpected: 'unexpected',
        };
        await this.fail(opId, failures[result.kind]);
      }
    } catch {
      if (!this.isCurrent(opId)) return;
      this.setState({ busy: false });
      this.deps.log('import_outcome_unknown');
      await this.recover();
    }
  }

  private async fail(opId: string, failure: Failure): Promise<void> {
    if (!this.isCurrent(opId)) return;
    const { rest, tempPath } = withoutLocalFile(this.current());
    await this.commit({ ...rest, failure, phase: 'failed' });
    if (tempPath) await this.removeCopy(tempPath);
  }

  private async receiveView(view: ServerView): Promise<void> {
    const before = this.current();
    const after = applyServerView(before, view);
    if (after === before) {
      this.deps.log('stale_view_ignored', { revision: view.revision });
      return;
    }
    if (after.phase === 'deleted') this.deps.log('delete_confirmed', { revision: view.revision });
    await this.commit(after);
  }

  /** After a relaunch the DELETE result is gone, so a live job means we do not know its outcome. */
  private async noteUnconfirmedDelete(): Promise<void> {
    const operation = this.current();
    if (
      operation.phase === 'deleteRequested' &&
      operation.deleteOutcome === 'pending' &&
      operation.view?.status !== 'deleting' &&
      !this.state.busy
    ) {
      await this.commit({ ...operation, deleteOutcome: 'unknown' });
    }
  }

  /** The server holds the job now, so the local copy and the name have no further use. */
  private async afterJobKnown(): Promise<void> {
    const { rest, tempPath } = withoutLocalFile(this.current());
    await this.commit(rest);
    if (tempPath) await this.removeCopy(tempPath);
  }

  private async removeCopy(path: string): Promise<void> {
    try {
      await this.deps.files.remove(path);
      this.deps.log('copy_removed');
    } catch {
      // A leftover copy is swept on the next start.
    }
  }

  private async removeOrphanCopies(operation: Operation | null): Promise<void> {
    const owned = await this.deps.files.listOwned();
    await Promise.all(
      owned.filter((path) => path !== operation?.tempPath).map((path) => this.removeCopy(path))
    );
  }

  private schedulePoll(): void {
    this.stopPolling();
    const operation = this.state.operation;
    if (this.disposed || !operation?.jobId || isSettled(operation)) return;
    this.pollTimer = setTimeout(() => {
      this.pollTimer = null;
      void this.refresh();
    }, this.deps.pollIntervalMs);
  }

  private stopPolling(): void {
    if (this.pollTimer) clearTimeout(this.pollTimer);
    this.pollTimer = null;
  }

  private isCurrent(opId: string): boolean {
    return !this.disposed && this.state.operation?.opId === opId;
  }

  private current(): Operation {
    return this.state.operation as Operation;
  }

  private async commit(
    operation: Operation | null,
    extra: Partial<CoordinatorState> = {}
  ): Promise<void> {
    if (this.disposed) return;
    const saved = this.saveChain.then(() => this.deps.store.save(operation));
    this.saveChain = saved.catch(() => undefined);
    try {
      await saved;
    } catch (error) {
      this.deps.log('storage_failed');
      throw error;
    }
    if (!this.disposed) this.setState({ ...extra, operation });
  }

  private setState(patch: Partial<CoordinatorState>): void {
    if (this.disposed) return;
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }
}
