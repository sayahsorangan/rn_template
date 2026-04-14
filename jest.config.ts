import {Config} from 'jest';
import path from 'path';

const config: Config = {
  preset: 'react-native',
  clearMocks: true,
  moduleDirectories: ['node_modules', path.join(__dirname, 'src')],
  moduleNameMapper: {
    '\\.svg': '<rootDir>/__mocks__/svgMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/jest/asset-transformer.js',
    '\\.(css|less)$': '<rootDir>/jest/asset-transformer.js',
    '^@router/(.*)$': '<rootDir>/src/router/$1',
    '^@models/(.*)$': '<rootDir>/src/model/$1',
    '^@config$': '<rootDir>/config/env',
    '^@react-query/(.*)$': '<rootDir>/src/lib/react-query/$1',
    '^@redux-store/(.*)$': '<rootDir>/src/lib/redux/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@i18n$': '<rootDir>/src/i18n',
    '^@components-atoms/(.*)$': '<rootDir>/src/components/atoms/$1',
    '^@components-organisms/(.*)$': '<rootDir>/src/components/organisms/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@app/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  setupFiles: ['./jest/setup.ts'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@shopify/restyle|react-native-vector-icons|react-native-mmkv|react-native-nitro-modules|react-native-screens|react-native-safe-area-context|react-native-keyboard-aware-scroll-view|react-native-date-picker|react-native-device-info|@tanstack|react-redux)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,tsx}',
    '!src/i18n/**',
    '!src/assets/**',
  ],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};

export default config;
