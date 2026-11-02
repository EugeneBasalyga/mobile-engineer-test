import { memo } from 'react';

import { useTranslation } from '@/packages/shared/hooks/translation';

import BodyText from '@/packages/statementImport/components/BodyText';
import ImportButton from '@/packages/statementImport/components/ImportButton';
import Notice from '@/packages/statementImport/components/Notice';
import ProgressRow from '@/packages/statementImport/components/ProgressRow';
import ScreenLayout from '@/packages/statementImport/components/ScreenLayout';
import DeleteStatus from '@/packages/statementImport/components/StatusView/DeleteStatus';
import TrackingStatus from '@/packages/statementImport/components/StatusView/TrackingStatus';
import UncertainStatus from '@/packages/statementImport/components/StatusView/UncertainStatus';
import {
  type IOperation,
  type IRecurringItem,
} from '@/packages/statementImport/models/statementImport';

interface StatusViewProps {
  busy: boolean;
  connectionLost: boolean;
  onDelete: () => void;
  onDiagnostics: () => void;
  onDismiss: () => void;
  onOpenItem: (item: IRecurringItem) => void;
  onRecover: () => void;
  onRefresh: () => void;
  onRetrySend: () => void;
  operation: IOperation;
}

const StatusView = memo(
  ({
    busy,
    connectionLost,
    onDelete,
    onDiagnostics,
    onDismiss,
    onOpenItem,
    onRecover,
    onRefresh,
    onRetrySend,
    operation,
  }: StatusViewProps) => {
    const { t } = useTranslation('statementImport');

    switch (operation.phase) {
      case 'sending':
        return (
          <ScreenLayout title={t('sending.title')}>
            <ProgressRow label={t('sending.body')} />
          </ScreenLayout>
        );
      case 'uncertain':
        return (
          <UncertainStatus
            busy={busy}
            operation={operation}
            onDismiss={onDismiss}
            onRecover={onRecover}
            onRetrySend={onRetrySend}
          />
        );
      case 'tracking':
        return (
          <TrackingStatus
            busy={busy}
            connectionLost={connectionLost}
            operation={operation}
            onDelete={onDelete}
            onDiagnostics={onDiagnostics}
            onOpenItem={onOpenItem}
            onRefresh={onRefresh}
          />
        );
      case 'deleteRequested':
        return (
          <DeleteStatus
            busy={busy}
            operation={operation}
            onDelete={onDelete}
            onDiagnostics={onDiagnostics}
            onOpenItem={onOpenItem}
            onRefresh={onRefresh}
          />
        );
      case 'deleted':
        return (
          <ScreenLayout title={t('delete.doneTitle')}>
            <BodyText>{t('delete.doneBody')}</BodyText>

            <ImportButton title={t('delete.doneAction')} variant="primary" onPress={onDismiss} />
          </ScreenLayout>
        );
      case 'failed':
        return (
          <ScreenLayout title={t('failed.title')}>
            <Notice>{t(`failed.${operation.failure ?? 'unexpected'}`)}</Notice>

            <ImportButton title={t('failed.action')} variant="primary" onPress={onDismiss} />
          </ScreenLayout>
        );
      case 'missingOnServer':
        return (
          <ScreenLayout title={t('missing.title')}>
            <Notice>{t('missing.body')}</Notice>

            <ImportButton title={t('missing.action')} variant="primary" onPress={onDismiss} />
          </ScreenLayout>
        );
    }
  }
);

StatusView.displayName = 'StatusView';

export default StatusView;
