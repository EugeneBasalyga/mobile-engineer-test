import AsyncStorage from '@react-native-async-storage/async-storage';

import type { OperationStore } from '../core/importCoordinator';
import type { Operation } from '../core/operation';

const KEY = 'import.operation.v1';

export const nativeStore: OperationStore = {
  async load() {
    const value = await AsyncStorage.getItem(KEY);
    return value ? (JSON.parse(value) as Operation) : null;
  },
  async save(operation) {
    if (operation) await AsyncStorage.setItem(KEY, JSON.stringify(operation));
    else await AsyncStorage.removeItem(KEY);
  },
};
