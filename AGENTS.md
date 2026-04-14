# AGENTS.md — Project Conventions & Instructions

## Project Overview

React Native 0.78.2 + TypeScript 5.0.4 course app template.  
**No Expo** — uses bare React Native with `react-native-community/cli`.

Run commands:
```bash
yarn install
yarn android   # or yarn ios
```

---

## Import Aliases (ALWAYS use these)

| Alias | Maps To |
|-------|---------|
| `@router/*` | `./src/router/*` |
| `@models/*` | `./src/model/*` |
| `@config` | `./config/env` |
| `@react-query/*` | `./src/lib/react-query/*` |
| `@redux-store/*` | `./src/lib/redux/*` |
| `@lib/*` | `./src/lib/*` |
| `@i18n` | `./src/i18n` |
| `@components-atoms/*` | `./src/components/atoms/*` |
| `@components-organisms/*` | `./src/components/organisms/*` |
| `@components/*` | `./src/components/*` |
| `@screens/*` | `./src/screens/*` |
| `@app/*` | `./src/*` |

**NEVER use relative paths** like `../../../components/Button`. Always use aliases.  
Aliases are defined in both `tsconfig.path.json` and `babel.config.js`.

---

## Folder Structure

```
src/
├── assets/              # Static files: fonts/, icons/, images/
├── components/          # Shared UI components
│   ├── atoms/           # Primitives (error-boundary)
│   ├── button/          # Button, IconButton, CheckBox
│   ├── inputs/          # TextInput, DateInput, SearchInput, DropdownInput
│   ├── organisms/       # Complex composed components (provider.tsx)
│   └── {name}.tsx       # Standalone shared components
├── constan/             # Constants (app.ts, dimensions.ts) — note: "constan" not "constants"
├── helpers/             # Utility functions (api.tsx, auth.tsx)
├── hooks/               # Custom React hooks
├── i18n/                # i18next setup + locales/ (en, id)
├── lib/                 # 3rd-party library integrations
│   ├── ky/              # HTTP client (base.ts, hooks.ts)
│   ├── react-query/     # Data fetching layer
│   │   ├── hooks/       # Feature-specific query hooks
│   │   ├── service/     # API service functions
│   │   ├── query-key.ts # All query cache keys
│   │   ├── query-hooks.ts  # Exported hook aggregates
│   │   ├── query-client.ts # QueryClient config
│   │   └── custom-hooks.ts # Generic useRQ/useMQ/useInfiniteRQ
│   ├── redux/           # State management
│   │   ├── slice/       # Feature slices: {feature}/{feature}.ts
│   │   ├── store.ts     # Store configuration
│   │   ├── root-reducer.ts # Combined reducers
│   │   └── store-key.ts # Slice key constants
│   └── storage/         # MMKV storage adapters
├── model/               # TypeScript type definitions
│   ├── API/             # API response/request types (namespace-based)
│   └── redux-state/     # Redux state types
├── router/              # Navigation config
├── screens/             # Screen components (grouped by feature/)
└── themes/              # @shopify/restyle design tokens
```

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Screen files | `kebab-case.tsx` | `login-screen.tsx`, `main-home.tsx` |
| Component files | `kebab-case.tsx` or `PascalCase.tsx` | `Button.tsx`, `empty-data.tsx` |
| Redux slice files | `{feature}.ts` inside `slice/{feature}/` | `slice/user/user.ts` |
| Service files | `{feature}.ts` inside `service/` | `service/app.ts` |
| Hook files | `{feature}.ts` inside `hooks/` | `hooks/app.ts` |
| Redux actions export | `{feature}_action` | `user_action`, `app_action` |
| Redux reducer export | `{Feature}Reducer` | `UserReducer`, `AppReducer` |
| Query key export | `{Feature}QueryKey` | `AppQueryKey` |
| API model namespace | `I{Feature}` | `IUser`, `IApp`, `ICourse` |

---

## Redux Slice Pattern

Every Redux slice follows this exact structure:

```typescript
// src/lib/redux/slice/{feature}/{feature}.ts
import {createSlice} from '@reduxjs/toolkit';
import {persistReducer} from '@lib/storage/redux-storage';
import {storeKey} from '@redux-store/store-key';

interface FeatureState {
  // typed state
}

const initialState: FeatureState = {
  // defaults
};

const slice = createSlice({
  name: storeKey.Feature,           // key from store-key.ts
  initialState,
  reducers: {
    setData: (state, {payload}) => {
      state.data = payload;
    },
    onReset: () => initialState,
  },
});

export const feature_action = slice.actions;
export const FeatureReducer = persistReducer(
  {key: storeKey.Feature},
  slice.reducer,
);
```

