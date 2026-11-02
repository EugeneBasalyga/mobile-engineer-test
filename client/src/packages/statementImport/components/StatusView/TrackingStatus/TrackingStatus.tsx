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

interface TrackingStatusProps {
  busy: boolean;
  connectionLost: boolean;
  onDelete: () => void;
  onDiagnostics: () => void;
  onOpenItem: (item: IRecurringItem) => void;
  onRefresh: () => void;
  operation: IOperation;
}

const TrackingStatus = memo(
  ({
    busy,
    connectionLost,
    onDelete,
    onDiagnostics,
    onOpenItem,
    onRefresh,
    operation,
  }: TrackingStatusProps) => {
    const { t } = useTranslation('statementImport');

    const status = operation.view?.status;
    const staleNotice = connectionLost && <Notice>{t('tracking.connectionLost')}</Notice>;

    if (status !== 'ready') {
      const queued = status === 'queued';

      return (
        <ScreenLayout title={t(queued ? 'tracking.queuedTitle' : 'tracking.processingTitle')}>
          <ProgressRow label={t(queued ? 'tracking.queuedBody' : 'tracking.processingBody')} />

          {staleNotice}
        </ScreenLayout>
      );
    }

    return (
      <ScreenLayout title={t('report.title')}>
        {staleNotice}

        <Report operation={operation} onOpenItem={onOpenItem} />

        <ImportButton disabled={busy} title={t('common.refresh')} onPress={onRefresh} />

        <ImportButton
          disabled={busy}
          title={t('delete.action')}
          variant="danger"
          onPress={onDelete}
        />

        <ImportButton title={t('common.diagnostics')} onPress={onDiagnostics} />
      </ScreenLayout>
    );
  }
);

TrackingStatus.displayName = 'TrackingStatus';

export default TrackingStatus;
