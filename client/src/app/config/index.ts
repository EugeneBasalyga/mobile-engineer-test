import { Config } from 'react-native-config';

// eslint-disable-next-line no-restricted-imports
import { version } from '../../../package.json';

const { API_URL, STORAGE_ENCRYPTION_KEY, STORAGE_ID } = Config;

const config = {
  api: {
    url: API_URL || 'http://127.0.0.1:8787',
  },
  app: {
    version,
  },
  storage: {
    encryptionKey: STORAGE_ENCRYPTION_KEY || '',
    id: STORAGE_ID || '',
  },
};

export default config;
