import { type MOCK_SCENARIOS } from '@/packages/statementImport/constants/statementImport';

export type FileFormat = 'pdf' | 'csv';

export type FileRejection = 'tooLarge' | 'unsupportedContent' | 'empty';

export type ServerStatus = 'queued' | 'processing' | 'ready' | 'deleting' | 'deleted';

export type OperationPhase =
  | 'sending'
  | 'uncertain'
  | 'tracking'
  | 'deleteRequested'
  | 'deleted'
  | 'failed'
  | 'missingOnServer';

export type OperationFailure =
  | 'conflict'
  | 'rejectedByServer'
  | 'tooLargeForServer'
  | 'localCopyLost'
  | 'unexpected';

export type OperationRecovery = 'checking' | 'notFound' | 'unreachable';

export type DeleteOutcome = 'pending' | 'refused' | 'unknown';

export type MockScenario = (typeof MOCK_SCENARIOS)[number];

export interface IRecurringItem {
  amountMinor: number;
  cadence: string;
  id: string;
  lastSeen: string;
  merchant: string;
}

export interface IServerView {
  jobId: string;
  revision: number;
  status: ServerStatus;
  currency?: string;
  items?: IRecurringItem[];
}

export interface IOperation {
  byteSize: number;
  format: FileFormat;
  idempotencyKey: string;
  opId: string;
  phase: OperationPhase;
  deleteKey?: string;
  deleteOutcome?: DeleteOutcome;
  failure?: OperationFailure;
  fileName?: string;
  jobId?: string;
  recovery?: OperationRecovery;
  tempPath?: string;
  view?: IServerView;
}

export interface IPickedFile {
  name: string;
  path: string;
}

export interface IDraft {
  byteSize: number;
  draftId: string;
  format: FileFormat;
  name: string;
  tempPath: string;
}

export interface IStatementImportState {
  busy: boolean;
  connectionLost: boolean;
  draft: IDraft | null;
  operation: IOperation | null;
  pickFailed: boolean;
  ready: boolean;
  rejection: FileRejection | null;
}

export type PickResult =
  | { kind: 'canceled' }
  | { kind: 'tooLarge' }
  | { file: IPickedFile; kind: 'picked' };

export type CreateImportResult =
  | { kind: 'accepted'; view: IServerView }
  | { kind: 'conflict' }
  | { kind: 'rejected' }
  | { kind: 'tooLarge' }
  | { kind: 'unexpected'; status: number };

export type FindImportResult = { kind: 'found'; view: IServerView } | { kind: 'notFound' };

export type DeleteImportResult =
  | { kind: 'accepted'; view: IServerView }
  | { kind: 'notFound' }
  | { kind: 'refused'; status: number };

export interface IUploadRequest {
  headers: Record<string, string>;
  path: string;
  url: string;
}

export interface IUploadResponse {
  body: string;
  status: number;
}

export interface IMockState {
  mode: string;
  stats: {
    createRequests: number;
    deleteRequests: number;
    duplicateHits: number;
    newJobs: number;
  };
}

export interface IStatementFileRepository {
  adopt(path: string, baseName: string, format: FileFormat): Promise<string>;
  exists(path: string): Promise<boolean>;
  listOwned(): Promise<string[]>;
  pick(): Promise<PickResult>;
  readHead(path: string, length: number): Promise<Uint8Array>;
  remove(path: string): Promise<void>;
  size(path: string): Promise<number>;
  upload(request: IUploadRequest): Promise<IUploadResponse>;
}

export interface IImportOperationRepository {
  getOperation(): IOperation | null;
  removeOperation(): void;
  saveOperation(operation: IOperation): void;
}

export interface IStatementImportRepository {
  createImport(path: string, key: string, fileName: string): Promise<CreateImportResult>;
  deleteImport(jobId: string, key: string): Promise<DeleteImportResult>;
  findImportByKey(key: string): Promise<FindImportResult>;
  getImport(jobId: string): Promise<FindImportResult>;
}
