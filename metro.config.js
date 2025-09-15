const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// Metro's exclusionList is exposed from metro-config internals in RN 0.74
const exclusionList = require('metro-config/src/defaults/exclusionList');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Exclude heavy, non-app directories from Metro to speed up bundling
    blockList: exclusionList([/llama\.cpp\/.*/, /AtlasAssistant\/.*/]),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
