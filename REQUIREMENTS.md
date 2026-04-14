# Course App - Requirements Document

## Overview

Build a mobile course app using React Native + TypeScript with authentication, course browsing, favorites, comments, and profile management.

---

## Existing Infrastructure (Already Available)

| Area | What Exists | Notes |
|------|------------|-------|
| Navigation | `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs` | Stack + tab navigators wired up |
| State Management | Redux Toolkit + redux-persist | Store, root-reducer, UserReducer, AppReducer configured |
| HTTP Client | `ky` with auth interceptors | Base URL from `@config`, retry logic, Bearer token injection |
| Data Fetching | `@tanstack/react-query` with MMKV persistence | `useRQ`, `useMQ`, `useInfiniteRQ` hooks ready |
| Storage | `react-native-mmkv` (encrypted) | Replaces AsyncStorage — already integrated with redux-persist and react-query |
| UI Toolkit | `@shopify/restyle`, `react-native-vector-icons` (Feather) | Theme system, Box/Text primitives, Button, TextInput, SearchInput, Avatar, Header, Modal, EmptyData components |
| i18n | `i18next` + `react-i18next` | Localization infrastructure in place |
| Import Aliases | `@router/*`, `@models/*`, `@config`, `@react-query/*`, `@redux-store/*`, `@lib/*` | Configured in `tsconfig.path.json` |
| Screens | `splash-screen.tsx`, `empty-screen.tsx`, `main-home.tsx` | Skeletal screens |
| Routes | `home` (initial), `tab` (bottom nav) | Minimal — needs expansion |
| Auth Helpers | `onLogout()`, Bearer token hooks | Logout action dispatches and resets navigation |

---

## What Needs to Be Built

### 1. MockAPI Setup

Create resources on [MockAPI](https://mockapi.io):

**`users` resource:**
```json
{
  "id": "1",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "avatar": "https://i.pravatar.cc/150?img=1",
  "bio": "Mobile learner"
}
```

**`courses` resource:**
```json
{
  "id": "1",
  "title": "React Native Masterclass",
  "description": "Short description text",
  "content": "Full course content / long markdown text",
  "category": "Mobile Development",
  "duration": "4h 30m",
  "level": "Intermediate",
  "author": "Jane Smith",
  "image": "https://picsum.photos/seed/course1/400/200",
  "rating": 4.5,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

**`comments` resource (nested under courses or standalone):**
```json
{
  "id": "1",
  "courseId": "1",
  "user": { "id": "1", "name": "John Doe" },
  "message": "Great course!",
  "createdAt": "2025-02-01T12:00:00Z",
  "likesCount": 5,
  "likedByUser": false
}
```

**Action Items:**
- [ ] Create MockAPI project and populate `users`, `courses`, `comments` resources
- [ ] Add the MockAPI base URL to `config/env.ts` (or as a separate constant)
- [ ] Create sample data (at least 5 users, 10+ courses, 15+ comments)

---

### 2. TypeScript Models

**File: `src/model/API/user.ts`** — expand `IUser` namespace:
```ts
export namespace IUser {
  export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    avatar: string;
    bio: string;
  }
}
```

**File: `src/model/API/course.ts`** — create:
```ts
export namespace ICourse {
  export interface Course {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    duration: string;
    level: string;
    author: string;
    image: string;
    rating: number;
    createdAt: string;
  }

