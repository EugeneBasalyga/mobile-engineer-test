import { useNavigation } from '@react-navigation/native';
import { type FC, useState } from 'react';
import { Alert, AppState } from 'react-native';

import { useMount } from '@/packages/shared/hooks/lifecycle';
import { useTranslation } from '@/packages/shared/hooks/translation';

import { type MainNavigationProps } from '@/app/models/navigation/main';
import { MAIN_ROUTE } from '@/app/routes/routes';
import ConfirmView from '@/packages/statementImport/components/ConfirmView';
import { Progress, Screen } from '@/packages/statementImport/components/Layout';
import StartView from '@/packages/statementImport/components/StartView';
import StatusView from '@/packages/statementImport/components/StatusView';
import { useImportCoordinator } from '@/packages/statementImport/hooks/importCoordinator';
import { pickStatement } from '@/packages/statementImport/platform/picker';

const ImportScreen: FC = () => {
  const { t } = useTranslation('statementImport');

  const navigation = useNavigation<MainNavigationProps<typeof MAIN_ROUTE.IMPORT>>();

  const { coordinator, state } = useImportCoordinator();

  const [pickError, setPickError] = useState(false);

  useMount(() => {
    coordinator.start();

    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') {
        coordinator.refresh();
      }
    });

    return () => subscription.remove();
  });

  const openDiagnostics = () => navigation.navigate(MAIN_ROUTE.DIAGNOSTICS);

  const pick = async () => {
    setPickError(false);
    coordinator.clearRejection();

    try {
      const result = await pickStatement();

      if (result.kind === 'tooLarge') {
        coordinator.rejectTooLarge();
      } else if (result.kind === 'picked') {
        await coordinator.acceptPicked(result.file);
      }
    } catch {
      setPickError(true);
    }
  };

  const confirmDelete = () => {
    Alert.alert(t('delete.dialogTitle'), t('delete.dialogMessage'), [
      { style: 'cancel', text: t('delete.dialogCancel') },
      {
        onPress: () => coordinator.requestDelete(),
        style: 'destructive',
        text: t('delete.dialogConfirm'),
      },
    ]);
  };

  if (!state.ready) {
    return (
      <Screen title={t('start.title')}>
        <Progress label={t('start.loading')} />
      </Screen>
    );
  }

  if (state.operation) {
    const { deleteOutcome, view } = state.operation;

    return (
      <StatusView
        busy={state.busy}
        connectionLost={state.connectionLost}
        operation={state.operation}
        onDelete={deleteOutcome ? () => coordinator.requestDelete() : confirmDelete}
        onDiagnostics={openDiagnostics}
        onDismiss={() => coordinator.dismiss()}
        onRecover={() => coordinator.recover()}
        onRefresh={() => coordinator.refresh()}
        onRetrySend={() => coordinator.retrySend()}
        onOpenItem={(item) =>
          navigation.navigate(MAIN_ROUTE.ITEM, { currency: view?.currency ?? '', item })
        }
      />
    );
  }

  if (state.draft) {
    return (
      <ConfirmView
        busy={state.busy}
        draft={state.draft}
        onCancel={() => coordinator.cancelDraft()}
        onConfirm={() => coordinator.confirmDraft()}
      />
    );
  }

  return (
    <StartView
      pickError={pickError}
      rejection={state.rejection}
      onDiagnostics={openDiagnostics}
      onPick={pick}
    />
  );
};

export default ImportScreen;
