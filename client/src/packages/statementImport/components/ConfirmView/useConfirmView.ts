import { type IDraft } from '@/packages/statementImport/models/statementImport';
import { formatFileSize } from '@/packages/statementImport/utils/file';

export const useConfirmView = ({ byteSize, format, name }: IDraft) => {
  return {
    formatLabel: format.toUpperCase(),
    name,
    sizeLabel: formatFileSize(byteSize),
  };
};
