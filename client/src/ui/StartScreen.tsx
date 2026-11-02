import type { Rejection } from '../core/validateFile';
import { Action, Body, Notice, Screen } from './components';

const REJECTION_TEXT: Record<Rejection, string> = {
  tooLarge: 'Файл больше 10 МиБ. Он не отправлен, выберите файл поменьше.',
  unsupportedContent: 'Содержимое файла не похоже на PDF или CSV-выписку. Файл не отправлен.',
  empty: 'Файл пустой. Он не отправлен.',
};

type Props = {
  rejection: Rejection | null;
  pickError: boolean;
  onPick: () => void;
  onDiagnostics: () => void;
};

export function StartScreen({ rejection, pickError, onPick, onDiagnostics }: Props) {
  return (
    <Screen title="Импорт выписки">
      <Body muted>Импортов пока нет. Выберите выписку в формате PDF или CSV, размером до 10 МиБ.</Body>
      {rejection && <Notice>{REJECTION_TEXT[rejection]}</Notice>}
      {pickError && <Notice>Не удалось открыть файл. Попробуйте выбрать его ещё раз.</Notice>}
      <Action label="Выбрать файл" kind="primary" onPress={onPick} />
      <Action label="Диагностика" onPress={onDiagnostics} />
    </Screen>
  );
}