**Requirements:**
1. Always add the key to `store-key.ts` first
2. Always use the custom `persistReducer` from `@lib/storage/redux-storage` (NOT from redux-persist directly)
3. Register the reducer in `root-reducer.ts`
4. Access state via `useAppSelector` from `@app/hooks/redux`
5. Dispatch actions via `useAppDispatch` from `@app/hooks/redux`

---

## React Query Pattern

Follow this 4-file pattern for each feature:

### 1. Query Keys (`src/lib/react-query/query-key.ts`)
```typescript
export const FeatureQueryKey = {
  getList: 'getFeatureList',
  getDetail: 'getFeatureDetail',
};
```

### 2. Service (`src/lib/react-query/service/{feature}.ts`)
```typescript
import {Api} from '@lib/ky/base';

export const FeatureService = {
  getList: async () => {
    const res = await Api.get('endpoint').json();
    return res;
  },
  create: async (data: CreatePayload) => {
    const res = await Api.post('endpoint', {json: data}).json();
    return res;
  },
};
```

### 3. Hooks (`src/lib/react-query/hooks/{feature}.ts`)
```typescript
import {useMQ, useRQ} from '@react-query/custom-hooks';
import {FeatureQueryKey} from '@react-query/query-key';
import {FeatureService} from '@react-query/service/{feature}';

export const getFeatureList = () =>
  useRQ(FeatureQueryKey.getList, FeatureService.getList);

export const createFeature = () =>
  useMQ(FeatureQueryKey.create, FeatureService.create);
```

### 4. Export (`src/lib/react-query/query-hooks.ts`)
```typescript
export const FeatureQuery = {
  getList: getFeatureList,
  create: createFeature,
};
```

---

## HTTP Client (Ky)

- Base instance: `Api` from `@lib/ky/base`
- Base URL: `API_HOST` from `@config`
- Timeout: 4 minutes
- Auto-retry: 2 attempts on 408/500
- Auth: Bearer token auto-injected from Redux state via beforeRequest hook
- 401 handling: Auto-alerts "Session expired" via afterResponse hook

```typescript
// Usage
import {Api} from '@lib/ky/base';
const data = await Api.get('users').json<IUser.User[]>();
const result = await Api.post('comments', {json: payload}).json();
```

---

## Theme System (@shopify/restyle)

Use `Box` and `Text` primitives from `@app/themes`. **Never use raw `View`/`Text` from react-native** unless absolutely necessary.

### Box (replaces View)
```tsx
import {Box} from '@app/themes';
<Box padding="m" backgroundColor="white" borderRadius="m" />
```

### Text (replaces RN Text)
```tsx
import {Text} from '@app/themes';
<Text variant="body_medium" color="black" />
```

### Text Variants
Format: `{fontSize}_{fontWeight}` — e.g. `h_1_bold`, `body_regular`, `button_l_semibold`

### Spacing Tokens
`xxs`(4) `xs`(8) `s`(12) `sm`(14) `m`(16) `ml`(20) `l`(24) `xl`(32) `xxl`(48) `xxxl`(64) `huge`(128)

### Color Tokens
- Primary: `primary`, `primary_light`, `primary_dark`
- Secondary: `secondary`, `secondary_light`, `secondary_dark`
- Status: `success`, `danger`, `warning`, `info`
- Neutrals: `white`, `black`, `grey`, `grey_2` through `grey_7`
- Background: `bg_color`

### Border Radius Tokens
`xxs`(4) `xs`(8) `s`(12) `sm`(14) `m`(16) `ml`(20) `l`(24) `xl`(32) `xxl`(48) `round`(100000)

---

## Component Patterns

### Existing Reusable Components

| Component | Import | Key Props |
|-----------|--------|-----------|
| `Button` | `@components/button/Button` | `label`, `onPress`, `secondary`, `disabled`, `loading` |
| `TextInput` | `@components/inputs/text-input` | `label`, `placeholder`, `iconLeftName`, `iconRightName`, `secureTextEntry` |
| `SearchInput` | `@components/inputs/search-input` | `value`, `placeholder`, `onChangeText` |
| `DropdownInput` | `@components/inputs/dropdown-input` | `label`, `items`, `value`, `onChangeValue`, `multy` |
| `DateInput` | `@components/inputs/date-input` | `type`, `label`, `value`, `onDateChange` |
| `Header` | `@components/header` | `title`, `rightComponent` (includes back button) |
| `Container` | `@components/container` | `loading`, `is_empty`, `loading_text`, `backgroundColor` |
| `Avatar` | `@components/avatar` | `text` (shows first letter), `size` |
| `EmptyData` | `@components/empty-data` | Used for empty state displays |
| `Modal` | `@components/modal` | `show`, `animationType`, `onDissmiss` |
| `Divider` | `@components/divider` | `horizontal`/`vertical` spacing |
| `ErrorBoundary` | `@components-atoms/error-boundary` | Wraps app for crash protection |

