import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import statementImportLocalization from '@/packages/statementImport/localization/ru';

const LANGUAGE = 'ru';

export const resources = {
  [LANGUAGE]: {
    statementImport: statementImportLocalization,
    translation: {},
  },
} as const;

export const initI18n = () => {
  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    debug: false,
    fallbackLng: LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    keySeparator: '.',
    lng: LANGUAGE,
    resources,
    showSupportNotice: false,
  });
};

export default i18n;
