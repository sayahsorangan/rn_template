# AGENTS.md — Project Conventions & Instructions

## Project Overview

React Native 0.84.1 + TypeScript 5.8.3 course app template.  
**No Expo** — uses bare React Native with `react-native-community/cli`.

Run commands:

```bash
yarn install
yarn android   # or yarn ios
```

---

## Import Aliases (ALWAYS use these)

| Alias                 | Maps To                    |
| --------------------- | -------------------------- | --- | ------------------------- | ------------------------------ | --- | ------------------------- | ------------------------------ |
| `@router/*`           | `./src/router/*`           |
| `@models/*`           | `./src/model/*`            |
| `@config`             | `./config/env`             |
| `@react-query/*`      | `./src/lib/react-query/*`  |
| `@redux-store/*`      | `./src/lib/redux/*`        |
| `@lib/*`              | `./src/lib/*`              |
| `@i18n`               | `./src/i18n`               |
| `@components-atoms/*` | `./src/components/atoms/*` |     | `@components-molecules/*` | `./src/components/molecules/*` |     | `@components-organisms/*` | `./src/components/organisms/*` |
| `@components/*`       | `./src/components/*`       |
| `@screens/*`          | `./src/screens/*`          |
| `@app/*`              | `./src/*`                  |

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
├── hooks/               # Custom React hooks (redux.ts)
├── i18n/                # i18next setup + locales/ (en.json, id.json)
├── lib/                 # 3rd-party library integrations
│   ├── ky/              # HTTP client (base.ts, hooks.ts, index.ts)
│   ├── llm/             # On-device LLM (index.ts, types.ts, hooks.ts, catalog.ts, downloader.ts)
│   ├── react-query/     # Data fetching layer
│   │   ├── {feature}/   # Feature folder: hooks.ts, keys.ts, service.ts, types.ts
│   │   ├── custom-hooks.ts  # Generic useRQ/useMQ/useInfiniteRQ wrappers
│   │   ├── query-client.ts  # QueryClient config + MMKV persister
│   │   └── query-provider.tsx  # QueryClientProvider wrapper
│   ├── redux/           # State management
│   │   ├── slice/       # Feature slices: {feature}/{feature}.ts + index.ts
│   │   ├── store.ts     # Store configuration
│   │   ├── root-reducer.ts  # Combined reducers
│   │   └── store-key.ts     # Slice key constants
│   ├── storage/         # MMKV storage adapters (redux-storage.ts, query-storage.ts)
│   └── rag/             # Offline RAG pipeline (types, chunker, embedder, vector-store, retriever, hooks, catalog)
├── model/               # TypeScript type definitions
│   └── API/             # API response/request types (namespace-based)
├── router/              # Navigation config
│   ├── main-navigation.tsx   # NavigationContainer entry
│   ├── stack-navigation.tsx  # Root stack (splash → login → tabs)
│   ├── bottom-navigation.tsx # Bottom tab navigator
│   ├── navigation-helper.ts  # Navigation helpers
│   ├── route-name.ts         # Route name constants + type params
│   └── linking.ts            # Deep link config
├── screens/             # Screen components (grouped by feature/)
│   ├── auth/            # login-screen.tsx
│   ├── chat/            # chat-screen.tsx + components/model-picker-sheet.tsx
│   ├── home/            # main-home.tsx
│   ├── splash-screen.tsx
│   └── empty-screen.tsx
├── test-utils.tsx       # renderWithProviders helper
└── themes/              # @shopify/restyle design tokens
    ├── Theme.ts, Box.tsx, Text.tsx, elevation.ts
    └── *.json           # colors, dark-colors, spacing, fonts, border-radius tokens
```

---

## Naming Conventions

| Type                 | Convention                               | Example                             |
| -------------------- | ---------------------------------------- | ----------------------------------- |
| Screen files         | `kebab-case.tsx`                         | `login-screen.tsx`, `main-home.tsx` |
| Component files      | `kebab-case.tsx` or `PascalCase.tsx`     | `Button.tsx`, `empty-data.tsx`      |
| Redux slice files    | `{feature}.ts` inside `slice/{feature}/` | `slice/user/user.ts`                |
| Service files        | `{feature}.ts` inside `service/`         | `service/app.ts`                    |
| Hook files           | `{feature}.ts` inside `hooks/`           | `hooks/app.ts`                      |
| Redux actions export | `{feature}_action`                       | `user_action`, `app_action`         |
| Redux reducer export | `{Feature}Reducer`                       | `UserReducer`, `AppReducer`         |
| Query key export     | `{Feature}QueryKey`                      | `AppQueryKey`                       |
| API model namespace  | `I{Feature}`                             | `IUser`, `IApp`, `ICourse`          |

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
  name: storeKey.Feature, // key from store-key.ts
  initialState,
  reducers: {
    setData: (state, {payload}) => {
      state.data = payload;
    },
    onReset: () => initialState,
  },
});

export const feature_action = slice.actions;
export const FeatureReducer = persistReducer({key: storeKey.Feature}, slice.reducer);
```

