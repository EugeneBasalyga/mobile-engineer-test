import { type IRecurringItem } from '@/packages/statementImport/models/statementImport';

export const formatMinor = (amountMinor: number, currency: string) => {
  const units = Math.floor(amountMinor / 100);
  const cents = String(amountMinor % 100).padStart(2, '0');

  return `${units}.${cents} ${currency}`;
};

export const getTotalMinor = (items: IRecurringItem[]) => {
  return items.reduce((sum, item) => sum + item.amountMinor, 0);
};
