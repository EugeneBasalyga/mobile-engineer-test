import { memo } from 'react';

import { useTranslation } from '@/packages/shared/hooks/translation';

import ImportButton from '@/packages/statementImport/components/ImportButton';
import Notice from '@/packages/statementImport/components/Notice';
import ProgressRow from '@/packages/statementImport/components/ProgressRow';
import ScreenLayout from '@/packages/statementImport/components/ScreenLayout';
import Report from '@/packages/statementImport/components/StatusView/Report';
import {
  type IOperation,
  type IRecurringItem,
} from '@/packages/statementImport/models/statementImport';

interface DeleteStatusProps {
  busy: boolean;
  onDelete: () => void;
  onDiagnostics: () => void;
  onOpenItem: (item: IRecurringItem) => void;
  onRefresh: () => void;
  operation: IOperation;
}

const DeleteStatus = memo(
  ({ busy, onDelete, onDiagnostics, onOpenItem, onRefresh, operation }: DeleteStatusProps) => {
    const { t } = useTranslation('statementImport');

    if (operation.deleteOutcome === 'pending') {
      return (
        <ScreenLayout title={t('delete.pendingTitle')}>
          <ProgressRow label={t('delete.pendingBody')} />
        </ScreenLayout>
      );
    }

    return (
      <ScreenLayout title={t('delete.title')}>
        <Notice>
          {t(operation.deleteOutcome === 'refused' ? 'delete.refused' : 'delete.unknown')}
        </Notice>

        <ImportButton
          disabled={busy}
          title={t('delete.retry')}
          variant="danger"
          onPress={onDelete}
        />

        <ImportButton disabled={busy} title={t('common.refresh')} onPress={onRefresh} />

        <Report operation={operation} onOpenItem={onOpenItem} />

        <ImportButton title={t('common.diagnostics')} onPress={onDiagnostics} />
      </ScreenLayout>
    );
  }
);

DeleteStatus.displayName = 'DeleteStatus';

export default DeleteStatus;
