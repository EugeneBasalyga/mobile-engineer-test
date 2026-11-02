import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Alert, AppState } from 'react-native';

import { useMount } from '@/packages/shared/hooks/lifecycle';
import { useTranslation } from '@/packages/shared/hooks/translation';

import { type MainNavigationProps } from '@/app/models/navigation/main';
import { MAIN_ROUTE } from '@/app/routes/routes';
import {
  useStatementImportService,
  useStatementImportState,
} from '@/packages/statementImport/hooks/statementImportService';
import { type IRecurringItem } from '@/packages/statementImport/models/statementImport';

export const useImportScreen = () => {
  const { t } = useTranslation('statementImport');

  const navigation = useNavigation<MainNavigationProps<typeof MAIN_ROUTE.IMPORT>>();

  const {
    cancelDraft,
    confirmDraft,
    dismiss,
    pickFile,
    recover,
    refresh,
    requestDelete,
    retrySend,
    start,
  } = useStatementImportService();
  const { busy, connectionLost, draft, operation, pickFailed, ready, rejection } =
    useStatementImportState();

  useMount(() => {
    start();

    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        refresh();
      }
    });

    return () => subscription.remove();
  });

  const currency = operation?.view?.currency ?? '';
  const deleteOutcome = operation?.deleteOutcome;

  const handleDiagnosticsPress = useCallback(() => {
    navigation.navigate(MAIN_ROUTE.DIAGNOSTICS);
  }, [navigation]);

  const handleItemPress = useCallback(
    (item: IRecurringItem) => {
      navigation.navigate(MAIN_ROUTE.ITEM, { currency, item });
    },
    [currency, navigation]
  );

  const handleDeletePress = useCallback(() => {
    if (deleteOutcome) {
      requestDelete();

      return;
    }

    Alert.alert(t('delete.dialogTitle'), t('delete.dialogMessage'), [
      { style: 'cancel', text: t('delete.dialogCancel') },
      { onPress: requestDelete, style: 'destructive', text: t('delete.dialogConfirm') },
    ]);
  }, [deleteOutcome, requestDelete, t]);

  return {
    busy,
    connectionLost,
    draft,
    handleCancelPress: cancelDraft,
    handleConfirmPress: confirmDraft,
    handleDeletePress,
    handleDiagnosticsPress,
    handleDismissPress: dismiss,
    handleItemPress,
    handlePickPress: pickFile,
    handleRecoverPress: recover,
    handleRefreshPress: refresh,
    handleRetrySendPress: retrySend,
    operation,
    pickFailed,
    ready,
    rejection,
  };
};
