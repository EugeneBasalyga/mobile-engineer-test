const PACKAGES = ['shared', 'example'];

const DEFAULT_RESTRICTED_IMPORTS = {
  paths: [
    {
      importNames: ['useTranslation'],
      message: 'Please use useTranslation from "@/packages/shared/hooks/translation" instead.',
      name: 'react-i18next',
    },
  ],
  patterns: [
    {
      group: ['../*'],
      message: 'Please use absolute path (@/) instead.',
    },
  ],
};

const PACKAGES_RESTRICTED_IMPORTS = {
  ...DEFAULT_RESTRICTED_IMPORTS,
  patterns: [...DEFAULT_RESTRICTED_IMPORTS.patterns],
};

module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint-config-prettier',
    'plugin:import/recommended',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['node_modules'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 12,
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
    },
    {
      files: ['**/packages/**'],
      rules: {
        'no-restricted-imports': ['error', PACKAGES_RESTRICTED_IMPORTS],
      },
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'eslint-plugin-react-compiler',
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-native',
    'typescript-sort-keys',
    'sort-destructure-keys',
    'sort-keys-fix',
  ],
  root: true,
  rules: {
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        fixStyle: 'inline-type-imports',
        prefer: 'type-imports',
      },
    ],
    '@typescript-eslint/no-empty-object-type': [
      'error',
      {
        allowInterfaces: 'always',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
        vars: 'all',
      },
    ],
    'arrow-body-style': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/namespace': 'off',
    'import/no-extraneous-dependencies': [
      'warn',
      {
        devDependencies: true,
        optionalDependencies: true,
        peerDependencies: true,
      },
    ],
    'import/order': [
      'error',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        pathGroups: PACKAGES.map((package) => {
          return {
            group: 'internal',
            pattern: `@/packages/${package}/**`,
            position: 'before',
          };
        }),
      },
    ],
    'import/prefer-default-export': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'no-console': 'off',
    'no-empty-function': 'off',
    'no-restricted-exports': [
      'off',
      {
        restrictedNamedExports: ['default'],
      },
    ],
    'no-restricted-imports': ['error', DEFAULT_RESTRICTED_IMPORTS],
    'no-shadow': 'off',
    'no-use-before-define': 'off',
    'no-useless-rename': 'error',
    'object-shorthand': ['error', 'always'],
    'prefer-arrow-callback': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
      },
    ],
    'react/jsx-curly-brace-presence': [
      'error',
      {
        children: 'never',
        props: 'never',
      },
    ],
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.ts', '.tsx'],
      },
    ],
    'react/jsx-newline': [
      'error',
      {
        allowMultilines: false,
        prevent: false,
      },
    ],
    'react/jsx-no-useless-fragment': 'off',
    'react/jsx-props-no-spreading': ['off'],
    'react/jsx-sort-props': [
      'warn',
      {
        callbacksLast: true,
        ignoreCase: false,
        locale: 'auto',
        multiline: 'last',
        noSortAlphabetically: false,
        reservedFirst: true,
        shorthandFirst: true,
        shorthandLast: false,
      },
    ],
    'react/no-unused-prop-types': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'off',
    'react-compiler/react-compiler': 'error',
    'react-hooks/exhaustive-deps': [
      'warn',
      {
        additionalHooks:
          'useAnimatedStyle|useDerivedValue|useAnimatedProps|useAnimatedScrollHandler',
      },
    ],
    'sort-destructure-keys/sort-destructure-keys': [
      'warn',
      {
        caseSensitive: true,
      },
    ],
    'sort-keys-fix/sort-keys-fix': [
      'warn',
      'asc',
      {
        caseSensitive: true,
        natural: true,
      },
    ],
    'typescript-sort-keys/interface': [
      'warn',
      'asc',
      {
        caseSensitive: true,
        natural: true,
        requiredFirst: true,
      },
    ],
    'typescript-sort-keys/string-enum': [
      'warn',
      'asc',
      {
        caseSensitive: true,
        natural: true,
      },
    ],
  },
  settings: {
    'import/ignore': ['node_modules'],
    'import/resolver': {
      alias: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        map: [['^@', './src']],
      },
    },
    node: {
      extensions: ['.ts', '.tsx'],
      paths: ['src'],
    },
    react: {
      version: 'detect',
    },
  },
};
