// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  const storage = new Map();
  return {
    createMMKV: jest.fn(() => ({
      set: jest.fn((key, value) => storage.set(key, value)),
      getString: jest.fn(key => storage.get(key)),
      getNumber: jest.fn(key => storage.get(key)),
      getBoolean: jest.fn(key => storage.get(key)),
      remove: jest.fn(key => storage.delete(key)),
      contains: jest.fn(key => storage.has(key)),
      clearAll: jest.fn(() => storage.clear()),
      getAllKeys: jest.fn(() => Array.from(storage.keys())),
    })),
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Feather', () => 'FeatherIcon');

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = {top: 0, right: 0, bottom: 0, left: 0};
  return {
    SafeAreaProvider: jest.fn(({children}) => children),
    SafeAreaConsumer: jest.fn(({children}) => children(inset)),
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => ({x: 0, y: 0, width: 390, height: 844})),
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const RealComponent = jest.requireActual('react-native-screens');
  return {
    ...RealComponent,
    enableScreens: jest.fn(),
  };
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useIsFocused: jest.fn(() => true),
    useFocusEffect: jest.fn(),
  };
});

// Mock react-native-keyboard-aware-scroll-view
jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const {ScrollView} = require('react-native');
  return {
    KeyboardAwareScrollView: ScrollView,
  };
});

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => '1.0.0'),
  getBuildNumber: jest.fn(() => '1'),
  getUniqueId: jest.fn(() => 'test-device-id'),
  getDeviceId: jest.fn(() => 'test-device'),
  isEmulator: jest.fn(() => Promise.resolve(false)),
}));

// Mock Reactotron
jest.mock('reactotron-react-native', () => ({
  configure: jest.fn(() => ({
    useReactNative: jest.fn(() => ({
      use: jest.fn(() => ({connect: jest.fn()})),
    })),
  })),
  setAsyncStorageHandler: jest.fn(),
  createEnhancer: jest.fn(),
}));

// Silence LogBox warnings in tests
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
  __esModule: true,
  default: {
    ignoreLogs: jest.fn(),
    ignoreAllLogs: jest.fn(),
  },
}));
