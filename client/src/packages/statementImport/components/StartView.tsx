import { useTranslation } from '@/packages/shared/hooks/translation';

import { Action, Body, Notice, Screen } from '@/packages/statementImport/components/Layout';
import { type Rejection } from '@/packages/statementImport/core/validateFile';

interface StartViewProps {
  onDiagnostics: () => void;
  onPick: () => void;
  pickError: boolean;
  rejection: Rejection | null;
}

const StartView = ({ onDiagnostics, onPick, pickError, rejection }: StartViewProps) => {
  const { t } = useTranslation('statementImport');

  return (
    <Screen title={t('start.title')}>
      <Body muted>{t('start.empty')}</Body>

      {rejection && (
        <Notice>{t(rejection === 'empty' ? 'start.empty_file' : `start.${rejection}`)}</Notice>
      )}

      {pickError && <Notice>{t('start.pickError')}</Notice>}

      <Action title={t('start.pick')} variant="primary" onPress={onPick} />

      <Action title={t('common.diagnostics')} onPress={onDiagnostics} />
    </Screen>
  );
};

export default StartView;
