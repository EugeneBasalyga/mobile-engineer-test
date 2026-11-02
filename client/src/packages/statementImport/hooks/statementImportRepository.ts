import { useApplicationContext } from '@/packages/shared/contexts/ApplicationContext';

export const useStatementImportRepository = () => {
  const {
    repositories: { statementImport: statementImportRepository },
  } = useApplicationContext();

  return statementImportRepository;
};
