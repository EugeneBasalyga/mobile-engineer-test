import { formatMinor, type RecurringItem } from '../core/operation';
import { Action, Row, Screen } from './components';

const CADENCE_TEXT: Record<string, string> = { monthly: 'Ежемесячно' };

type Props = { item: RecurringItem; currency: string; onBack: () => void };

export function ItemScreen({ item, currency, onBack }: Props) {
  return (
    <Screen title={item.merchant}>
      <Row label="Сумма" value={formatMinor(item.amountMinor, currency)} />
      <Row label="Периодичность" value={CADENCE_TEXT[item.cadence] ?? item.cadence} />
      <Row label="Последнее списание" value={item.lastSeen} />
      <Action label="Назад" kind="primary" onPress={onBack} />
    </Screen>
  );
}