**Requirements:**

1. Always add the key to `store-key.ts` first
2. Always use the custom `persistReducer` from `@lib/storage/redux-storage` (NOT from redux-persist directly)
3. Register the reducer in `root-reducer.ts`
4. Access state via `useAppSelector` from `@app/hooks/redux`
5. Dispatch actions via `useAppDispatch` from `@app/hooks/redux`

---

## React Query Pattern

React Query files are organized **per feature** inside `src/lib/react-query/{feature}/` with 4 files each:

### 1. Keys (`src/lib/react-query/{feature}/keys.ts`)

```typescript
export const FeatureQueryKey = {
  signIn: 'signIn',
} as const;
```

### 2. Types (`src/lib/react-query/{feature}/types.ts`)

```typescript
export interface FeatureRequest { ... }
export interface FeatureResponse { ... }
```

### 3. Service (`src/lib/react-query/{feature}/service.ts`)

```typescript
import {Api} from '@lib/ky';
import {MutationFunction} from '@tanstack/react-query';

const doSomething: MutationFunction<FeatureResponse, FeatureRequest> = async data => {
  return await Api.post('endpoint', {json: data}).json<FeatureResponse>();
};

export const FeatureServices = {doSomething};
```

### 4. Hooks (`src/lib/react-query/{feature}/hooks.ts`)

```typescript
import {useMQ, useRQ, UseMQOptions} from '@react-query/custom-hooks';
import {FeatureQueryKey} from './keys';
import {FeatureServices} from './service';
import {FeatureRequest, FeatureResponse} from './types';

function useDoSomething(options?: UseMQOptions<FeatureResponse, FeatureRequest>) {
  return useMQ([FeatureQueryKey.doSomething], FeatureServices.doSomething, options);
}

export const FeatureQueries = {
  useDoSomething,
};
```

**Usage in screens:**

```typescript
import {AuthQueries} from '@react-query/auth/hooks';

const {mutate} = AuthQueries.useSignIn();
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
<Box padding="md" backgroundColor="white" borderRadius="md" />;
```

### Text (replaces RN Text)

```tsx
import {Text} from '@app/themes';
<Text variant="body_regular" color="black" />;
```

### Text Variants

Format: `{fontSize}_{fontWeight}`

Font sizes: `h_1`(32) `h_2`(30) `h_3`(28) `h_4`(24) `h_5`(22) `h_6`(20) `body`(16) `body_leading`(20) `body_helper`(14) `button_s`(16) `button_m`(18) `button_l`(20)

Font weights: `bold` `medium` `regular` `semibold`

Examples: `h_1_bold`, `h_4_medium`, `body_regular`, `body_semibold`, `body_helper_regular`, `body_helper_semibold`, `button_l_semibold`

### Spacing Tokens

`xxs`(4) `xs`(8) `sm`(12) `md`(16) `lg`(24) `xl`(40) `xxl`(64) `huge`(128)

### Color Tokens

- Primary: `primary`, `primary_dark`, `primary_light`
- Secondary: `secondary`, `secondary_dark`, `secondary_light`
- Tertiary: `tertiary`, `tertiary_dark`, `tertiary_light`
- Accent: `accent_1`, `accent_1_dark`, `accent_1_light`, `accent_2`, `accent_2_dark`, `accent_2_light`
- Status: `success`, `success_dark`, `success_light`, `danger`, `danger_dark`, `danger_light`, `warning`, `warning_dark`, `warning_light`, `info`, `info_dark`, `info_light`
- Neutrals: `black`, `white`, `grey`, `grey_dark`, `grey_light`
- Background: `background`

### Border Radius Tokens

