import type { ServerView } from '@/packages/statementImport/core/operation';

export type UploadRequest = {
  headers: Record<string, string>;
  path: string;
  url: string;
};

export type HttpResult = { body: string; status: number };

/** Sends a file's bytes from disk. Rejects when the request has no outcome (socket closed, timeout). */
export type Uploader = (request: UploadRequest) => Promise<HttpResult>;

export type CreateResult =
  | { kind: 'accepted'; view: ServerView }
  | { kind: 'conflict' }
  | { kind: 'rejected' }
  | { kind: 'tooLarge' }
  | { kind: 'unexpected'; status: number };

export type LookupResult = { kind: 'found'; view: ServerView } | { kind: 'notFound' };

export type DeleteResult =
  | { kind: 'accepted'; view: ServerView }
  | { kind: 'refused'; status: number }
  | { kind: 'notFound' };

export type ImportApi = {
  create(path: string, key: string, fileName: string): Promise<CreateResult>;
  deleteJob(jobId: string, key: string): Promise<DeleteResult>;
  findByKey(key: string): Promise<LookupResult>;
  getJob(jobId: string): Promise<LookupResult>;
};

export const REQUEST_TIMEOUT_MS = 30_000;

/** Header values must be ASCII, and the server caps the length, so names with other text are encoded. */
export function fileNameHeader(fileName: string, fallback: string): string {
  const encoded = encodeURIComponent(fileName);
  return encoded.length >= 1 && encoded.length <= 255 ? encoded : fallback;
}

function parseView(body: string): ServerView {
  return JSON.parse(body) as ServerView;
}

export function createImportApi(
  baseUrl: string,
  uploader: Uploader,
  fetcher: typeof fetch = fetch
): ImportApi {
  async function lookup(path: string): Promise<LookupResult> {
    const response = await withTimeout((signal) => fetcher(`${baseUrl}${path}`, { signal }));
    if (response.status === 404) return { kind: 'notFound' };
    if (!response.ok) throw new Error(`lookup failed: ${response.status}`);
    return { kind: 'found', view: (await response.json()) as ServerView };
  }

  return {
    async create(path, key, fileName) {
      const extension = path.slice(path.lastIndexOf('.') + 1);
      const { body, status } = await uploader({
        headers: {
          'Content-Type': 'application/octet-stream',
          'Idempotency-Key': key,
          'X-File-Name': fileNameHeader(fileName, `statement.${extension}`),
        },
        path,
        url: `${baseUrl}/imports`,
      });
      if (status === 202) return { kind: 'accepted', view: parseView(body) };
      if (status === 409) return { kind: 'conflict' };
      if (status === 415) return { kind: 'rejected' };
      if (status === 413) return { kind: 'tooLarge' };
      return { kind: 'unexpected', status };
    },
    async deleteJob(jobId, key) {
      const response = await withTimeout((signal) =>
        fetcher(`${baseUrl}/imports/${encodeURIComponent(jobId)}`, {
          headers: { 'Idempotency-Key': key },
          method: 'DELETE',
          signal,
        })
      );
      if (response.status === 404) return { kind: 'notFound' };
      if (response.status !== 202) return { kind: 'refused', status: response.status };
      return { kind: 'accepted', view: (await response.json()) as ServerView };
    },
    findByKey: (key) => lookup(`/imports/by-key/${encodeURIComponent(key)}`),
    getJob: (jobId) => lookup(`/imports/${encodeURIComponent(jobId)}`),
  };
}

async function withTimeout<T>(run: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await run(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}
