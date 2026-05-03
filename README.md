# Course App — React Native Template

A mobile course application built with **React Native 0.84.1** + **TypeScript 5.8.3**. Bare React Native (no Expo), using `@react-native-community/cli`.

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

| Script               | Description                       |
| -------------------- | --------------------------------- |
| `yarn start`         | Start the Metro bundler           |
| `yarn android`       | Build and run on Android          |
| `yarn ios`           | Build and run on iOS              |
| `yarn test`          | Run all tests (Jest)              |
| `yarn test:watch`    | Run tests in watch mode           |
| `yarn test:coverage` | Run tests with coverage report    |
| `yarn lint`          | Run ESLint                        |
| `yarn env:dev`       | Switch to development environment |
| `yarn env:stg`       | Switch to staging environment     |
| `yarn env:prd`       | Switch to production environment  |
| `yarn android:clean` | Clean Android build               |
| `yarn android:build` | Production Android APK build      |

## Project Structure

```
src/
├── assets/              # Static files: fonts/, icons/, images/
├── components/          # Shared UI components
│   ├── atoms/           # Primitives (error-boundary)
│   ├── button/          # Button, IconButton, CheckBox
│   ├── inputs/          # TextInput, DateInput, SearchInput, DropdownInput
│   ├── organisms/       # Complex composed components (provider.tsx)
│   └── *.tsx            # Standalone shared components (Header, Container, Avatar, etc.)
├── constan/             # Constants (app.ts, dimensions.ts) — note: "constan" not "constants"
├── helpers/             # Utility functions (api.tsx, auth.tsx)
├── hooks/               # Custom React hooks (redux.ts)
├── i18n/                # i18next setup + locales/ (en.json, id.json)
├── lib/                 # 3rd-party library integrations
│   ├── ky/              # HTTP client (base.ts, hooks.ts, index.ts)
│   ├── llm/             # On-device LLM (index.ts, types.ts, hooks.ts, catalog.ts, downloader.ts)
│   ├── react-query/     # Data fetching layer
│   │   ├── {feature}/   # Feature-scoped: hooks.ts, keys.ts, service.ts, types.ts
│   │   ├── custom-hooks.ts  # Generic useRQ/useMQ/useInfiniteRQ wrappers
│   │   ├── query-client.ts  # QueryClient config + MMKV persister
│   │   └── query-provider.tsx  # QueryClientProvider wrapper
│   ├── redux/           # State management
│   │   ├── slice/       # Feature slices: {feature}/{feature}.ts + index.ts
│   │   ├── store.ts     # Store configuration
│   │   ├── root-reducer.ts  # Combined reducers
│   │   └── store-key.ts     # Slice key constants
│   └── storage/         # MMKV storage adapters (redux-storage, query-storage)
├── model/               # TypeScript type definitions
│   └── API/             # API response/request types (namespace-based: IUser, IApp)
├── router/              # Navigation configuration
│   ├── main-navigation.tsx   # NavigationContainer entry
│   ├── stack-navigation.tsx  # Root stack (splash → login → tabs)
│   ├── bottom-navigation.tsx # Bottom tab navigator
│   ├── navigation-helper.ts  # Navigation.navigate/back/push helpers
│   ├── route-name.ts         # Route name constants + type params
│   └── linking.ts            # Deep link config
├── screens/             # Screen components grouped by feature/
│   ├── auth/            # login-screen.tsx
│   ├── chat/            # chat-screen.tsx + components/model-picker-sheet.tsx
│   ├── home/            # main-home.tsx
│   ├── splash-screen.tsx
│   └── empty-screen.tsx
├── test-utils.tsx       # renderWithProviders helper
└── themes/              # @shopify/restyle design tokens
    ├── Theme.ts, Box.tsx, Text.tsx, elevation.ts
    └── *.json           # colors, spacing, fonts, border-radius tokens
```

## Tech Stack

| Category         | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Framework        | React Native 0.84.1                             |
| Language         | TypeScript 5.8.3                                |
| Navigation       | React Navigation 7 (native-stack + bottom-tabs) |
| State Management | Redux Toolkit 2 + redux-persist                 |
| Data Fetching    | TanStack React Query 4                          |
| HTTP Client      | Ky 2                                            |
| Storage          | react-native-mmkv 4                             |
| UI Toolkit       | @shopify/restyle 2                              |
| Icons            | react-native-vector-icons (Feather)             |
| i18n             | i18next 25 + react-i18next 15                   |
| Date Picker      | @react-native-community/datetimepicker 9        |
| On-device LLM    | llama.rn 0.12 (GGUF, llama.cpp)                 |
| File System      | react-native-fs 2 (model downloads)             |
| Markdown         | react-native-markdown-display 7                 |
| Testing          | Jest 29 + @testing-library/react-native 13      |
| Fonts            | Inter (Regular, Medium, SemiBold, Bold)         |
| Debugging        | Reactotron + Redux Flipper                      |
| Git Hooks        | Lefthook (ESLint → Prettier → import-sorter)    |

## Import Aliases

Always use aliases instead of relative paths:

| Alias                     | Maps To                      |
| ------------------------- | ---------------------------- |
| `@router/*`               | `src/router/*`               |
| `@models/*`               | `src/model/*`                |
| `@config`                 | `config/env`                 |
| `@react-query/*`          | `src/lib/react-query/*`      |
| `@redux-store/*`          | `src/lib/redux/*`            |
| `@lib/*`                  | `src/lib/*`                  |
| `@i18n`                   | `src/i18n`                   |
| `@components-atoms/*`     | `src/components/atoms/*`     |
| `@components-molecules/*` | `src/components/molecules/*` |
| `@components-organisms/*` | `src/components/organisms/*` |
| `@components/*`           | `src/components/*`           |
| `@screens/*`              | `src/screens/*`              |
| `@app/*`                  | `src/*`                      |

Aliases are defined in `tsconfig.path.json` and `babel.config.js`.

## Environment Configuration

Environment settings are in `config/env.ts`. Switch environments with:

```bash
yarn env:dev   # Development
yarn env:stg   # Staging
yarn env:prd   # Production
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
- Use `Container` as screen wrappers
- Use `useAppSelector` / `useAppDispatch` from `@app/hooks/redux`
- Use `Api` from `@lib/ky/base` for HTTP requests
- Screens are default-exported and placed in `src/screens/{feature}/`
- Redux slices follow: store-key → slice → root-reducer registration
- React Query follows: query-key → service → hook → query-hooks export
