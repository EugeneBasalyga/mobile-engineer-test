import { getI18n } from 'react-i18next';

import { Language } from '@/packages/shared/constants/language';

export const getCurrentLanguage = (): Language => {
  const i18n = getI18n();

  const { language: currentLanguage, languages } = i18n;

  if (!languages.includes(currentLanguage)) {
    if (!i18n.options.fallbackLng) {
      return Language.EN;
    }

    if (Array.isArray(i18n.options.fallbackLng)) {
      return i18n.options.fallbackLng[0];
    }

    return i18n.options.fallbackLng as Language;
  }

  return currentLanguage as Language;
};
