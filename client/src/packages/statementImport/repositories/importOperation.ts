import type StorageRepository from '@/packages/shared/repositories/storage';

import { OPERATION_STORAGE_KEY } from '@/packages/statementImport/constants/statementImport';
import {
  type IImportOperationRepository,
  type IOperation,
} from '@/packages/statementImport/models/statementImport';

class ImportOperationRepository implements IImportOperationRepository {
  public storageRepository: StorageRepository;

  constructor(storageRepository: StorageRepository) {
    this.storageRepository = storageRepository;

    this.getOperation = this.getOperation.bind(this);
    this.saveOperation = this.saveOperation.bind(this);
    this.removeOperation = this.removeOperation.bind(this);
  }

  getOperation() {
    const operation = this.storageRepository.getItem(OPERATION_STORAGE_KEY);

    return operation ? (JSON.parse(operation) as IOperation) : null;
  }

  saveOperation(operation: IOperation) {
    this.storageRepository.setItem(OPERATION_STORAGE_KEY, JSON.stringify(operation));
  }

  removeOperation() {
    this.storageRepository.removeItem(OPERATION_STORAGE_KEY);
  }
}

export default ImportOperationRepository;
