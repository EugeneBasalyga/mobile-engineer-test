import { memo } from 'react';

import { useTranslation } from '@/packages/shared/hooks/translation';

import BodyText from '@/packages/statementImport/components/BodyText';
import ImportButton from '@/packages/statementImport/components/ImportButton';
import InfoRow from '@/packages/statementImport/components/InfoRow';
import ScreenLayout from '@/packages/statementImport/components/ScreenLayout';
import { type IDraft } from '@/packages/statementImport/models/statementImport';

import { useConfirmView } from './useConfirmView';

interface ConfirmViewProps {
  busy: boolean;
  draft: IDraft;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmView = memo(({ busy, draft, onCancel, onConfirm }: ConfirmViewProps) => {
  const { t } = useTranslation('statementImport');

  const { formatLabel, name, sizeLabel } = useConfirmView(draft);

  return (
    <ScreenLayout title={t('confirm.title')}>
      <InfoRow label={t('confirm.name')} value={name} />

      <InfoRow label={t('confirm.size')} value={sizeLabel} />

      <InfoRow label={t('confirm.format')} value={formatLabel} />

      <BodyText muted>{t('confirm.hint')}</BodyText>

      <ImportButton
        disabled={busy}
        title={t('confirm.send')}
        variant="primary"
        onPress={onConfirm}
      />

      <ImportButton disabled={busy} title={t('confirm.cancel')} onPress={onCancel} />
    </ScreenLayout>
  );
});

ConfirmView.displayName = 'ConfirmView';

export default ConfirmView;
