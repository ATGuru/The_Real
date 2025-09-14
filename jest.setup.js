import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-device-info', () => ({
  getTotalMemory: jest.fn().mockResolvedValue(0),
  getFreeDiskStorage: jest.fn().mockResolvedValue(0),
  getSupportedAbis: jest.fn().mockResolvedValue([]),
}));

jest.useFakeTimers();
