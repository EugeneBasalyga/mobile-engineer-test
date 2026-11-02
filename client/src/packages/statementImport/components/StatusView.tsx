/* eslint-disable react/no-unused-prop-types */
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/packages/shared/components';
import { useTranslation } from '@/packages/shared/hooks/translation';

import {
  Action,
  Body,
  Notice,
  Progress,
  Row,
  Screen,
} from '@/packages/statementImport/components/Layout';
import {
  formatMinor,
  type Operation,
  type RecurringItem,
  totalMinor,
} from '@/packages/statementImport/core/operation';

const styles = StyleSheet.create((theme) => ({
  item: {
    borderColor: theme.colors.neutral300,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  merchant: {
    ...theme.typography.body.l.medium,
  },
  report: {
    gap: theme.spacing.lg,
  },
}));

export interface StatusViewProps {
  busy: boolean;
  connectionLost: boolean;
  onDelete: () => void;
  onDiagnostics: () => void;
  onDismiss: () => void;
  onOpenItem: (item: RecurringItem) => void;
  onRecover: () => void;
  onRefresh: () => void;
  onRetrySend: () => void;
  operation: Operation;
}

const Report = ({ onOpenItem, operation }: Pick<StatusViewProps, 'onOpenItem' | 'operation'>) => {
  const { t } = useTranslation('statementImport');

  const items = operation.view?.items;
  const currency = operation.view?.currency;

  if (!items || !currency) {
    return null;
  }

  return (
    <View style={styles.report}>
      <Row
        label={t('report.total')}
        value={t('report.perMonth', { amount: formatMinor(totalMinor(items), currency) })}
      />

      {items.map((item) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.merchant}>{item.merchant}</Text>

          <Body>{formatMinor(item.amountMinor, currency)}</Body>

          <Body muted>{t('report.lastSeen', { date: item.lastSeen })}</Body>

          <Action
            title={t('report.details', { merchant: item.merchant })}
            onPress={() => onOpenItem(item)}
          />
        </View>
      ))}
    </View>
  );
};

const Uncertain = ({ busy, onDismiss, onRecover, onRetrySend, operation }: StatusViewProps) => {
  const { t } = useTranslation('statementImport');

  if (operation.recovery === 'checking' || operation.recovery === undefined) {
    return (
      <Screen title={t('uncertain.checkingTitle')}>
        <Progress label={t('uncertain.checking')} />
      </Screen>
    );
  }

  const notFound = operation.recovery === 'notFound';

  return (
    <Screen title={t('uncertain.title')}>
      <Notice>{t(notFound ? 'uncertain.notFound' : 'uncertain.unreachable')}</Notice>

      {notFound && (
        <Action
          disabled={busy}
          title={t('uncertain.retry')}
          variant="primary"
          onPress={onRetrySend}
        />
      )}

      <Action disabled={busy} title={t('uncertain.recheck')} onPress={onRecover} />

      <Body muted>{t('uncertain.abandonHint')}</Body>

      <Action disabled={busy} title={t('uncertain.abandon')} onPress={onDismiss} />
    </Screen>
  );
};

const Tracking = ({
  busy,
  connectionLost,
  onDelete,
  onDiagnostics,
  onOpenItem,
  onRefresh,
  operation,
}: StatusViewProps) => {
  const { t } = useTranslation('statementImport');

  const status = operation.view?.status;
  const staleNotice = connectionLost && <Notice>{t('tracking.connectionLost')}</Notice>;

  if (status !== 'ready') {
    const queued = status === 'queued';

    return (
      <Screen title={t(queued ? 'tracking.queuedTitle' : 'tracking.processingTitle')}>
        <Progress label={t(queued ? 'tracking.queuedBody' : 'tracking.processingBody')} />

        {staleNotice}
      </Screen>
    );
  }

  return (
    <Screen title={t('report.title')}>
      {staleNotice}

      <Report operation={operation} onOpenItem={onOpenItem} />

      <Action disabled={busy} title={t('common.refresh')} onPress={onRefresh} />

      <Action disabled={busy} title={t('delete.action')} variant="primary" onPress={onDelete} />

      <Action title={t('common.diagnostics')} onPress={onDiagnostics} />
    </Screen>
  );
};

const DeleteInProgress = ({
  busy,
  onDelete,
  onDiagnostics,
  onOpenItem,
  onRefresh,
  operation,
}: StatusViewProps) => {
  const { t } = useTranslation('statementImport');

  if (operation.deleteOutcome === 'pending') {
    return (
      <Screen title={t('delete.pendingTitle')}>
        <Progress label={t('delete.pendingBody')} />
      </Screen>
    );
  }

  return (
    <Screen title={t('delete.title')}>
      <Notice>
        {t(operation.deleteOutcome === 'refused' ? 'delete.refused' : 'delete.unknown')}
      </Notice>

      <Action disabled={busy} title={t('delete.retry')} variant="primary" onPress={onDelete} />

      <Action disabled={busy} title={t('common.refresh')} onPress={onRefresh} />

      <Report operation={operation} onOpenItem={onOpenItem} />

      <Action title={t('common.diagnostics')} onPress={onDiagnostics} />
    </Screen>
  );
};

const StatusView = (props: StatusViewProps) => {
  const { t } = useTranslation('statementImport');

  const { onDismiss, operation } = props;

  switch (operation.phase) {
    case 'sending':
      return (
        <Screen title={t('sending.title')}>
          <Progress label={t('sending.body')} />
        </Screen>
      );
    case 'uncertain':
      return <Uncertain {...props} />;
    case 'tracking':
      return <Tracking {...props} />;
    case 'deleteRequested':
      return <DeleteInProgress {...props} />;
    case 'deleted':
      return (
        <Screen title={t('delete.doneTitle')}>
          <Body>{t('delete.doneBody')}</Body>

          <Action title={t('delete.doneAction')} variant="primary" onPress={onDismiss} />
        </Screen>
      );
    case 'failed':
      return (
        <Screen title={t('failed.title')}>
          <Notice>{t(`failed.${operation.failure ?? 'unexpected'}`)}</Notice>

          <Action title={t('failed.action')} variant="primary" onPress={onDismiss} />
        </Screen>
      );
    case 'missingOnServer':
      return (
        <Screen title={t('missing.title')}>
          <Notice>{t('missing.body')}</Notice>

          <Action title={t('missing.action')} variant="primary" onPress={onDismiss} />
        </Screen>
      );
  }
};

export default StatusView;
