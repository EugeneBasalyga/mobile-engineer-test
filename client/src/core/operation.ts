import type { FileFormat } from './validateFile';

export type ServerStatus = 'queued' | 'processing' | 'ready' | 'deleting' | 'deleted';

export type RecurringItem = {
  id: string;
  merchant: string;
  amountMinor: number;
  cadence: string;
  lastSeen: string;
};

export type ServerView = {
  jobId: string;
  status: ServerStatus;
  revision: number;
  currency?: string;
  items?: RecurringItem[];
};

/**
 * sending: key saved, POST started, outcome not known yet.
 * uncertain: POST outcome unknown, the job may or may not exist.
 * tracking: the server confirmed a job.
 * deleteRequested: the user asked to delete, the server has not confirmed it.
 * deleted: GET returned status=deleted. This is the only phase that may claim deletion.
 * failed: the server refused the file, or the retry can no longer be performed.
 * missingOnServer: the job is unknown to the server. That is not a confirmed deletion.
 */
export type Phase =
  | 'sending'
  | 'uncertain'
  | 'tracking'
  | 'deleteRequested'
  | 'deleted'
  | 'failed'
  | 'missingOnServer';

export type Failure = 'conflict' | 'rejectedByServer' | 'tooLargeForServer' | 'localCopyLost' | 'unexpected';
export type Recovery = 'checking' | 'notFound' | 'unreachable';
export type DeleteOutcome = 'pending' | 'refused' | 'unknown';

export type Operation = {
  opId: string;
  idempotencyKey: string;
  phase: Phase;
  format: FileFormat;
  byteSize: number;
  fileName?: string;
  tempPath?: string;
  jobId?: string;
  view?: ServerView;
  deleteKey?: string;
  deleteOutcome?: DeleteOutcome;
  recovery?: Recovery;
  failure?: Failure;
};

/**
 * The single gate for server state. A view is dropped when it is older than what we hold, which
 * covers stale_status, the queued/revision 1 answer to a repeated POST, and late responses
 * arriving after deletion. `deleted` is final.
 */
export function applyServerView(operation: Operation, view: ServerView): Operation {
  if (operation.jobId && operation.jobId !== view.jobId) return operation;
  if (operation.phase === 'deleted') return operation;
  if (operation.view && view.revision <= operation.view.revision) return operation;

  const next: Operation = { ...operation, jobId: view.jobId, view, recovery: undefined };
  if (view.status === 'deleted') {
    return { ...next, phase: 'deleted', deleteOutcome: undefined };
  }
  if (view.status === 'deleting') {
    return { ...next, phase: 'deleteRequested', deleteOutcome: 'pending' };
  }
  return { ...next, phase: operation.phase === 'deleteRequested' ? 'deleteRequested' : 'tracking' };
}

export function isSettled(operation: Operation): boolean {
  if (operation.phase === 'deleted' || operation.phase === 'failed' || operation.phase === 'missingOnServer') {
    return true;
  }
  if (operation.phase === 'tracking') return operation.view?.status === 'ready';
  if (operation.phase === 'deleteRequested') return operation.deleteOutcome !== 'pending';
  return operation.phase === 'uncertain';
}

/** Amounts stay in integer minor units until display, so the total cannot pick up float error. */
export function formatMinor(amountMinor: number, currency: string): string {
  const units = Math.floor(amountMinor / 100);
  const cents = String(amountMinor % 100).padStart(2, '0');
  return `${units}.${cents} ${currency}`;
}

export function totalMinor(items: RecurringItem[]): number {
  return items.reduce((sum, item) => sum + item.amountMinor, 0);
}
