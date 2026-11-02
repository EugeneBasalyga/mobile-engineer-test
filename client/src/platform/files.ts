import { Directory, File, FileMode, Paths } from 'expo-file-system';

import type { LocalFiles } from '../core/importCoordinator';

// The picker has copied the document here by the time we see it, which resolves Android content://
// and iOS security-scoped URLs. The cache is excluded from iOS backups.
const PICKER_FOLDER = 'DocumentPicker';
const IMPORT_FOLDER = 'imports';

function listFiles(directory: Directory): string[] {
  if (!directory.exists) return [];
  return directory.list().flatMap(entry => (entry instanceof File ? [entry.uri] : []));
}

export const nativeFiles: LocalFiles = {
  async size(path) {
    return new File(path).size;
  },
  async readHead(path, length) {
    const handle = new File(path).open(FileMode.ReadOnly);
    try {
      return await handle.readBytes(length);
    } finally {
      handle.close();
    }
  },
  async adopt(path, baseName, format) {
    const directory = new Directory(Paths.cache, IMPORT_FOLDER);
    if (!directory.exists) directory.create({ intermediates: true });
    const target = new File(directory, `${baseName}.${format}`);
    new File(path).move(target);
    return target.uri;
  },
  async exists(path) {
    return new File(path).exists;
  },
  async remove(path) {
    const file = new File(path);
    if (file.exists) file.delete();
  },
  async listOwned() {
    return [
      ...listFiles(new Directory(Paths.cache, IMPORT_FOLDER)),
      ...listFiles(new Directory(Paths.cache, PICKER_FOLDER)),
    ];
  },
};
