import { useApplicationContext } from '@/packages/shared/contexts/ApplicationContext';

export const useLanguageService = () => {
  const {
    services: { language: languageService },
  } = useApplicationContext();

  return languageService;
};
