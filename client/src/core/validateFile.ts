export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const HEAD_BYTES = 24;

export type FileFormat = 'pdf' | 'csv';
export type Rejection = 'tooLarge' | 'unsupportedContent' | 'empty';

const PDF_SIGNATURE = '%PDF-';
const CSV_HEADER = 'date,description,amount\n';

function ascii(bytes: Uint8Array, length: number): string {
  let text = '';
  for (let index = 0; index < Math.min(length, bytes.length); index += 1) {
    text += String.fromCharCode(bytes[index]);
  }
  return text;
}

/** Decides the format from the bytes only; the extension and MIME type are never consulted. */
export function detectFormat(head: Uint8Array): FileFormat | null {
  if (ascii(head, PDF_SIGNATURE.length) === PDF_SIGNATURE) return 'pdf';
  if (ascii(head, CSV_HEADER.length) === CSV_HEADER) return 'csv';
  return null;
}

export function exceedsLimit(byteSize: number): boolean {
  return byteSize > MAX_FILE_BYTES;
}