  export interface Comment {
    id: string;
    courseId: string;
    user: { id: string; name: string };
    message: string;
    createdAt: string;
    likesCount: number;
    likedByUser: boolean;
  }
}
```

---

### 3. API Service Layer

**File: `src/lib/react-query/service/auth.ts`**
- `AuthService.getUsers()` — GET `/users`
- `AuthService.getUserByEmail(email)` — GET `/users?email={email}`
- `AuthService.updateUser(id, data)` — PUT `/users/{id}`

**File: `src/lib/react-query/service/course.ts`**
- `CourseService.getCourses()` — GET `/courses`
- `CourseService.getCourseById(id)` — GET `/courses/{id}`

**File: `src/lib/react-query/service/comment.ts`**
- `CommentService.getCommentsByCourse(courseId)` — GET `/comments?courseId={courseId}`
- `CommentService.addComment(data)` — POST `/comments`
- `CommentService.updateComment(id, data)` — PUT `/comments/{id}` (for likes)

**File: `src/lib/react-query/query-key.ts`** — add:
```ts
export const AuthQueryKey = { getUsers: 'getUsers' }
export const CourseQueryKey = { getCourses: 'getCourses', getCourseDetail: 'getCourseDetail' }
export const CommentQueryKey = { getComments: 'getComments' }
```

**File: `src/lib/react-query/hooks/auth.ts`** — React Query hooks for auth
**File: `src/lib/react-query/hooks/course.ts`** — React Query hooks for courses
**File: `src/lib/react-query/hooks/comment.ts`** — React Query hooks for comments

---

### 4. Redux State Slices

#### 4a. Expand UserReducer (`src/lib/redux/slice/user/user.ts`)

Current state has `auth` and `user`. Update:
- `user` field should use the full `IUser.User` type
- `auth` should track `isAuthenticated: boolean`
- Actions: `setAuth`, `setUser`, `updateUserProfile`, `onLogout`

#### 4b. Create FavoritesReducer (`src/lib/redux/slice/favorites/favorites.ts`)

```ts
State: {
  savedCourseIds: string[];
}
Actions: toggleFavorite(courseId), removeFavorite(courseId), clearFavorites()
```

- Persisted via MMKV (key: `'Favorites'`)
- Register in `root-reducer.ts`

#### 4c. Create CommentsReducer (`src/lib/redux/slice/comments/comments.ts`)

```ts
State: {
  commentsByCourse: Record<string, ICourse.Comment[]>;
}
Actions: setComments({ courseId, comments }), addComment(comment), toggleLike({ commentId, courseId })
```

- Persisted via MMKV (key: `'Comments'`)
- Register in `root-reducer.ts`

---

### 5. Route Names & Navigation

**File: `src/router/route-name.ts`** — update with all routes:
```ts
export const ROUTES = {
  splash: 'Splash',
  login: 'Login',
  tab: 'Tab',
  home: 'Home',
  courseDetail: 'CourseDetail',
  favorites: 'Favorites',
  profile: 'Profile',
  editProfile: 'EditProfile',
};
```

**Navigation Structure:**
```
Root Stack (StackNavigator)
├── Splash Screen (initial)
├── Login Screen
└── Tab Navigator (authenticated)
    ├── Home Tab → Home Stack
    │                ├── Course List (Home)
    │                └── Course Detail
    ├── Favorites Tab → Favorites Screen
    └── Profile Tab → Profile Stack
                       ├── Profile Screen
                       └── Edit Profile Screen
