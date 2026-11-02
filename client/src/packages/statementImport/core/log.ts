/* global __DEV__ */
import type { Phase } from '@/packages/statementImport/core/operation';

export type LogEvent =
  | 'file_rejected'
  | 'import_sent'
  | 'import_accepted'
  | 'import_outcome_unknown'
  | 'import_recovered'
  | 'import_refused'
  | 'stale_view_ignored'
  | 'delete_requested'
  | 'delete_refused'
  | 'delete_confirmed'
  | 'copy_removed'
  | 'storage_failed';

/** Deliberately closed: there is no field that can carry a file name, bytes or transaction text. */
export type LogFields = { httpStatus?: number; phase?: Phase; revision?: number };

export type Logger = (event: LogEvent, fields?: LogFields) => void;

export const devLogger: Logger = (event, fields) => {
  if (__DEV__) console.log(`[import] ${event}`, fields ?? {});
};
