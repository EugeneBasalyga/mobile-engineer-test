/* eslint-disable @typescript-eslint/no-var-requires */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const getConfig = (projectRoot) => {
  const {
    resolver: { sourceExts, assetExts },
  } = getDefaultConfig(projectRoot);

  return {
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'jsx', 'js', 'json', 'ts', 'tsx', 'svg'],
    },
  };
};

module.exports = mergeConfig(getDefaultConfig(__dirname), getConfig(__dirname));