### Icons
Use Feather icons from `react-native-vector-icons/Feather`:
```tsx
import Feather from 'react-native-vector-icons/Feather';
<Feather name="heart" size={20} color="#000" />
```

---

## Navigation

### Navigation Helpers
```typescript
import {Navigation} from '@router/navigation-helper';

Navigation.navigate('RouteName', {param: value});
Navigation.back();
Navigation.push('RouteName', {param: value});
Navigation.replace('RouteName');
Navigation.reset('RouteName');
Navigation.resetToMain();  // Reset to bottom tabs
```

### Route Definition
All route names go in `src/router/route-name.ts` as a `Route` constant object.  
Type params in `RouteStackNavigation` interface for type-safe navigation.

### Structure
- `MainNavigator` — wraps `NavigationContainer` + deep linking
- `StackNavigator` — root stack (auth check → login or tabs)
- `BottomTabScreen` — bottom tab navigator for authenticated area

---

## Storage

**MMKV is used everywhere** — NOT AsyncStorage.

| Storage | Key | Purpose |
|---------|-----|---------|
| Redux persist | `redux-storage` | Persists all Redux slices |
| React Query cache | `RQ_Cache_storage` | Offline query cache |
| Redux slice persist | Per-slice key via `storeKey` | Individual slice persistence |

Use the custom `persistReducer` wrapper from `@lib/storage/redux-storage` — it auto-configures MMKV.

---

## Screen Pattern

```tsx
// src/screens/{feature}/{screen-name}.tsx
import React from 'react';
import {Box, Text} from '@app/themes';
import {Container} from '@components/container';
import {Header} from '@components/header';
import {useAppSelector} from '@app/hooks/redux';

const FeatureScreen = () => {
  const data = useAppSelector(state => state.Feature.data);

  return (
    <Container>
      <Header title="Screen Title" />
      <Box flex={1} padding="m">
        {/* Screen content using Box/Text primitives */}
      </Box>
    </Container>
  );
};

export default FeatureScreen;
```

---

## Auth Pattern

- Login: Fetch users from MockAPI → match email → validate password client-side
- Session: Stored in Redux `UserReducer` → persisted via MMKV
- Auto-login: `StackNavigator` checks Redux auth state on mount
- Logout: Call `onLogout()` from `@app/helpers/auth` → clears Redux + resets nav
- Token: Injected via Ky `beforeRequest` hook from Redux state

---

## Testing

- Framework: Jest 29 + `@testing-library/react-native` 13
- Config: `jest.config.ts` with babel transform
- Test tsconfig: `jest/tsconfig.test.json`
- Asset transformer: `jest/asset-transformer.js`
- Mock files: `__mocks__/` at project root

### Test File Structure

Tests live alongside source files in `__tests__/` directories or as `.test.tsx` siblings:

```
src/
├── components/
│   ├── button/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx
│   └── __tests__/
│       ├── avatar.test.tsx
│       ├── header.test.tsx
│       └── container.test.tsx
├── lib/
│   └── redux/
│       └── slice/
│           └── user/
│               ├── user.ts
│               └── __tests__/
│                   └── user.test.ts
├── screens/
│   └── auth/
│       ├── login-screen.tsx
│       └── __tests__/
│           └── login-screen.test.tsx
└── helpers/
    ├── auth.tsx
    └── __tests__/
        └── auth.test.ts
```

### Test Naming Convention

| Type | File Pattern | Location |
|------|-------------|----------|
| Component tests | `{ComponentName}.test.tsx` | `__tests__/` sibling folder |
| Screen tests | `{screen-name}.test.tsx` | `__tests__/` sibling folder |
| Redux slice tests | `{feature}.test.ts` | `__tests__/` inside slice folder |
| Hook tests | `{hook-name}.test.ts` | `__tests__/` sibling folder |
| Helper/util tests | `{helper}.test.ts` | `__tests__/` sibling folder |
| Service tests | `{feature}.test.ts` | `__tests__/` sibling folder |

### Test Utility (`src/test-utils.tsx`)

Always use the custom `renderWithProviders` wrapper instead of raw `render`:

```tsx
import {renderWithProviders} from '@app/test-utils';

// Wraps component with Redux Provider, React Query, Theme, Navigation
const {getByText} = renderWithProviders(<MyComponent />);
```

### Running Tests

```bash
yarn test                    # Run all tests
yarn test:watch              # Watch mode
yarn test:coverage           # With coverage report
yarn test -- --testPathPattern="components"  # Filter by path
```