```

**File: `src/router/stack-navigation.tsx`** — update to include Splash → Login → Tab conditional flow
**File: `src/router/bottom-navigation.tsx`** — 3 tabs: Home, Favorites, Profile

---

### 6. Screens

#### 6a. Splash Screen (`src/screens/splash-screen.tsx`) — UPDATE

- On mount, check MMKV/redux-persist for existing user session
- If user exists → navigate to `Tab` (replace)
- If no user → navigate to `Login` (replace)
- Show app logo or loading indicator

#### 6b. Login Screen (`src/screens/auth/login-screen.tsx`) — CREATE

| Requirement | Detail |
|------------|--------|
| Fields | Email (text input), Password (secure text input) |
| Validation | Both fields required; show inline error messages |
| Submit behavior | Fetch users from MockAPI, match by email, validate password client-side |
| Loading state | Disable button + show spinner during API call |
| Error state | Show "Invalid email or password" on mismatch |
| On success | Save user to Redux (`setUser`), set `isAuthenticated`, persist session, navigate to `Tab` |
| Keyboard | Use `KeyboardAwareScrollView` (already installed) |
| UX | Disable submit while loading; clear errors on input change |

#### 6c. Home Screen (`src/screens/home/main-home.tsx`) — UPDATE

| Requirement | Detail |
|------------|--------|
| Data source | Fetch courses from MockAPI/local JSON via React Query |
| Course card | Image, title, short description, category badge, rating (stars), author, level |
| Search | Search input (use existing `search-input.tsx`) — filter by title |
| Category filter | Horizontal chip/pill list or dropdown — filter by category |
| Empty state | Show `EmptyData` component when no results |
| Save/Bookmark | Each card has a bookmark icon; toggle saves/unsaves via Redux `toggleFavorite` |
| Navigation | Tap card → navigate to `CourseDetail` with `courseId` param |
| Pull to refresh | Supported via `onRefresh` on FlatList |
| Layout | FlatList, mobile-friendly cards |

#### 6d. Course Detail Screen (`src/screens/course/course-detail-screen.tsx`) — CREATE

| Requirement | Detail |
|------------|--------|
| Display | Course image (header), title, author, category, duration, level, rating, full description/content |
| Save action | Bookmark/heart icon in header — toggle via Redux `toggleFavorite` |
| Saved state | Visually indicate if course is saved (filled vs outline icon) |
| Back navigation | Header back button |
| Comments section | Rendered below course content (see 6e) |
| Scroll | `ScrollView` or `FlatList` wrapping everything |

#### 6e. Comments Section (`src/components/organisms/comments-section.tsx`) — CREATE

| Requirement | Detail |
|------------|--------|
| Display | List of comments for the current course |
| Each comment | User name, message, created date (formatted via `moment`), likes count, like button |
| Like/Unlike | Toggle `likedByUser`, update `likesCount` ±1 — dispatch `toggleLike` in Redux; optimistic UI update |
| Add comment | Text input + submit button at bottom; new comment uses logged-in user info |
| New comment appears | Immediately in the list (prepend or append) |
| State management | Comments stored in Redux `CommentsReducer` — shared across screens |

#### 6f. Favorites Screen (`src/screens/favorites/favorites-screen.tsx`) — CREATE

| Requirement | Detail |
|------------|--------|
| Data | Read `savedCourseIds` from Redux, cross-reference with courses data |
| Display | Same course card style as Home Screen |
| Navigation | Tap → Course Detail |
| Remove | Bookmark icon to unsave; course disappears from list |
| Empty state | Show `EmptyData` component: "No saved courses yet" |

#### 6g. Profile Screen (`src/screens/profile/profile-screen.tsx`) — CREATE

| Requirement | Detail |
|------------|--------|
| Display | Avatar (large, centered), Name, Email, Bio |
| Data source | Current user from Redux `UserReducer` |
| Actions | "Edit Profile" button → navigate to `EditProfile`; "Logout" button → call `onLogout()` |
| Logout | Clear user session, clear persisted state, reset navigation to Login |

#### 6h. Edit Profile Screen (`src/screens/profile/edit-profile-screen.tsx`) — CREATE

| Requirement | Detail |
|------------|--------|
| Editable fields | Name, Avatar URL, Bio (minimum) |
| Pre-fill | Form pre-filled with current user data from Redux |
| Save | Update Redux state (`updateUserProfile`), persist locally via redux-persist |
| Bonus | Optionally PUT to MockAPI `/users/{id}` to sync remotely |
| Navigation | On save → go back to Profile; updated data visible immediately |
| Validation | Name required; show error if empty |
| Keyboard | `KeyboardAwareScrollView` for proper keyboard handling |

---

### 7. State Management Summary

| State | Location | Persistence |
|-------|---------|-------------|
| Auth / User | Redux `UserReducer` | MMKV via redux-persist |
| Favorites | Redux `FavoritesReducer` | MMKV via redux-persist |
| Comments & Likes | Redux `CommentsReducer` | MMKV via redux-persist |
| Course list cache | React Query | MMKV via query-sync-storage-persister |
| App info | Redux `AppReducer` | MMKV via redux-persist |

---

### 8. Component Inventory

| Component | Status | Notes |
|-----------|--------|-------|
| `Button` | EXISTS | Has loading, disabled, secondary variants |
| `TextInput` | EXISTS | Standard text input |
| `SearchInput` | EXISTS | For search functionality |
| `Avatar` | EXISTS | User avatar display |
| `Header` | EXISTS | Screen header with back nav |
| `EmptyData` | EXISTS | Empty state display |
| `Container` | EXISTS | Screen wrapper |
| `Modal` | EXISTS | Modal dialog |
| `Divider` | EXISTS | Horizontal divider |
| `CourseCard` | CREATE | Card for course list (image, title, desc, category, rating, bookmark) |
| `CommentItem` | CREATE | Single comment row (user, message, date, likes, like button) |
| `CommentInput` | CREATE | Text input + send button for adding comments |
| `CategoryFilter` | CREATE | Horizontal scrollable chip/pill list |
| `RatingStars` | CREATE | Star display for rating (read-only) |
| `BookmarkButton` | CREATE | Toggle bookmark icon (filled/outline) |

---

### 9. UX Requirements

- [ ] Loading states on all API calls (spinners, skeleton, or shimmer)
- [ ] Error states with retry option on API failures
- [ ] Empty states for no courses, no comments, no favorites
- [ ] Keyboard handling via `KeyboardAwareScrollView` on forms
- [ ] Touch-friendly tap targets (minimum 44pt)
- [ ] Visual feedback on save/unsave (icon fill change, optional haptic)
- [ ] Visual feedback on like/unlike (icon color change, count update)
- [ ] Pull to refresh on course list
- [ ] Consistent spacing using Restyle theme `spacing.json`
- [ ] Disabled submit buttons during loading
- [ ] Clear and concise error messages

---

### 10. File Structure (New Files to Create)

```
src/
├── model/
│   └── API/
│       └── course.ts                    ← Course & Comment types
├── lib/
│   ├── react-query/
│   │   ├── query-key.ts                 ← UPDATE: add auth, course, comment keys
│   │   ├── service/
│   │   │   ├── auth.ts                  ← Auth API service
│   │   │   ├── course.ts               ← Course API service
│   │   │   └── comment.ts              ← Comment API service
│   │   └── hooks/
│   │       ├── auth.ts                  ← Auth React Query hooks
│   │       ├── course.ts               ← Course React Query hooks
│   │       └── comment.ts              ← Comment React Query hooks
│   └── redux/
│       ├── root-reducer.ts              ← UPDATE: register new slices
│       └── slice/
│           ├── user/user.ts             ← UPDATE: expand types & actions
│           ├── favorites/favorites.ts   ← CREATE
│           └── comments/comments.ts     ← CREATE
├── components/
│   ├── course-card.tsx                  ← CREATE
│   ├── comment-item.tsx                 ← CREATE
│   ├── comment-input.tsx               ← CREATE
│   ├── category-filter.tsx             ← CREATE
│   ├── rating-stars.tsx                ← CREATE
│   └── bookmark-button.tsx             ← CREATE
├── screens/
│   ├── auth/
│   │   └── login-screen.tsx            ← CREATE
│   ├── home/
│   │   └── main-home.tsx               ← UPDATE
│   ├── course/
│   │   └── course-detail-screen.tsx    ← CREATE
│   ├── favorites/
│   │   └── favorites-screen.tsx        ← CREATE
│   └── profile/
│       ├── profile-screen.tsx          ← CREATE
│       └── edit-profile-screen.tsx     ← CREATE
└── router/
    ├── route-name.ts                    ← UPDATE
    ├── stack-navigation.tsx             ← UPDATE
    └── bottom-navigation.tsx            ← UPDATE
