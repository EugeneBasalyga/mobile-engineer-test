import { errorCodes, isErrorWithCode, pick, types } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import uuid from 'react-native-uuid';

import { type PickedFile } from '@/packages/statementImport/core/importCoordinator';
import { exceedsLimit } from '@/packages/statementImport/core/validateFile';
import { ensureImportDirectory } from '@/packages/statementImport/platform/files';

export type PickResult =
  | { kind: 'canceled' }
  | { kind: 'tooLarge' }
  | { file: PickedFile; kind: 'picked' };

const toPath = (uri: string) =>
  uri.startsWith('file://') ? decodeURIComponent(uri.replace(/^file:\/\//, '')) : uri;

/**
 * Android content:// and iOS Files URLs are only guaranteed while the picker result is fresh, so
 * the bytes are streamed into a private copy. A file declared over the limit is never copied.
 */
export const pickStatement = async (): Promise<PickResult> => {
  try {
    const [file] = await pick({ allowMultiSelection: false, type: [types.allFiles] });

    if (typeof file.size === 'number' && exceedsLimit(file.size)) {
      return { kind: 'tooLarge' };
    }

    const directory = await ensureImportDirectory();
    const path = `${directory}/picked-${uuid.v4()}`;
    const sourcePath = toPath(file.uri);

    await RNFS.copyFile(sourcePath, path);

    // On iOS the picker hands over its own temporary copy, which is ours to remove.
    if (sourcePath.startsWith(RNFS.TemporaryDirectoryPath.replace(/\/$/, ''))) {
      await RNFS.unlink(sourcePath).catch(() => undefined);
    }

    return { file: { name: file.name ?? 'statement', path }, kind: 'picked' };
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return { kind: 'canceled' };
    }

    throw error;
  }
};
