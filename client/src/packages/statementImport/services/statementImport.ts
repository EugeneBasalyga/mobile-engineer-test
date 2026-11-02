import {
  FILE_HEAD_BYTES,
  POLL_INTERVAL_MS,
} from '@/packages/statementImport/constants/statementImport';
import {
  type FileFormat,
  type FileRejection,
  type IImportOperationRepository,
  type IOperation,
  type IPickedFile,
  type IServerView,
  type IStatementFileRepository,
  type IStatementImportRepository,
  type IStatementImportState,
  type OperationFailure,
} from '@/packages/statementImport/models/statementImport';
import { detectFileFormat, isFileTooLarge } from '@/packages/statementImport/utils/file';
import { type ImportLogger } from '@/packages/statementImport/utils/logger';
import {
  applyServerView,
  isOperationSettled,
  withoutLocalFile,
} from '@/packages/statementImport/utils/operation';

const INITIAL_STATE: IStatementImportState = {
  busy: false,
  connectionLost: false,
  draft: null,
  operation: null,
  pickFailed: false,
  ready: false,
  rejection: null,
};

class StatementImportService {
  public statementImportRepository: IStatementImportRepository;

  public statementFileRepository: IStatementFileRepository;

  public importOperationRepository: IImportOperationRepository;

  public log: ImportLogger;

  public generateId: () => string;

  public pollIntervalMs: number;

  private state = INITIAL_STATE;

  private listeners = new Set<() => void>();

  private pollTimer: ReturnType<typeof setTimeout> | null = null;

  private disposed = false;

  constructor(
    statementImportRepository: IStatementImportRepository,
    statementFileRepository: IStatementFileRepository,
    importOperationRepository: IImportOperationRepository,
    log: ImportLogger,
    generateId: () => string,
    pollIntervalMs = POLL_INTERVAL_MS
  ) {
    this.statementImportRepository = statementImportRepository;
    this.statementFileRepository = statementFileRepository;
    this.importOperationRepository = importOperationRepository;
    this.log = log;
    this.generateId = generateId;
    this.pollIntervalMs = pollIntervalMs;

    this.getState = this.getState.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.start = this.start.bind(this);
    this.dispose = this.dispose.bind(this);
    this.pickFile = this.pickFile.bind(this);
    this.acceptPicked = this.acceptPicked.bind(this);
    this.cancelDraft = this.cancelDraft.bind(this);
    this.confirmDraft = this.confirmDraft.bind(this);
    this.retrySend = this.retrySend.bind(this);
    this.recover = this.recover.bind(this);
    this.refresh = this.refresh.bind(this);
    this.requestDelete = this.requestDelete.bind(this);
    this.dismiss = this.dismiss.bind(this);
  }

