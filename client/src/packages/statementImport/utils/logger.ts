/* global __DEV__ */
export type ImportLogEvent =
  | 'copy_removed'
  | 'delete_confirmed'
  | 'delete_refused'
  | 'delete_requested'
  | 'file_rejected'
  | 'import_accepted'
  | 'import_outcome_unknown'
  | 'import_recovered'
  | 'import_refused'
  | 'import_sent'
  | 'stale_view_ignored'
  | 'storage_failed';

export interface IImportLogFields {
  httpStatus?: number;
  revision?: number;
}

export type ImportLogger = (event: ImportLogEvent, fields?: IImportLogFields) => void;

export const logImportEvent: ImportLogger = (event, fields) => {
  if (__DEV__) {
    console.log(`[import] ${event}`, fields ?? {});
  }
};
