import i18n from 'i18next';
import { I18nManager } from 'react-native';

import { Language } from '@/packages/shared/constants/language';
import { STORAGE_KEYS } from '@/packages/shared/constants/storage';
import type StorageRepository from '@/packages/shared/repositories/storage';

class LanguageService {
  public storageRepository: StorageRepository;

  constructor(storageRepository: StorageRepository) {
    this.storageRepository = storageRepository;

    this.getLanguage = this.getLanguage.bind(this);
    this.changeLanguage = this.changeLanguage.bind(this);
  }

  getLanguage() {
    const language = this.storageRepository.getItem(STORAGE_KEYS.LANGUAGE) || Language.EN;

    return language;
  }

  changeLanguage(lng: Language) {
    i18n.changeLanguage(lng);

    this.storageRepository.setItem(STORAGE_KEYS.LANGUAGE, lng);

    I18nManager.forceRTL(i18n.dir(lng) === 'rtl');
  }
}

export default LanguageService;