`xxs`(4) `xs`(8) `sm`(12) `md`(16) `lg`(24) `xl`(32) `xxl`(40) `round`(100000)

---

## Component Patterns

### Existing Reusable Components

**Always use these components instead of raw RN primitives or custom re-implementations.**

| Component       | Import                              | Key Props                                                                  |
| --------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| `Button`        | `@components/button/Button`         | `label`, `onPress`, `secondary`, `disabled`, `loading`                     |
| `TextInput`     | `@components/inputs/text-input`     | `label`, `placeholder`, `iconLeftName`, `iconRightName`, `secureTextEntry` |
| `SearchInput`   | `@components/inputs/search-input`   | `value`, `placeholder`, `onChangeText`                                     |
| `DropdownInput` | `@components/inputs/dropdown-input` | `label`, `items`, `value`, `onChangeValue`, `multy`                        |
| `DateInput`     | `@components/inputs/date-input`     | `type`, `label`, `value`, `onDateChange`                                   |
| `Header`        | `@components/header`                | `title`, `rightComponent` (includes back button)                           |
| `Container`     | `@components/container`             | `loading`, `is_empty`, `loading_text`, `backgroundColor`                   |
| `Avatar`        | `@components/avatar`                | `text` (shows first letter), `size`                                        |
| `EmptyData`     | `@components/empty-data`            | Used for empty state displays                                              |
| `Modal`         | `@components/modal`                 | `show`, `animationType`, `onDissmiss`                                      |
| `Divider`       | `@components/divider`               | `horizontal`/`vertical` spacing                                            |
| `ErrorBoundary` | `@components-atoms/error-boundary`  | Wraps app for crash protection                                             |
| `FadeInView`    | `@components/animations`            | `delay`, `duration`, `slideFrom` (bottom/left/right/none), `slideDistance` |
| `AppImage`      | `@components/app-image`             | Drop-in `<Image>` with automatic skeleton while loading                    |
| `Skeleton`      | `@components/skeleton`              | `width`, `height`, `borderRadius` — animated shimmer placeholder           |
| `IconButton`    | `@components/button/icon-button`    | `icon_name`, `label`, `onPress`, `loading`, `left_icon`, `center`          |
| `CheckBox`      | `@components/button/check-box`      | `value: boolean`, `onPress(value: boolean)`                                |
| `UnderDev`      | `@components/under-dev`             | Full-screen "Under Development" placeholder                                |

### Component Usage Examples

**Button** — never use `TouchableOpacity` for a primary/secondary action:

```tsx
import {Button} from '@components/button/Button';

<Button label="Submit" onPress={handleSubmit} />
<Button label="Cancel" onPress={handleCancel} secondary />
<Button label="Loading..." onPress={handleSubmit} loading />
```

**TextInput** — never use raw `<TextInput>` from react-native for forms:

```tsx
import {TextInput} from '@components/inputs/text-input';

<TextInput label="Email" placeholder="Enter email" iconLeftName="mail" />
<TextInput label="Password" placeholder="Password" secureTextEntry iconRightName="eye" />
```

**DateInput** — never use a raw date picker directly:

```tsx
import {DateInput} from '@components/inputs/date-input';

<DateInput type="date" label="Birth Date" value={date} onDateChange={setDate} />
<DateInput type="time" label="Start Time" value={time} onDateChange={setTime} />
```

**DropdownInput** — never use a custom picker/select:

```tsx
import {DropdownInput} from '@components/inputs/dropdown-input';

<DropdownInput
  label="Category"
  items={[
    {label: 'A', value: 'a'},
    {label: 'B', value: 'b'},
  ]}
  value={selected}
  onChangeValue={setSelected}
/>;
```

**SearchInput** — never build a custom search bar:

```tsx
import {SearchInput} from '@components/inputs/search-input';

<SearchInput value={query} placeholder="Search..." onChangeText={setQuery} />;
```

**Modal** — never use RN's `<Modal>` directly:

```tsx
import {Modal} from '@components/modal';

<Modal show={isVisible} onDissmiss={() => setVisible(false)} animationType="slide">
  {/* content */}
</Modal>;
```

**IconButton** — never use raw `TouchableOpacity` + icon manually:

```tsx
import {IconButton} from '@components/button/icon-button';

<IconButton icon_name="arrow-left" onPress={Navigation.back} />
<IconButton icon_name="send" label="Send" onPress={handleSend} left_icon />
<IconButton icon_name="refresh-cw" onPress={handleRefresh} loading />
```

