import {
  type IOperation,
  type IServerView,
} from '@/packages/statementImport/models/statementImport';

export const applyServerView = (operation: IOperation, view: IServerView): IOperation => {
  if (operation.jobId && operation.jobId !== view.jobId) {
    return operation;
  }

  if (operation.phase === 'deleted') {
    return operation;
  }

  if (operation.view && view.revision <= operation.view.revision) {
    return operation;
  }

  const next: IOperation = { ...operation, jobId: view.jobId, recovery: undefined, view };

  if (view.status === 'deleted') {
    return { ...next, deleteOutcome: undefined, phase: 'deleted' };
  }

  if (view.status === 'deleting') {
    return { ...next, deleteOutcome: 'pending', phase: 'deleteRequested' };
  }

  return { ...next, phase: operation.phase === 'deleteRequested' ? 'deleteRequested' : 'tracking' };
};

export const isOperationSettled = (operation: IOperation) => {
  switch (operation.phase) {
    case 'tracking':
      return operation.view?.status === 'ready';
    case 'deleteRequested':
      return operation.deleteOutcome !== 'pending';
    case 'sending':
      return false;
    default:
      return true;
  }
};

export const withoutLocalFile = (operation: IOperation) => {
  const rest = { ...operation };
  const { tempPath } = operation;

  delete rest.fileName;
  delete rest.tempPath;

  return { rest, tempPath };
};
