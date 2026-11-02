import { memo } from 'react';

import { useTranslation } from '@/packages/shared/hooks/translation';

import BodyText from '@/packages/statementImport/components/BodyText';
import ImportButton from '@/packages/statementImport/components/ImportButton';
import Notice from '@/packages/statementImport/components/Notice';
import ScreenLayout from '@/packages/statementImport/components/ScreenLayout';
import { type FileRejection } from '@/packages/statementImport/models/statementImport';

interface StartViewProps {
  onDiagnostics: () => void;
  onPick: () => void;
  pickFailed: boolean;
  rejection: FileRejection | null;
}

const StartView = memo(({ onDiagnostics, onPick, pickFailed, rejection }: StartViewProps) => {
  const { t } = useTranslation('statementImport');

  return (
    <ScreenLayout title={t('start.title')}>
      <BodyText muted>{t('start.empty')}</BodyText>

      {!!rejection && (
        <Notice>{t(rejection === 'empty' ? 'start.emptyFile' : `start.${rejection}`)}</Notice>
      )}

      {pickFailed && <Notice>{t('start.pickError')}</Notice>}

      <ImportButton title={t('start.pick')} variant="primary" onPress={onPick} />

      <ImportButton title={t('common.diagnostics')} onPress={onDiagnostics} />
    </ScreenLayout>
  );
});

StartView.displayName = 'StartView';

export default StartView;
