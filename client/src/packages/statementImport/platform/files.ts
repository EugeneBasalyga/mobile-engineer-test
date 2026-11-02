import RNFS from 'react-native-fs';

import { type LocalFiles } from '@/packages/statementImport/core/importCoordinator';

// The caches directory is private to the app and excluded from iOS backups.
const IMPORT_DIRECTORY = `${RNFS.CachesDirectoryPath}/imports`;

export const ensureImportDirectory = async () => {
  await RNFS.mkdir(IMPORT_DIRECTORY);

  return IMPORT_DIRECTORY;
};

export const nativeFiles: LocalFiles = {
  async adopt(path, baseName, format) {
    const directory = await ensureImportDirectory();
    const target = `${directory}/${baseName}.${format}`;

    await RNFS.moveFile(path, target);

    return target;
  },
  exists: (path) => RNFS.exists(path),
  async listOwned() {
    if (!(await RNFS.exists(IMPORT_DIRECTORY))) {
      return [];
    }

    const entries = await RNFS.readDir(IMPORT_DIRECTORY);

    return entries.filter((entry) => entry.isFile()).map((entry) => entry.path);
  },
  async readHead(path, length) {
    // RNFS returns each byte as one char for 'ascii', and reads only `length` bytes from disk.
    const text = await RNFS.read(path, length, 0, 'ascii');

    return Uint8Array.from(text, (char) => char.charCodeAt(0));
  },
  async remove(path) {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
  },
  async size(path) {
    const { size } = await RNFS.stat(path);

    return Number(size);
  },
};
