import { useNavigation, useRoute } from '@react-navigation/native';
import { type FC } from 'react';

import { useTranslation } from '@/packages/shared/hooks/translation';

import { type MainNavigationProps, type MainRouteProps } from '@/app/models/navigation/main';
import { type MAIN_ROUTE } from '@/app/routes/routes';
import { Action, Row, Screen } from '@/packages/statementImport/components/Layout';
import { formatMinor } from '@/packages/statementImport/core/operation';

const ItemScreen: FC = () => {
  const { t } = useTranslation('statementImport');

  const navigation = useNavigation<MainNavigationProps<typeof MAIN_ROUTE.ITEM>>();

  const {
    params: { currency, item },
  } = useRoute<MainRouteProps<typeof MAIN_ROUTE.ITEM>>();

  return (
    <Screen title={item.merchant}>
      <Row label={t('item.amount')} value={formatMinor(item.amountMinor, currency)} />

      <Row
        label={t('item.cadence')}
        value={item.cadence === 'monthly' ? t('item.monthly') : item.cadence}
      />

      <Row label={t('item.lastSeen')} value={item.lastSeen} />

      <Action title={t('common.back')} variant="primary" onPress={navigation.goBack} />
    </Screen>
  );
};

export default ItemScreen;
