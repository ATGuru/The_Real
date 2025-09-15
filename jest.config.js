module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-drawer-layout|react-native-gesture-handler|react-native-reanimated|uuid)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
