import { type NativeStackScreenProps } from '@react-navigation/native-stack';

import { type MAIN_ROUTE } from '@/app/routes/routes';
import { type IRecurringItem } from '@/packages/statementImport/models/statementImport';

// Here we pass interfaces for each screen in stack
// that can be passed as params and received further with useRoute hook
export type MainStackParamList = {
  [MAIN_ROUTE.DIAGNOSTICS]: undefined;
  [MAIN_ROUTE.IMPORT]: undefined;
  [MAIN_ROUTE.ITEM]: { currency: string; item: IRecurringItem };
};

export type MainScreenProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>;

export type MainNavigationProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>['navigation'];

export type MainRouteProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>['route'];

export type MainRouteParamsProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>['route']['params'];
