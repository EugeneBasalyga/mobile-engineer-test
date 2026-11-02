import {
  CSV_HEADER,
  MAX_FILE_BYTES,
  PDF_SIGNATURE,
} from '@/packages/statementImport/constants/statementImport';
import { type FileFormat } from '@/packages/statementImport/models/statementImport';

const toAscii = (bytes: Uint8Array, length: number) => {
  return String.fromCharCode(...bytes.subarray(0, length));
};

export const detectFileFormat = (head: Uint8Array): FileFormat | null => {
  if (toAscii(head, PDF_SIGNATURE.length) === PDF_SIGNATURE) {
    return 'pdf';
  }

  if (toAscii(head, CSV_HEADER.length) === CSV_HEADER) {
    return 'csv';
  }

  return null;
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} Б`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} КиБ`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} МиБ`;
};

export const isFileTooLarge = (byteSize: number) => {
  return byteSize > MAX_FILE_BYTES;
};
