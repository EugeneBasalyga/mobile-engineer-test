import type { Draft } from '../core/importCoordinator';
import { Action, Body, Row, Screen } from './components';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КиБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МиБ`;
}

type Props = { draft: Draft; busy: boolean; onConfirm: () => void; onCancel: () => void };

export function ConfirmScreen({ draft, busy, onConfirm, onCancel }: Props) {
  return (
    <Screen title="Проверьте файл">
      <Row label="Имя" value={draft.name} />
      <Row label="Размер" value={formatSize(draft.byteSize)} />
      <Row label="Формат" value={draft.format.toUpperCase()} />
      <Body muted>Файл будет отправлен на сервер для обработки.</Body>
      <Action label="Отправить" kind="primary" disabled={busy} onPress={onConfirm} />
      <Action label="Отмена" disabled={busy} onPress={onCancel} />
    </Screen>
  );
}
