import { type PropsWithChildren, createContext, useContext, useMemo } from 'react';

import { type IApplicationContext as IInitApplicationContext } from '@/app/config/init';

interface IApplicationContext {
  repositories: IInitApplicationContext['repositories'];
  services: IInitApplicationContext['services'];
}

export const ApplicationContext = createContext<IApplicationContext | null>(null);

interface ApplicationContextProviderProps extends PropsWithChildren, IApplicationContext {}

const ApplicationContextProvider = ({
  children,
  repositories,
  services,
}: ApplicationContextProviderProps) => {
  const value = useMemo(() => ({ repositories, services }), [repositories, services]);

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
};

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);

  if (!context) {
    throw new Error('useApplicationContext must be used within an ApplicationContextProvider');
  }

  return context;
};

export default ApplicationContextProvider;
