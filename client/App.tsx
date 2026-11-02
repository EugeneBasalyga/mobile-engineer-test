import * as DocumentPicker from 'expo-document-picker';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Alert, AppState, BackHandler, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import type { RecurringItem } from './src/core/operation';
import { API_BASE_URL, createCoordinator } from './src/platform/createCoordinator';
import { colors, Progress, Screen } from './src/ui/components';
import { ConfirmScreen } from './src/ui/ConfirmScreen';
import { DiagnosticsScreen } from './src/ui/DiagnosticsScreen';
import { ItemScreen } from './src/ui/ItemScreen';
import { StartScreen } from './src/ui/StartScreen';
import { StatusScreen } from './src/ui/StatusScreen';

export default function App() {
  const coordinator = useMemo(createCoordinator, []);
  const state = useSyncExternalStore(coordinator.subscribe, coordinator.getState);
  const [overlay, setOverlay] = useState<{ item: RecurringItem } | 'diagnostics' | null>(null);
  const [pickError, setPickError] = useState(false);

  useEffect(() => {
    void coordinator.start();
    const subscription = AppState.addEventListener('change', status => {
      if (status === 'active') void coordinator.refresh();
    });
    return () => subscription.remove();
  }, [coordinator]);

  useEffect(() => {
    if (!overlay) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setOverlay(null);
      return true;
    });
    return () => subscription.remove();
  }, [overlay]);

  const pick = async () => {
    setPickError(false);
    coordinator.clearRejection();
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
      if (result.canceled) return;
      const asset = result.assets[0];
      await coordinator.acceptPicked({ path: asset.uri, name: asset.name, declaredSize: asset.size });
    } catch {
      setPickError(true);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Удалить импорт?', 'Данные будут удалены с сервера.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => void coordinator.requestDelete() },
    ]);
  };

  const content = () => {
    if (!state.ready) {
      return (
        <Screen title="Импорт выписки">
          <Progress label="Загружаем состояние." />
        </Screen>
      );
    }
    if (overlay === 'diagnostics') {
      return <DiagnosticsScreen baseUrl={API_BASE_URL} onBack={() => setOverlay(null)} />;
    }
    if (overlay && state.operation?.view?.currency) {
      return <ItemScreen item={overlay.item} currency={state.operation.view.currency} onBack={() => setOverlay(null)} />;
    }
    if (state.operation) {
      return (
        <StatusScreen
          operation={state.operation}
          connectionLost={state.connectionLost}
          busy={state.busy}
          onRetrySend={() => void coordinator.retrySend()}
          onRecover={() => void coordinator.recover()}
          onRefresh={() => void coordinator.refresh()}
          onDelete={state.operation.deleteOutcome ? () => void coordinator.requestDelete() : confirmDelete}
          onDismiss={() => void coordinator.dismiss()}
          onOpenItem={item => setOverlay({ item })}
          onDiagnostics={() => setOverlay('diagnostics')}
        />
      );
    }
    if (state.draft) {
      return (
        <ConfirmScreen
          draft={state.draft}
          busy={state.busy}
          onConfirm={() => void coordinator.confirmDraft()}
          onCancel={() => void coordinator.cancelDraft()}
        />
      );
    }
    return (
      <StartScreen
        rejection={state.rejection}
        pickError={pickError}
        onPick={() => void pick()}
        onDiagnostics={() => setOverlay('diagnostics')}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        {content()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
