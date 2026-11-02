import { type AxiosRequestConfig } from 'axios';

import HttpRepository from '@/packages/shared/repositories/http';

import { REQUEST_TIMEOUT_MS } from '@/packages/statementImport/constants/statementImport';
import {
  type CreateImportResult,
  type DeleteImportResult,
  type FindImportResult,
  type IMockState,
  type IServerView,
  type IStatementFileRepository,
  type IStatementImportRepository,
  type MockScenario,
} from '@/packages/statementImport/models/statementImport';

const REQUEST_CONFIG: AxiosRequestConfig = {
  timeout: REQUEST_TIMEOUT_MS,
  validateStatus: () => true,
};

const getFileNameHeader = (fileName: string, fallback: string) => {
  const encoded = encodeURIComponent(fileName);

  return encoded.length >= 1 && encoded.length <= 255 ? encoded : fallback;
};

class StatementImportRepository implements IStatementImportRepository {
  public http: HttpRepository;

  public fileRepository: Pick<IStatementFileRepository, 'upload'>;

  public baseUrl: string;

  constructor(baseUrl: string, fileRepository: Pick<IStatementFileRepository, 'upload'>) {
    this.baseUrl = baseUrl;
    this.http = new HttpRepository(baseUrl);
    this.fileRepository = fileRepository;

    this.createImport = this.createImport.bind(this);
    this.deleteImport = this.deleteImport.bind(this);
    this.findImportByKey = this.findImportByKey.bind(this);
    this.getImport = this.getImport.bind(this);
    this.getMockState = this.getMockState.bind(this);
    this.resetMock = this.resetMock.bind(this);
    this.setMockScenario = this.setMockScenario.bind(this);
  }

  async createImport(path: string, key: string, fileName: string): Promise<CreateImportResult> {
    const extension = path.slice(path.lastIndexOf('.') + 1);

    // axios streams files only inside FormData, this endpoint takes a raw body
    const { body, status } = await this.fileRepository.upload({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Idempotency-Key': key,
        'X-File-Name': getFileNameHeader(fileName, `statement.${extension}`),
      },
      path,
      url: `${this.baseUrl}/imports`,
    });

    switch (status) {
      case 202:
        return { kind: 'accepted', view: JSON.parse(body) as IServerView };
      case 409:
        return { kind: 'conflict' };
      case 413:
        return { kind: 'tooLarge' };
      case 415:
        return { kind: 'rejected' };
      default:
        return { kind: 'unexpected', status };
    }
  }

  findImportByKey(key: string) {
    return this.findImport(`/imports/by-key/${encodeURIComponent(key)}`);
  }

  getImport(jobId: string) {
    return this.findImport(`/imports/${encodeURIComponent(jobId)}`);
  }

  async deleteImport(jobId: string, key: string): Promise<DeleteImportResult> {
    const { data, status } = await this.http.delete(`/imports/${encodeURIComponent(jobId)}`, {
      ...REQUEST_CONFIG,
      headers: { 'Idempotency-Key': key },
    });

    if (status === 404) {
      return { kind: 'notFound' };
    }

    if (status !== 202) {
      return { kind: 'refused', status };
    }

    return { kind: 'accepted', view: data as IServerView };
  }

  async getMockState() {
    const { data } = await this.http.get('/__test/state', REQUEST_CONFIG);

    return data as IMockState;
  }

  async setMockScenario(mode: MockScenario) {
    await this.http.post('/__test/scenario', { mode }, REQUEST_CONFIG);
  }

  async resetMock() {
    await this.http.post('/__test/reset', undefined, REQUEST_CONFIG);
  }

  private async findImport(url: string): Promise<FindImportResult> {
    const { data, status } = await this.http.get(url, REQUEST_CONFIG);

    if (status === 404) {
      return { kind: 'notFound' };
    }

    if (status < 200 || status >= 300) {
      throw new Error(`Import lookup failed: ${status}`);
    }

    return { kind: 'found', view: data as IServerView };
  }
}

export default StatementImportRepository;