**CheckBox** — never use a custom checkbox implementation:

```tsx
import {CheckBox} from '@components/button/check-box';

<CheckBox value={isChecked} onPress={setIsChecked} />;
```

**FadeInView** — never use raw `Animated.View` for enter animations:

```tsx
import {FadeInView} from '@components/animations';

<FadeInView delay={100} duration={400} slideFrom="bottom">
  <YourContent />
</FadeInView>;
```

**AppImage** — never use raw `<Image>` from react-native for remote images:

```tsx
import {AppImage} from '@components/app-image';

<AppImage source={{uri: imageUrl}} style={{width: 200, height: 150, borderRadius: 8}} />;
```

**Skeleton** — never build a custom shimmer placeholder:

```tsx
import {Skeleton} from '@components/skeleton';

<Skeleton width="100%" height={120} borderRadius={8} />;
```

**UnderDev** — for screens not yet implemented:

```tsx
import {UnderDev} from '@components/under-dev';

<UnderDev />;
```

### Icons

Use Feather icons from `react-native-vector-icons/Feather`:

```tsx
import Feather from 'react-native-vector-icons/Feather';
<Feather name="heart" size={20} color="#000" />;
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
Navigation.resetToMain(); // Reset to bottom tabs
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

| Storage             | Key                          | Purpose                      |
| ------------------- | ---------------------------- | ---------------------------- |
| Redux persist       | `redux-storage`              | Persists all Redux slices    |
| React Query cache   | `RQ_Cache_storage`           | Offline query cache          |
| Redux slice persist | Per-slice key via `storeKey` | Individual slice persistence |

Use the custom `persistReducer` wrapper from `@lib/storage/redux-storage` — it auto-configures MMKV.

---

## Screen Pattern

Screens registered with `headerShown: false` (default) must use `<Header>` inside the screen. Screens registered with `headerShown: true` in the stack navigator use the `CustomHeader` from `stack-navigation.tsx` — **do NOT add `<Header>` inside those screens**. Pass `title` in the stack options and use `navigation.setOptions({ headerRight })` inside a `useLayoutEffect` for action buttons.

**With navigator header (`headerShown: true`):**

```tsx
// src/router/stack-navigation.tsx
<Stack.Screen name={Route.myScreen} component={MyScreen} options={{headerShown: true, title: 'My Screen'}} />
```

```tsx
// src/screens/feature/my-screen.tsx
import React, {useLayoutEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {Box} from '@app/themes';
import {Container} from '@components/container';

const MyScreen = () => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <MyActionButton />,
    });
  }, [navigation]);

  return (
    <Container>
      {/* No <Header> here — navigator provides it */}
      <Box flex={1} padding="md">
        {/* content */}
      </Box>
    </Container>
  );
};

export default MyScreen;
```

**With in-screen header (`headerShown: false`, default):**

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
      <Box flex={1} padding="md">
        {/* Screen content using Box/Text primitives */}
      </Box>
    </Container>
  );
};

export default FeatureScreen;
```

---

## Local LLM (Offline Inference)

`llama.rn` runs GGUF models fully on-device via llama.cpp. Files live in `src/lib/llm/`.

| File            | Purpose                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------- |
| `index.ts`      | `LlamaManager` singleton — holds the active LlamaContext                                  |
| `types.ts`      | `ChatMessage`, `LoadModelOptions`, `GenerateOptions` types                                |
| `hooks.ts`      | `useLoadModel()` and `useChat()` React hooks                                              |
| `catalog.ts`    | `MODEL_CATALOG` — curated list of downloadable GGUF models                                |
| `downloader.ts` | `startDownload`, `cancelDownload`, `deleteModel`, `scanLocalModels` via `react-native-fs` |

```typescript
import {useLoadModel, useChat} from '@lib/llm/hooks';

// Load a model
const {loadModel, unloadModel, isModelLoaded, progress} = useLoadModel();
await loadModel({modelPath: '/path/to/model.gguf', nGpuLayers: -1, contextSize: 2048});

// Chat
const {messages, sendMessage, isGenerating} = useChat();
await sendMessage('Hello!');
```

