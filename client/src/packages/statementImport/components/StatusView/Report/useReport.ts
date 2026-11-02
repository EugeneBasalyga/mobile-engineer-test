import { useTranslation } from '@/packages/shared/hooks/translation';

import { type IOperation } from '@/packages/statementImport/models/statementImport';
import { formatMinor, getTotalMinor } from '@/packages/statementImport/utils/money';

export const useReport = ({ view }: IOperation) => {
  const { t } = useTranslation('statementImport');

  const currency = view?.currency;
  const items = view?.items;

  if (!currency || !items) {
    return { reportItems: null, totalLabel: '' };
  }

  return {
    reportItems: items.map((item) => ({
      amountLabel: formatMinor(item.amountMinor, currency),
      item,
    })),
    totalLabel: t('report.perMonth', { amount: formatMinor(getTotalMinor(items), currency) }),
  };
};