### Test Patterns

**Component test:**
```tsx
import React from 'react';
import {renderWithProviders} from '@app/test-utils';
import Button from '@components/button/Button';

describe('Button', () => {
  it('renders label text', () => {
    const {getByText} = renderWithProviders(
      <Button label="Submit" onPress={jest.fn()} />,
    );
    expect(getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const {getByText} = renderWithProviders(
      <Button label="Submit" onPress={onPress} />,
    );
    fireEvent.press(getByText('Submit'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables press when loading', () => {
    const onPress = jest.fn();
    const {getByText} = renderWithProviders(
      <Button label="Submit" onPress={onPress} loading />,
    );
    fireEvent.press(getByText('Submit'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

**Redux slice test:**
```tsx
import {user_action, UserReducer} from '@redux-store/slice/user/user';

describe('UserReducer', () => {
  it('sets user data', () => {
    const user = {id: '1', name: 'John', email: 'john@test.com'};
    const state = UserReducer(undefined, user_action.setUser(user));
    expect(state.user).toEqual(user);
  });

  it('clears state on logout', () => {
    const state = UserReducer(
      {user: {id: '1'}, auth: {token: 'abc'}},
      user_action.onLogout(),
    );
    expect(state.user).toBeUndefined();
  });
});
```

**Screen test:**
```tsx
import React from 'react';
import {renderWithProviders} from '@app/test-utils';
import LoginScreen from '@screens/auth/login-screen';

describe('LoginScreen', () => {
  it('renders email and password fields', () => {
    const {getByPlaceholderText} = renderWithProviders(<LoginScreen />);
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('shows error when submitting empty form', async () => {
    const {getByText} = renderWithProviders(<LoginScreen />);
    fireEvent.press(getByText('Login'));
    await waitFor(() => {
      expect(getByText(/required/i)).toBeTruthy();
    });
  });
});
```

### What to Test

| Priority | What | Why |
|----------|------|-----|
| High | Redux slices | Pure functions — easy to test, high value |
| High | Helper/utility functions | Business logic isolation |
| Medium | Screen rendering | Ensure screens mount without crashing |
| Medium | Component props/interactions | Button presses, input changes |
| Medium | Form validation | Login, edit profile validation logic |
| Low | Navigation flow | Complex mocking needed |
| Low | API services | Better tested via integration tests |

### Mocking Guidelines

- **Navigation**: Mock `@react-navigation/native` in test setup
- **MMKV**: Mock `react-native-mmkv` — already handled in jest setup
- **Redux**: Use `renderWithProviders` with `preloadedState` for specific state scenarios
- **API (Ky)**: Mock `@lib/ky/base` for service tests
- **Icons**: Mock `react-native-vector-icons/Feather` in jest setup

---

## Dev Tooling

| Tool | Purpose |
|------|---------|
| Reactotron | Redux state + network debugging (`ReactotronConfig.js`) |
| Redux Flipper | Redux devtools in Flipper (DEV only) |
| React Query DevPlugin | Query cache inspector |
| Lefthook | Pre-commit: ESLint fix → Prettier → import-sorter |
| ESLint | `config/eslint.js` — allows `@ts-ignore` and `any` |
| import-sorter | Groups: react → RN → external → aliases → relative |

---

## Environment Config

```typescript
// config/env.ts
export const NAME: 'dev' | 'stg' | 'prd';
export const API_HOST: string;
```

Switch with: `yarn env-dev`, `yarn env-stg`, `yarn env-prd`

---

## Rules for AI Agents

1. **Always use import aliases** — never relative paths crossing more than one directory
2. **Use Box/Text** from `@app/themes` — never raw View/Text from react-native
3. **Follow slice pattern exactly** — store-key → slice → root-reducer registration
4. **Follow react-query pattern** — query-key → service → hook → query-hooks export
5. **Use `Api` from `@lib/ky/base`** for HTTP — never raw fetch or axios
6. **Use `useAppSelector`/`useAppDispatch`** — never raw `useSelector`/`useDispatch`
7. **Use Feather icons** — `react-native-vector-icons/Feather`
8. **Keep `constan/` spelling** — do not rename to `constants`
9. **Use `Container` + `Header`** as screen wrappers
10. **Put screens in feature folders** — `src/screens/{feature}/{screen-name}.tsx`
11. **Persist new slices** with the custom `persistReducer` from `@lib/storage/redux-storage`
12. **Use MMKV** — never use AsyncStorage
13. **Format dates with `moment`** — already installed
14. **Use `KeyboardAwareScrollView`** for forms — already installed
15. **Export screen components as default exports**