Model state is tracked in the `LlmReducer` Redux slice (`src/lib/redux/slice/llm/llm.ts`).
`LlmReducer` also stores a `language` field (`'auto'` by default). Set it via `setLanguage` from `useChat()` to make the LLM always respond in a specific language (e.g. `'Indonesian'`, `'English'`). When `language === 'auto'` no instruction is injected.
Models are downloaded from HuggingFace via `react-native-fs` and stored in the app's Documents directory.

---

## Offline RAG (Retrieval-Augmented Generation)

Fully on-device RAG pipeline using `llama.rn` for embeddings + MMKV as the vector store. Files live in `src/lib/rag/`.

| File              | Purpose                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `types.ts`        | `RagDocument`, `RagChunkMeta`, `RetrievedChunk`, options interfaces                                       |
| `chunker.ts`      | `chunkText()` — overlap-aware text splitter with sentence-boundary breaks                                 |
| `embedder.ts`     | `downloadAndLoadDefaultEmbedModel()`, `embed()`, `embedBatch()` — auto-download + dedicated embedding ctx |
| `vector-store.ts` | MMKV-backed store for documents, chunk metadata, and embeddings                                           |
| `retriever.ts`    | `retrieve()` cosine similarity search + `buildRagPrompt()` helper                                         |
| `catalog.ts`      | `DEFAULT_EMBED_MODEL` — single fixed GGUF embedding model (nomic, ~92 MB)                                 |
| `hooks.ts`        | `useEnsureEmbedModel()`, `useIngest()`, `useRag()`, `useRagDocuments()`                                   |
| `index.ts`        | Re-exports all public API                                                                                 |

RAG state (`isEmbedModelLoaded`, `embedModelPath`, `documentCount`, `embedDownloadStatus`, `embedDownloadProgress`) is in the `RagReducer` Redux slice.

**Embedding model is fixed** — `nomic-embed-text-v1.5.Q4_K_M.gguf` (~92 MB). Auto-downloaded silently whenever the user downloads **any** chat model via `startDownload()`. If the user somehow uses RAG before downloading a chat model, `useIngest` and `useEnsureEmbedModel` fall back to downloading it inline. The user never selects or manages the embedding model — changing it would invalidate all stored chunks.

### Flow

```
[Document / File]
  → useIngest.ingestText / ingestFile
  → auto-downloads embed model on first call (~92 MB, one-time)
  → chunkText() — split into 512-char overlapping chunks
  → embedBatch() — embed each chunk via llama.rn embedding model
  → saveChunk() — persist meta + embedding to MMKV

[Query]
  → embed() — embed the query string
  → retrieve() — cosine similarity against all stored chunks → top-K
  → buildRagPrompt() — format context + question for the chat model
  → sendMessage(prompt) — answer via chat LLM
```

### Usage

```typescript
import {useEnsureEmbedModel, useIngest, useRag} from '@lib/rag/hooks';

// Optional: pre-warm the embed model (auto-downloads if missing)
const {ensureLoaded, status, downloadProgress} = useEnsureEmbedModel();
await ensureLoaded(); // status: 'downloading' → 'loading' → 'ready'

// Ingest documents — embed model auto-downloads on first ingest if not pre-warmed
const {ingestText, ingestFile, removeDocument, ingesting, ingestProgress} = useIngest();
await ingestText('My Doc', 'Long document text...');
await ingestFile('/path/to/file.txt');

// Query
const {buildPrompt, retrieveChunks, retrieving} = useRag();
const prompt = await buildPrompt('What is the return policy?', {topK: 4});
await sendMessage(prompt); // pass to useChat() from @lib/llm/hooks
```

### Embed Model Download Status

`state.RagReducer.embedDownloadStatus` values:

| Status          | Meaning                             |
| --------------- | ----------------------------------- |
| `'idle'`        | Not started                         |
| `'downloading'` | Downloading model file (~92 MB)     |
| `'loading'`     | llama.rn initialising context       |
| `'ready'`       | Model loaded, ready to embed        |
| `'error'`       | Failed — check `embedDownloadError` |

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

