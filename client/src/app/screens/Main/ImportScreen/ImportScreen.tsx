import { type FC } from 'react';

import { useTranslation } from '@/packages/shared/hooks/translation';

import {
  ConfirmView,
  ProgressRow,
  ScreenLayout,
  StartView,
  StatusView,
} from '@/packages/statementImport/components';

import { useImportScreen } from './useImportScreen';

const ImportScreen: FC = () => {
  const { t } = useTranslation('statementImport');

  const {
    busy,
    connectionLost,
    draft,
    handleCancelPress,
    handleConfirmPress,
    handleDeletePress,
    handleDiagnosticsPress,
    handleDismissPress,
    handleItemPress,
    handlePickPress,
    handleRecoverPress,
    handleRefreshPress,
    handleRetrySendPress,
    operation,
    pickFailed,
    ready,
    rejection,
  } = useImportScreen();

  if (!ready) {
    return (
      <ScreenLayout title={t('start.title')}>
        <ProgressRow label={t('start.loading')} />
      </ScreenLayout>
    );
  }

  if (operation) {
    return (
      <StatusView
        busy={busy}
        connectionLost={connectionLost}
        operation={operation}
        onDelete={handleDeletePress}
        onDiagnostics={handleDiagnosticsPress}
        onDismiss={handleDismissPress}
        onOpenItem={handleItemPress}
        onRecover={handleRecoverPress}
        onRefresh={handleRefreshPress}
        onRetrySend={handleRetrySendPress}
      />
    );
  }

  if (draft) {
    return (
      <ConfirmView
        busy={busy}
        draft={draft}
        onCancel={handleCancelPress}
        onConfirm={handleConfirmPress}
      />
    );
  }

  return (
    <StartView
      pickFailed={pickFailed}
      rejection={rejection}
      onDiagnostics={handleDiagnosticsPress}
      onPick={handlePickPress}
    />
  );
};

export default ImportScreen;
