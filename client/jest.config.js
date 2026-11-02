const moduleNameMapper = { '^@/(.*)$': '<rootDir>/src/$1' };

module.exports = {
  projects: [
    {
      displayName: 'core',
      globals: { __DEV__: false },
      moduleNameMapper,
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/core/**/*.test.ts'],
      transform: {
        '\\.ts$': [
          'babel-jest',
          { babelrc: false, configFile: false, presets: ['module:@react-native/babel-preset'] },
        ],
      },
    },
    {
      displayName: 'ui',
      moduleNameMapper: {
        '^@/packages/shared/components$': '<rootDir>/test/ui/stubs/sharedComponents.tsx',
        '^@/packages/shared/hooks/translation$': '<rootDir>/test/ui/stubs/translation.ts',
        '^react-native-unistyles$': '<rootDir>/test/ui/stubs/unistyles.ts',
        ...moduleNameMapper,
      },
      preset: 'react-native',
      testMatch: ['<rootDir>/test/ui/**/*.test.tsx'],
      transform: {
        '\\.[jt]sx?$': [
          'babel-jest',
          { babelrc: false, configFile: false, presets: ['module:@react-native/babel-preset'] },
        ],
      },
    },
  ],
};
