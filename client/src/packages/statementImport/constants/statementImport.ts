export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const FILE_HEAD_BYTES = 24;

export const PDF_SIGNATURE = '%PDF-';

export const CSV_HEADER = 'date,description,amount\n';

export const REQUEST_TIMEOUT_MS = 30_000;

export const POLL_INTERVAL_MS = 1000;

export const OPERATION_STORAGE_KEY = 'STATEMENT_IMPORT_OPERATION';

export const MOCK_SCENARIOS = ['happy', 'lost_ack', 'stale_status', 'delete_failure'] as const;
