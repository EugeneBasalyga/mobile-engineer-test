module.exports = {
  projects: [
    {
      displayName: 'core',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/core/**/*.test.ts'],
      transform: { '\\.ts$': ['babel-jest', { presets: [require.resolve('babel-preset-expo', { paths: [require.resolve('expo/package.json')] })] }] },
      globals: { __DEV__: false },
    },
    {
      displayName: 'ui',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/test/ui/**/*.test.tsx'],
    },
  ],
};