  getState() {
    return this.state;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  async start() {
    const operation = this.importOperationRepository.getOperation();

    this.setState({ operation, ready: true });

    await this.removeOrphanFiles(operation);

    if (!operation) {
      return;
    }

    if (operation.jobId) {
      await this.refresh();
    } else if (operation.phase === 'sending' || operation.phase === 'uncertain') {
      await this.recover();
    }
  }

  dispose() {
    this.disposed = true;
    this.stopPolling();
    this.listeners.clear();
  }

  async pickFile() {
    this.setState({ pickFailed: false, rejection: null });

    try {
      const result = await this.statementFileRepository.pick();

      if (result.kind === 'tooLarge') {
        this.rejectFile('tooLarge');
      } else if (result.kind === 'picked') {
        await this.acceptPicked(result.file);
      }
    } catch {
      this.setState({ pickFailed: true });
    }
  }

  async acceptPicked(picked: IPickedFile) {
    let rejection: FileRejection | null;

    try {
      rejection = await this.validateFile(picked);
    } catch (error) {
      await this.removeCopy(picked.path);

      throw error;
    }

    if (rejection) {
      await this.removeCopy(picked.path);
      this.rejectFile(rejection);

      return;
    }

    const byteSize = await this.statementFileRepository.size(picked.path);
    const head = await this.statementFileRepository.readHead(picked.path, FILE_HEAD_BYTES);
    const format = detectFileFormat(head) as FileFormat;
    const draftId = this.generateId();
    const tempPath = await this.statementFileRepository.adopt(picked.path, draftId, format);

    this.setState({
      draft: { byteSize, draftId, format, name: picked.name, tempPath },
      rejection: null,
    });
  }

  async cancelDraft() {
    const { draft } = this.state;

    this.setState({ draft: null, rejection: null });

    if (draft) {
      await this.removeCopy(draft.tempPath);
    }
  }

  async confirmDraft() {
    const { draft, operation: currentOperation } = this.state;

    if (!draft || currentOperation) {
      return;
    }

    // synchronously, otherwise a double tap creates a second key and a second job
    this.setState({ busy: true, draft: null });

    const operation: IOperation = {
      byteSize: draft.byteSize,
      fileName: draft.name,
      format: draft.format,
      idempotencyKey: this.generateId(),
      opId: draft.draftId,
      phase: 'sending',
      tempPath: draft.tempPath,
    };

    try {
      this.commit(operation);
    } catch {
      this.setState({ busy: false, draft });

      return;
    }

    await this.send(operation.opId);
  }

  async retrySend() {
    const { busy, operation } = this.state;

    if (operation?.phase !== 'uncertain' || busy) {
      return;
    }

    this.setState({ busy: true });

    try {
      this.commit({ ...operation, phase: 'sending', recovery: undefined });
    } catch {
      this.setState({ busy: false });

      return;
    }

    await this.send(operation.opId);
  }

  async recover() {
    const { operation } = this.state;

    if (!operation || operation.jobId) {
      return;
    }

    const { idempotencyKey, opId } = operation;

    this.commit({ ...operation, phase: 'uncertain', recovery: 'checking' });

    try {
      const result = await this.statementImportRepository.findImportByKey(idempotencyKey);

      if (!this.isCurrent(opId)) {
        return;
      }

      if (result.kind === 'found') {
        this.log('import_recovered', { revision: result.view.revision });
        this.applyView(result.view);
        await this.dropLocalFile();
        this.schedulePoll();
      } else {
        this.commit({ ...this.getCurrent(), recovery: 'notFound' });
      }
    } catch {
      if (this.isCurrent(opId)) {
        this.commit({ ...this.getCurrent(), recovery: 'unreachable' });
      }
    }
  }

  async refresh() {
    const { operation } = this.state;

    if (!operation?.jobId) {
      return;
    }

    const { opId } = operation;

    try {
      const result = await this.statementImportRepository.getImport(operation.jobId);

      if (!this.isCurrent(opId)) {
        return;
      }

      this.setState({ connectionLost: false });

      if (result.kind === 'found') {
        this.applyView(result.view);
        this.markDeleteUnknown();
      } else if (this.getCurrent().phase !== 'deleted') {
        this.commit({ ...this.getCurrent(), phase: 'missingOnServer' });
      }
    } catch {
      if (this.isCurrent(opId)) {
        this.setState({ connectionLost: true });
      }
    }

    if (this.isCurrent(opId)) {
      this.schedulePoll();
    }
  }

  async requestDelete() {
    const { busy, operation } = this.state;

    if (!operation?.jobId || operation.phase === 'deleted' || busy) {
      return;
    }

    if (operation.view?.status === 'deleting') {
      return;
    }

    const { opId } = operation;
    const deleteKey = operation.deleteKey ?? this.generateId();

    this.setState({ busy: true });

    try {
      this.commit({
        ...operation,
        deleteKey,
        deleteOutcome: 'pending',
        phase: 'deleteRequested',
      });
      this.log('delete_requested');

      const result = await this.statementImportRepository.deleteImport(operation.jobId, deleteKey);

      if (!this.isCurrent(opId)) {
        return;
      }

      if (result.kind === 'accepted') {
        this.applyView(result.view);
      } else if (result.kind === 'notFound') {
        this.commit({
          ...this.getCurrent(),
          deleteOutcome: undefined,
          phase: 'missingOnServer',
        });
      } else {
        this.log('delete_refused', { httpStatus: result.status });
        this.commit({ ...this.getCurrent(), deleteOutcome: 'refused' });
      }
    } catch {
      if (this.isCurrent(opId)) {
        this.commit({ ...this.getCurrent(), deleteOutcome: 'unknown' });
      }
    } finally {
      this.setState({ busy: false });
    }

    if (this.isCurrent(opId)) {
      this.schedulePoll();
    }
  }

  async dismiss() {
    const { operation } = this.state;

    this.stopPolling();
    this.setState({ connectionLost: false });
    this.commit(null);

    if (operation?.tempPath) {
      await this.removeCopy(operation.tempPath);
    }
  }

  private rejectFile(rejection: FileRejection) {
    this.log('file_rejected');
    this.setState({ draft: null, rejection });
  }

  private async validateFile(picked: IPickedFile): Promise<FileRejection | null> {
    const byteSize = await this.statementFileRepository.size(picked.path);

    if (isFileTooLarge(byteSize)) {
      return 'tooLarge';
    }

    if (byteSize === 0) {
      return 'empty';
    }

    const head = await this.statementFileRepository.readHead(picked.path, FILE_HEAD_BYTES);

    return detectFileFormat(head) ? null : 'unsupportedContent';
  }

  private async send(opId: string) {
    const { fileName, idempotencyKey, tempPath } = this.getCurrent();

    if (!tempPath || !(await this.statementFileRepository.exists(tempPath))) {
      this.setState({ busy: false });
      await this.fail(opId, 'localCopyLost');

      return;
    }

    this.setState({ busy: true });
    this.log('import_sent');

    try {
      const result = await this.statementImportRepository.createImport(
        tempPath,
        idempotencyKey,
        fileName ?? ''
      );

      if (!this.isCurrent(opId)) {
        return;
      }

      this.setState({ busy: false });

      if (result.kind === 'accepted') {
        this.log('import_accepted', { revision: result.view.revision });
        this.applyView(result.view);
        await this.dropLocalFile();
        this.schedulePoll();

        return;
      }

      this.log('import_refused', 'status' in result ? { httpStatus: result.status } : undefined);

      const failures: Record<typeof result.kind, OperationFailure> = {
        conflict: 'conflict',
        rejected: 'rejectedByServer',
        tooLarge: 'tooLargeForServer',
        unexpected: 'unexpected',
      };

      await this.fail(opId, failures[result.kind]);
    } catch {
      if (!this.isCurrent(opId)) {
        return;
      }

      this.setState({ busy: false });
      this.log('import_outcome_unknown');

      await this.recover();
    }
  }

  private async fail(opId: string, failure: OperationFailure) {
    if (!this.isCurrent(opId)) {
      return;
    }

    const { rest, tempPath } = withoutLocalFile(this.getCurrent());

    this.commit({ ...rest, failure, phase: 'failed' });

    if (tempPath) {
      await this.removeCopy(tempPath);
    }
  }

  private applyView(view: IServerView) {
    const before = this.getCurrent();
    const after = applyServerView(before, view);

    if (after === before) {
      this.log('stale_view_ignored', { revision: view.revision });

      return;
    }

    if (after.phase === 'deleted') {
      this.log('delete_confirmed', { revision: view.revision });
    }

    this.commit(after);
  }

  private markDeleteUnknown() {
    const operation = this.getCurrent();

    if (
      operation.phase === 'deleteRequested' &&
      operation.deleteOutcome === 'pending' &&
      operation.view?.status !== 'deleting' &&
      !this.state.busy
    ) {
      this.commit({ ...operation, deleteOutcome: 'unknown' });
    }
  }

  private async dropLocalFile() {
    const { rest, tempPath } = withoutLocalFile(this.getCurrent());

    this.commit(rest);

    if (tempPath) {
      await this.removeCopy(tempPath);
    }
  }

  private async removeCopy(path: string) {
    try {
      await this.statementFileRepository.remove(path);
      this.log('copy_removed');
    } catch {
      // swept on next start
    }
  }

  private async removeOrphanFiles(operation: IOperation | null) {
    const owned = await this.statementFileRepository.listOwned();

    await Promise.all(
      owned.filter((path) => path !== operation?.tempPath).map((path) => this.removeCopy(path))
    );
  }

  private schedulePoll() {
    this.stopPolling();

    const { operation } = this.state;

    if (this.disposed || !operation?.jobId || isOperationSettled(operation)) {
      return;
    }

    this.pollTimer = setTimeout(() => {
      this.pollTimer = null;
      this.refresh();
    }, this.pollIntervalMs);
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
    }

    this.pollTimer = null;
  }

  private isCurrent(opId: string) {
    return !this.disposed && this.state.operation?.opId === opId;
  }

  private getCurrent() {
    return this.state.operation as IOperation;
  }

  private commit(operation: IOperation | null) {
    if (this.disposed) {
      return;
    }

    try {
      if (operation) {
        this.importOperationRepository.saveOperation(operation);
      } else {
        this.importOperationRepository.removeOperation();
      }
    } catch (error) {
      this.log('storage_failed');

      throw error;
    }

    this.setState({ operation });
  }

  private setState(patch: Partial<IStatementImportState>) {
    if (this.disposed) {
      return;
    }

    this.state = { ...this.state, ...patch };
    this.listeners.forEach((listener) => listener());
  }
}

export default StatementImportService;
