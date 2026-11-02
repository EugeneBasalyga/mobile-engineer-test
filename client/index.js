import { AppRegistry } from 'react-native';

import '@/app/theme/init';

import App from '@/app/App';

import { name as appName } from './app.json';

import '@/app/i18n/i18n';

AppRegistry.registerComponent(appName, () => App);
