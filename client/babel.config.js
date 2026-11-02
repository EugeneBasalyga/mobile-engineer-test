const ReactCompilerConfig = {
  /* ... */
};

module.exports = {
  plugins: [
    [
      'react-native-unistyles/plugin',
      {
        root: './src',
      },
    ],
    ['babel-plugin-react-compiler', ReactCompilerConfig],
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
        },
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.jsx',
          '.js',
          '.json',
          '.svg',
        ],
        root: ['./src'],
      },
    ],
    'react-native-worklets/plugin',
  ],
  presets: ['module:@react-native/babel-preset'],
};
