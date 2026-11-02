import { memo } from 'react';

import { useTranslation } from '@/packages/shared/hooks/translation';

import BodyText from '@/packages/statementImport/components/BodyText';
import ImportButton from '@/packages/statementImport/components/ImportButton';
import Notice from '@/packages/statementImport/components/Notice';
import ProgressRow from '@/packages/statementImport/components/ProgressRow';
import ScreenLayout from '@/packages/statementImport/components/ScreenLayout';
import { type IOperation } from '@/packages/statementImport/models/statementImport';

interface UncertainStatusProps {
  busy: boolean;
  onDismiss: () => void;
  onRecover: () => void;
  onRetrySend: () => void;
  operation: IOperation;
}

const UncertainStatus = memo(
  ({ busy, onDismiss, onRecover, onRetrySend, operation }: UncertainStatusProps) => {
    const { t } = useTranslation('statementImport');

    if (operation.recovery === 'checking' || operation.recovery === undefined) {
      return (
        <ScreenLayout title={t('uncertain.checkingTitle')}>
          <ProgressRow label={t('uncertain.checking')} />
        </ScreenLayout>
      );
    }

    const notFound = operation.recovery === 'notFound';

    return (
      <ScreenLayout title={t('uncertain.title')}>
        <Notice>{t(notFound ? 'uncertain.notFound' : 'uncertain.unreachable')}</Notice>

        {notFound && (
          <ImportButton
            disabled={busy}
            title={t('uncertain.retry')}
            variant="primary"
            onPress={onRetrySend}
          />
        )}

        <ImportButton disabled={busy} title={t('uncertain.recheck')} onPress={onRecover} />

        <BodyText muted>{t('uncertain.abandonHint')}</BodyText>

        <ImportButton disabled={busy} title={t('uncertain.abandon')} onPress={onDismiss} />
      </ScreenLayout>
    );
  }
);

UncertainStatus.displayName = 'UncertainStatus';

export default UncertainStatus;