| Type              | File Pattern               | Location                         |
| ----------------- | -------------------------- | -------------------------------- |
| Component tests   | `{ComponentName}.test.tsx` | `__tests__/` sibling folder      |
| Screen tests      | `{screen-name}.test.tsx`   | `__tests__/` sibling folder      |
| Redux slice tests | `{feature}.test.ts`        | `__tests__/` inside slice folder |
| Hook tests        | `{hook-name}.test.ts`      | `__tests__/` sibling folder      |
| Helper/util tests | `{helper}.test.ts`         | `__tests__/` sibling folder      |
| Service tests     | `{feature}.test.ts`        | `__tests__/` sibling folder      |

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
    const {getByText} = renderWithProviders(<Button label="Submit" onPress={jest.fn()} />);
    expect(getByText('Submit')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const {getByText} = renderWithProviders(<Button label="Submit" onPress={onPress} />);
    fireEvent.press(getByText('Submit'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disables press when loading', () => {
    const onPress = jest.fn();
    const {getByText} = renderWithProviders(<Button label="Submit" onPress={onPress} loading />);
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
    const state = UserReducer({user: {id: '1'}, auth: {token: 'abc'}}, user_action.onLogout());
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

| Priority | What                         | Why                                       |
| -------- | ---------------------------- | ----------------------------------------- |
| High     | Redux slices                 | Pure functions — easy to test, high value |
| High     | Helper/utility functions     | Business logic isolation                  |
| Medium   | Screen rendering             | Ensure screens mount without crashing     |
| Medium   | Component props/interactions | Button presses, input changes             |
| Medium   | Form validation              | Login, edit profile validation logic      |
| Low      | Navigation flow              | Complex mocking needed                    |
| Low      | API services                 | Better tested via integration tests       |

### Mocking Guidelines

- **Navigation**: Mock `@react-navigation/native` in test setup
- **MMKV**: Mock `react-native-mmkv` — already handled in jest setup
- **Redux**: Use `renderWithProviders` with `preloadedState` for specific state scenarios
- **API (Ky)**: Mock `@lib/ky/base` for service tests
- **Icons**: Mock `react-native-vector-icons/Feather` in jest setup

---

## Dev Tooling

| Tool                  | Purpose                                                 |
| --------------------- | ------------------------------------------------------- |
| Reactotron            | Redux state + network debugging (`ReactotronConfig.js`) |
| Redux Flipper         | Redux devtools in Flipper (DEV only)                    |
| React Query DevPlugin | Query cache inspector                                   |
| Lefthook              | Pre-commit: ESLint fix → Prettier → import-sorter       |
| ESLint                | `config/eslint.js` — allows `@ts-ignore` and `any`      |
| import-sorter         | Groups: react → RN → external → aliases → relative      |

---

## Environment Config

```typescript
// config/env.ts
export const NAME: 'dev' | 'stg' | 'prd';
export const API_HOST: string;
```

Switch with: `yarn env:dev`, `yarn env:stg`, `yarn env:prd`

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
9. **Use `Container`** as screen wrappers
10. **Put screens in feature folders** — `src/screens/{feature}/{screen-name}.tsx`
11. **Persist new slices** with the custom `persistReducer` from `@lib/storage/redux-storage`
12. **Use MMKV** — never use AsyncStorage
13. **Format dates with `moment`** — already installed
14. **Use `KeyboardAwareScrollView`** for forms — already installed
15. **Export screen components as default exports**
16. **Always use theme tokens for color, spacing, border, font** — avoid `StyleSheet.create`
17. **Run `yarn lint --fix` after every code generation** to auto-fix lint and import ordering issues
18. **Never use `<Header>` inside a screen registered with `headerShown: true`** — the `CustomHeader` in `stack-navigation.tsx` already renders the header. Use `navigation.setOptions({ headerRight })` inside `useLayoutEffect` for action buttons instead.
19. **Always use base components from `@components/*`** — never re-implement or use raw RN primitives for UI that already has a wrapper:
    - Buttons → `Button` from `@components/button/Button`
    - Icon buttons → `IconButton` from `@components/button/icon-button`
    - Checkboxes → `CheckBox` from `@components/button/check-box`
    - Text fields → `TextInput` from `@components/inputs/text-input`
    - Date/time picking → `DateInput` from `@components/inputs/date-input`
    - Dropdowns/selects → `DropdownInput` from `@components/inputs/dropdown-input`
    - Search bars → `SearchInput` from `@components/inputs/search-input`
    - Modals → `Modal` from `@components/modal`
    - Screen chrome → `Container` + `Header` from `@components/container` / `@components/header`
    - Enter animations → `FadeInView` from `@components/animations`
    - Remote images → `AppImage` from `@components/app-image`
    - Loading placeholders → `Skeleton` from `@components/skeleton`
    - Unimplemented screens → `UnderDev` from `@components/under-dev`
