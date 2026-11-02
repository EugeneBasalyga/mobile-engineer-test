import RNFS from 'react-native-fs';

import { REQUEST_TIMEOUT_MS, type Uploader } from '@/packages/statementImport/api/client';

/**
 * Sends raw bytes from native code, so the file never enters JS memory. Android streams it; iOS
 * buffers it natively, which validation has already capped at 10 MiB.
 */
export const nativeUploader: Uploader = async ({ headers, path, url }) => {
  const task = RNFS.uploadFiles({
    binaryStreamOnly: true,
    files: [
      { filename: 'statement', filepath: path, filetype: 'application/octet-stream', name: 'file' },
    ],
    headers,
    method: 'POST',
    toUrl: url,
  });

  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      RNFS.stopUpload(task.jobId);
      reject(new Error('upload timed out'));
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    const { body, statusCode } = await Promise.race([task.promise, timeout]);

    return { body, status: statusCode };
  } finally {
    clearTimeout(timer);
  }
};
