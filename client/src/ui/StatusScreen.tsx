import { StyleSheet, Text, View } from 'react-native';

import { formatMinor, totalMinor, type Failure, type Operation, type RecurringItem } from '../core/operation';
import { Action, Body, colors, MAX_FONT_SCALE, Notice, Progress, Row, Screen } from './components';

const FAILURE_TEXT: Record<Failure, string> = {
  conflict: 'Сервер отклонил файл: этот ключ уже использован для другого файла.',
  rejectedByServer: 'Сервер не принял содержимое файла.',
  tooLargeForServer: 'Сервер отклонил файл из-за размера.',
  localCopyLost: 'Временная копия файла больше недоступна, повторить отправку нельзя. Выберите файл заново.',
  unexpected: 'Сервер ответил ошибкой.',
};

export type StatusActions = {
  onRetrySend: () => void;
  onRecover: () => void;
  onRefresh: () => void;
  onDelete: () => void;
  onDismiss: () => void;
  onOpenItem: (item: RecurringItem) => void;
  onDiagnostics: () => void;
};

type Props = StatusActions & { operation: Operation; connectionLost: boolean; busy: boolean };

function Report({ operation, onOpenItem }: Pick<Props, 'operation' | 'onOpenItem'>) {
  const items = operation.view?.items;
  const currency = operation.view?.currency;
  if (!items || !currency) return null;
  return (
    <View style={styles.report}>
      <Row label="Регулярные списания" value={`${formatMinor(totalMinor(items), currency)}/мес`} />
      {items.map(item => (
        <View key={item.id} style={styles.item}>
          <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={styles.merchant}>{item.merchant}</Text>
          <Body>{formatMinor(item.amountMinor, currency)}</Body>
          <Body muted>Последнее списание: {item.lastSeen}</Body>
          <Action label={`Подробнее: ${item.merchant}`} onPress={() => onOpenItem(item)} />
        </View>
      ))}
    </View>
  );
}

function Uncertain({ operation, busy, onRetrySend, onRecover, onDismiss }: Props) {
  if (operation.recovery === 'checking' || operation.recovery === undefined) {
    return (
      <Screen title="Проверяем отправку">
        <Progress label="Ответ сервера потерялся. Проверяем, дошёл ли файл." />
      </Screen>
    );
  }
  const notFound = operation.recovery === 'notFound';
  return (
    <Screen title="Результат отправки неизвестен">
      <Notice>
        {notFound
          ? 'Сервер пока не видит этот файл. Отправку можно повторить: второго импорта не появится.'
          : 'Нет связи с сервером, поэтому неизвестно, дошёл ли файл.'}
      </Notice>
      {notFound && <Action label="Отправить повторно" kind="primary" disabled={busy} onPress={onRetrySend} />}
      <Action label="Проверить ещё раз" disabled={busy} onPress={onRecover} />
      <Body muted>Если отказаться, а файл всё же дошёл, его данные останутся на сервере.</Body>
      <Action label="Отказаться" disabled={busy} onPress={onDismiss} />
    </Screen>
  );
}

function Tracking({ operation, connectionLost, busy, onRefresh, onDelete, onOpenItem, onDiagnostics }: Props) {
  const status = operation.view?.status;
  const staleNotice = connectionLost && <Notice>Нет связи с сервером. Показан последний известный статус.</Notice>;
  if (status !== 'ready') {
    return (
      <Screen title={status === 'queued' ? 'В очереди' : 'Обрабатывается'}>
        <Progress label={status === 'queued' ? 'Файл принят, ждёт обработки. Отчёт ещё не готов.' : 'Сервер обрабатывает файл. Отчёт ещё не готов.'} />
        {staleNotice}
      </Screen>
    );
  }
  return (
    <Screen title="Отчёт готов">
      {staleNotice}
      <Report operation={operation} onOpenItem={onOpenItem} />
      <Action label="Обновить" disabled={busy} onPress={onRefresh} />
      <Action label="Удалить импорт" kind="danger" disabled={busy} onPress={onDelete} />
      <Action label="Диагностика" onPress={onDiagnostics} />
    </Screen>
  );
}

function DeleteInProgress({ operation, busy, onDelete, onRefresh, onOpenItem, onDiagnostics }: Props) {
  if (operation.deleteOutcome === 'pending') {
    return (
      <Screen title="Удаляем импорт">
        <Progress label="Запрос на удаление отправлен. Данные считаются удалёнными только после подтверждения сервера." />
      </Screen>
    );
  }
  return (
    <Screen title="Импорт не удалён">
      <Notice>
        {operation.deleteOutcome === 'refused'
          ? 'Сервер не выполнил удаление. Данные остаются на сервере.'
          : 'Неизвестно, принял ли сервер запрос. Данные могут оставаться на сервере.'}
      </Notice>
      <Action label="Повторить удаление" kind="danger" disabled={busy} onPress={onDelete} />
      <Action label="Обновить" disabled={busy} onPress={onRefresh} />
      <Report operation={operation} onOpenItem={onOpenItem} />
      <Action label="Диагностика" onPress={onDiagnostics} />
    </Screen>
  );
}

export function StatusScreen(props: Props) {
  const { operation, onDismiss } = props;
  switch (operation.phase) {
    case 'sending':
      return (
        <Screen title="Отправляем файл">
          <Progress label="Передаём файл на сервер." />
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
        <Screen title="Импорт удалён">
          <Body>Сервер подтвердил удаление данных.</Body>
          <Action label="Готово" kind="primary" onPress={onDismiss} />
        </Screen>
      );
    case 'failed':
      return (
        <Screen title="Импорт не выполнен">
          <Notice>{FAILURE_TEXT[operation.failure ?? 'unexpected']}</Notice>
          <Action label="Выбрать другой файл" kind="primary" onPress={onDismiss} />
        </Screen>
      );
    case 'missingOnServer':
      return (
        <Screen title="Импорт не найден">
          <Notice>Сервер не знает этот импорт. Это не подтверждение удаления.</Notice>
          <Action label="Закрыть" kind="primary" onPress={onDismiss} />
        </Screen>
      );
  }
}

const styles = StyleSheet.create({
  report: { gap: 12 },
  item: { gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12 },
  merchant: { fontSize: 18, fontWeight: '600', color: colors.text },
});