```

---

### 11. Acceptance Criteria Checklist

#### Authentication
- [ ] Login form with email + password
- [ ] Validation for empty fields
- [ ] Loading state during login
- [ ] Error message for invalid credentials
- [ ] Session persisted in MMKV via redux-persist
- [ ] Auto-login on app reopen (splash screen checks session)
- [ ] Logout clears session and navigates to Login

#### Course Browsing
- [ ] Course list fetched from MockAPI
- [ ] Course cards show image, title, description, category, rating, author/level
- [ ] Search by title
- [ ] Category filter
- [ ] Empty state when no results
- [ ] Pull to refresh
- [ ] Tap to open detail

#### Course Detail
- [ ] Full course info displayed
- [ ] Save/unsave action with visual feedback
- [ ] Back navigation
- [ ] Comments section below content

#### Comments
- [ ] Comments listed per course
- [ ] Each shows user name, message, date, likes count, like button
- [ ] Add comment as logged-in user
- [ ] New comments appear immediately
- [ ] Like/unlike updates immediately
- [ ] State managed in Redux (shared, not local)

#### Favorites
- [ ] Dedicated screen showing saved courses
- [ ] Tap to open detail
- [ ] Remove from favorites
- [ ] Empty state when no favorites
- [ ] State synced across Home, Detail, and Favorites screens

#### Profile
- [ ] Display avatar, name, email, bio
- [ ] Edit Profile button → Edit screen
- [ ] Logout button

#### Edit Profile
- [ ] Pre-filled form with current data
- [ ] Edit name, avatar, bio
- [ ] Save updates Redux + persists locally
- [ ] Return to Profile with updated data visible

#### State Management
- [ ] Auth state centralized in Redux
- [ ] Favorites centralized in Redux
- [ ] Comments/likes centralized in Redux
- [ ] Predictable, maintainable state flow

#### Navigation
- [ ] Splash → Login / Tab (conditional)
- [ ] Tab: Home, Favorites, Profile
- [ ] Home → Course Detail (stack push)
- [ ] Profile → Edit Profile (stack push)

#### UX
- [ ] Loading states everywhere
- [ ] Error states with retry
- [ ] Empty states
- [ ] Keyboard handling on forms
- [ ] Touch-friendly controls
- [ ] Visual feedback for save/like actions
- [ ] Consistent spacing and typography

---

### 12. Bonus Features (Optional)

- [ ] Clean API abstraction layer (already partially done with Ky + React Query)
- [ ] Reusable hooks
- [ ] Form validation (consider adding `yup` or `zod`)
- [ ] Optimistic UI updates on like/unlike
- [ ] Pull to refresh
- [ ] Dark mode (Restyle theme supports this)
- [ ] Animations (react-native-reanimated)
- [ ] Tests (Jest + React Native Testing Library - already configured)
- [ ] Edit/delete own comments
- [ ] Persist favorites remotely to MockAPI
- [ ] Loading skeletons
- [ ] Infinite scroll on course list

---

### 13. Environment Config

**File: `config/env.ts`** — add MockAPI base URL:
```ts
export const MOCK_API_BASE_URL = 'https://YOUR_PROJECT_ID.mockapi.io/api/v1';
```

---

### 14. README Updates

The final `README.md` must include:
- Setup instructions (`npm install && npx react-native run-android` or `run-ios`)
- MockAPI endpoint URL
- Libraries used with rationale
- State management approach explanation
- Assumptions made
- Improvements with more time
