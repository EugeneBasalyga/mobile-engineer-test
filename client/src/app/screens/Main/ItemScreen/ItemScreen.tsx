import { type FC } from 'react';

import { useTranslation } from '@/packages/shared/hooks/translation';

import { ImportButton, InfoRow, ScreenLayout } from '@/packages/statementImport/components';

import { useItemScreen } from './useItemScreen';

const ItemScreen: FC = () => {
  const { t } = useTranslation('statementImport');

  const { amount, cadence, handleBackPress, lastSeen, merchant } = useItemScreen();

  return (
    <ScreenLayout title={merchant}>
      <InfoRow label={t('item.amount')} value={amount} />

      <InfoRow label={t('item.cadence')} value={cadence} />

      <InfoRow label={t('item.lastSeen')} value={lastSeen} />

      <ImportButton title={t('common.back')} variant="primary" onPress={handleBackPress} />
    </ScreenLayout>
  );
};

export default ItemScreen;
