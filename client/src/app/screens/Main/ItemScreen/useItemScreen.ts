import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';

import { useTranslation } from '@/packages/shared/hooks/translation';

import { type MainNavigationProps, type MainRouteProps } from '@/app/models/navigation/main';
import { type MAIN_ROUTE } from '@/app/routes/routes';
import { formatMinor } from '@/packages/statementImport/utils/money';

export const useItemScreen = () => {
  const { t } = useTranslation('statementImport');

  const navigation = useNavigation<MainNavigationProps<typeof MAIN_ROUTE.ITEM>>();

  const {
    params: { currency, item },
  } = useRoute<MainRouteProps<typeof MAIN_ROUTE.ITEM>>();

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    amount: formatMinor(item.amountMinor, currency),
    cadence: item.cadence === 'monthly' ? t('item.monthly') : item.cadence,
    handleBackPress,
    lastSeen: item.lastSeen,
    merchant: item.merchant,
  };
};
