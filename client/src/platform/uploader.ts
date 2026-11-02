import { File, UploadType } from 'expo-file-system';

import { REQUEST_TIMEOUT_MS, type Uploader } from '../api/client';

/**
 * Streams from disk natively, so the file never has to fit in JS memory. A foreground session keeps
 * the request tied to this process: after a kill the outcome is recovered by key, not by a resumed task.
 */
export const nativeUploader: Uploader = async ({ url, path, headers }) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const { status, body } = await new File(path).upload(url, {
      httpMethod: 'POST',
      uploadType: UploadType.BINARY_CONTENT,
      headers,
      sessionType: 'foreground',
      signal: controller.signal,
    });
    return { status, body };
  } finally {
    clearTimeout(timer);
  }
};
