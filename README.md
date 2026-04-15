# Course App — React Native Template

A mobile course application built with **React Native 0.84.1** + **TypeScript 5.8**. Bare React Native (no Expo), using `@react-native-community/cli`.

## Prerequisites

- Node.js >= 22.11.0
- Yarn 1.22+
- Ruby (for iOS CocoaPods)
- Xcode (iOS) / Android Studio (Android)
- JDK 17+ (Android)

## Getting Started

```bash
# Install dependencies
yarn install

# iOS only — install CocoaPods
cd ios && pod install && cd ..

# Start Metro bundler
yarn start

# Run on Android
yarn android

# Run on iOS
yarn ios
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `yarn start` | Start the Metro bundler |
| `yarn android` | Build and run on Android |
| `yarn ios` | Build and run on iOS |
| `yarn test` | Run all tests (Jest) |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:coverage` | Run tests with coverage report |
| `yarn lint` | Run ESLint |
| `yarn env-dev` | Switch to development environment |
| `yarn env-stg` | Switch to staging environment |
| `yarn env-prd` | Switch to production environment |
| `yarn android-clean` | Clean Android build |
| `yarn android-build` | Production Android APK build |

## Project Structure

```
src/
├── assets/              # Static files: fonts, icons, images
├── components/          # Shared UI components
│   ├── atoms/           # Primitives (error-boundary)
│   ├── button/          # Button, IconButton, CheckBox
│   ├── inputs/          # TextInput, DateInput, SearchInput, DropdownInput
│   ├── organisms/       # Complex composed components
│   └── *.tsx            # Standalone shared components (Header, Container, Avatar, etc.)
├── constan/             # Constants (app.ts, dimensions.ts)
├── helpers/             # Utility functions (api, auth)
├── hooks/               # Custom React hooks
├── i18n/                # i18next setup + locale files (en, id)
├── lib/                 # 3rd-party library integrations
│   ├── ky/              # HTTP client (Ky) with auth interceptors
│   ├── react-query/     # Data fetching layer (service, hooks, query keys)
│   ├── redux/           # State management (slices, store, root-reducer)
│   └── storage/         # MMKV storage adapters
├── model/               # TypeScript type definitions (API, Redux state)
├── router/              # Navigation configuration
├── screens/             # Screen components grouped by feature
└── themes/              # @shopify/restyle design tokens
```

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native 0.84.1 |
| Language | TypeScript 5.8 |
| Navigation | React Navigation 7 (native-stack + bottom-tabs) |
| State Management | Redux Toolkit + redux-persist |
| Data Fetching | TanStack React Query 4 |
| HTTP Client | Ky |
| Storage | react-native-mmkv |
| UI Toolkit | @shopify/restyle |
| Icons | react-native-vector-icons (Feather) |
| i18n | i18next + react-i18next |
| Testing | Jest 29 + @testing-library/react-native 13 |
| Debugging | Reactotron |
| Git Hooks | Lefthook (ESLint → Prettier → import-sorter) |

## Import Aliases

Always use aliases instead of relative paths:

| Alias | Maps To |
|-------|---------|
| `@router/*` | `src/router/*` |
| `@models/*` | `src/model/*` |
| `@config` | `config/env` |
| `@react-query/*` | `src/lib/react-query/*` |
| `@redux-store/*` | `src/lib/redux/*` |
| `@lib/*` | `src/lib/*` |
| `@i18n` | `src/i18n` |
| `@components/*` | `src/components/*` |
| `@screens/*` | `src/screens/*` |
| `@app/*` | `src/*` |

Aliases are defined in `tsconfig.path.json` and `babel.config.js`.

## Environment Configuration

Environment settings are in `config/env.ts`. Switch environments with:

```bash
yarn env-dev   # Development
yarn env-stg   # Staging
yarn env-prd   # Production
```

## Testing

```bash
yarn test                                     # Run all tests
yarn test:watch                               # Watch mode
yarn test:coverage                            # With coverage report
yarn test -- --testPathPattern="components"   # Filter by path
```

Tests use `renderWithProviders` from `src/test-utils.tsx` which wraps components with Redux, React Query, Theme, and Navigation providers.

## Key Conventions

- Use `Box` / `Text` from `@app/themes` instead of raw `View` / `Text`
- Use `Container` + `Header` as screen wrappers
- Use `useAppSelector` / `useAppDispatch` from `@app/hooks/redux`
- Use `Api` from `@lib/ky/base` for HTTP requests
- Screens are default-exported and placed in `src/screens/{feature}/`
- Redux slices follow: store-key → slice → root-reducer registration
- React Query follows: query-key → service → hook → query-hooks export
