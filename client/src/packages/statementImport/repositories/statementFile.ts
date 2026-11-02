import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { generateUUID } from '@/packages/shared/utils/generators';

import { REQUEST_TIMEOUT_MS } from '@/packages/statementImport/constants/statementImport';
import {
  type FileFormat,
  type IStatementFileRepository,
  type IUploadRequest,
  type PickResult,
} from '@/packages/statementImport/models/statementImport';
import { isFileTooLarge } from '@/packages/statementImport/utils/file';

const { fs } = ReactNativeBlobUtil;

const IMPORT_DIRECTORY = `${fs.dirs.CacheDir}/imports`;

const toPath = (uri: string) => {
  return uri.startsWith('file://') ? decodeURIComponent(uri.replace(/^file:\/\//, '')) : uri;
};

class StatementFileRepository implements IStatementFileRepository {
  constructor() {
    this.adopt = this.adopt.bind(this);
    this.exists = this.exists.bind(this);
    this.listOwned = this.listOwned.bind(this);
    this.pick = this.pick.bind(this);
    this.readHead = this.readHead.bind(this);
    this.remove = this.remove.bind(this);
    this.size = this.size.bind(this);
    this.upload = this.upload.bind(this);
  }

  async pick(): Promise<PickResult> {
    let pickerCopy: string | null = null;

    try {
      const [file] = await pick({ allowMultiSelection: false, type: [types.allFiles] });
      const sourcePath = toPath(file.uri);

      // iOS picker leaves its own copy in tmp
      if (Platform.OS === 'ios') {
        pickerCopy = sourcePath;
      }

      if (typeof file.size === 'number' && isFileTooLarge(file.size)) {
        return { kind: 'tooLarge' };
      }

      const directory = await this.ensureImportDirectory();
      const path = `${directory}/picked-${generateUUID()}`;

      await fs.cp(sourcePath, path);

      return { file: { name: file.name ?? 'statement', path }, kind: 'picked' };
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
        return { kind: 'canceled' };
      }

      throw error;
    } finally {
      if (pickerCopy) {
        await this.remove(pickerCopy).catch(() => undefined);
      }
    }
  }

  async adopt(path: string, baseName: string, format: FileFormat) {
    const directory = await this.ensureImportDirectory();
    const target = `${directory}/${baseName}.${format}`;

    await fs.mv(path, target);

    return target;
  }

  exists(path: string) {
    return fs.exists(path);
  }

  async listOwned() {
    if (!(await fs.exists(IMPORT_DIRECTORY))) {
      return [];
    }

    const names = await fs.ls(IMPORT_DIRECTORY);

    return names.map((name) => `${IMPORT_DIRECTORY}/${name}`);
  }

  async readHead(path: string, length: number) {
    const directory = await this.ensureImportDirectory();
    const headPath = `${directory}/head-${generateUUID()}`;

    try {
      await fs.slice(path, headPath, 0, length);

      const bytes: number[] = await fs.readFile(headPath, 'ascii');

      // Android returns signed bytes
      return Uint8Array.from(bytes, (byte) => byte & 0xff);
    } finally {
      await this.remove(headPath);
    }
  }

  async remove(path: string) {
    if (await fs.exists(path)) {
      await fs.unlink(path);
    }
  }

  async size(path: string) {
    const { size } = await fs.stat(path);

    return Number(size);
  }

  async upload({ headers, path, url }: IUploadRequest) {
    const response = await ReactNativeBlobUtil.config({ timeout: REQUEST_TIMEOUT_MS }).fetch(
      'POST',
      url,
      { ...headers, 'Transfer-Encoding': 'chunked' },
      ReactNativeBlobUtil.wrap(path)
    );

    return { body: await response.text(), status: response.info().status };
  }

  private async ensureImportDirectory() {
    if (!(await fs.exists(IMPORT_DIRECTORY))) {
      await fs.mkdir(IMPORT_DIRECTORY);
    }

    return IMPORT_DIRECTORY;
  }
}

export default StatementFileRepository;
