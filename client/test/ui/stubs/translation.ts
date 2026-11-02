import ru from '@/packages/statementImport/localization/ru';

// Real strings, so the assertions read the same text the user sees.
const translate = (key: string, values: Record<string, string> = {}) => {
  const template = key.split('.').reduce<unknown>((node, part) => (node as never)[part], ru);

  return Object.entries(values).reduce(
    (text, [name, value]) => text.replace(`{{${name}}}`, value),
    template as string
  );
};

export const useTranslation = () => ({ t: translate });
