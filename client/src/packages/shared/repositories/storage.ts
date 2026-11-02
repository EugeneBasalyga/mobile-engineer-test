import { createMMKV, type MMKV } from 'react-native-mmkv';

interface IStorageConfig {
  id: string;
  encryptionKey?: string;
}

class StorageRepository {
  private storage: MMKV;

  constructor(config: IStorageConfig) {
    this.storage = createMMKV(config);

    this.getItem = this.getItem.bind(this);
    this.setItem = this.setItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
  }

  getItem(key: string) {
    return this.storage.getString(key) || null;
  }

  setItem(key: string, value: string) {
    this.storage.set(key, value);
  }

  removeItem(key: string) {
    this.storage.remove(key);
  }
}

export default StorageRepository;
