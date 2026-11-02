import { useApplicationContext } from '@/packages/shared/contexts/ApplicationContext';

export const useTokenService = () => {
  const {
    services: { token: tokenService },
  } = useApplicationContext();

  return tokenService;
};
