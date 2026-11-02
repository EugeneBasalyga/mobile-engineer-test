import { useTranslation } from '@/packages/shared/hooks/translation';

import { Action, Body, Row, Screen } from '@/packages/statementImport/components/Layout';
import { type Draft } from '@/packages/statementImport/core/importCoordinator';

const formatSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} Б`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} КиБ`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} МиБ`;
};

interface ConfirmViewProps {
  busy: boolean;
  draft: Draft;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmView = ({ busy, draft, onCancel, onConfirm }: ConfirmViewProps) => {
  const { t } = useTranslation('statementImport');

  return (
    <Screen title={t('confirm.title')}>
      <Row label={t('confirm.name')} value={draft.name} />

      <Row label={t('confirm.size')} value={formatSize(draft.byteSize)} />

      <Row label={t('confirm.format')} value={draft.format.toUpperCase()} />

      <Body muted>{t('confirm.hint')}</Body>

      <Action disabled={busy} title={t('confirm.send')} variant="primary" onPress={onConfirm} />

      <Action disabled={busy} title={t('confirm.cancel')} onPress={onCancel} />
    </Screen>
  );
};

export default ConfirmView;
