# API Documentation

Base URL: `{API_HOST}/api`

---

## Authentication

Most endpoints require a **Bearer token** via `Authorization: Bearer <token>` header.

The backend also supports alternative auth methods:
- **API Key** — `x-api-key` header
- **Type ID** — `x-type-id` + `x-type` headers (social account link)

---

## Data Models

### CourseCreatorDto

| Field    | Type            | Description       |
| -------- | --------------- | ----------------- |
| id       | string          | User ID           |
| email    | string          | Email             |
| fullName | string \| null  | Display name      |
| avatar   | string \| null  | Avatar URL        |

### CourseModuleDto

| Field      | Type   | Description                                     |
| ---------- | ------ | ----------------------------------------------- |
| id         | string | Module ID (UUID)                                |
| courseId   | string | Parent course ID                                |
| title      | string | Module title                                    |
| content    | string | Markdown content (empty string = failed to gen) |
| orderIndex | number | Sort order (0-based)                            |
| createdAt  | string | ISO date                                        |
| updatedAt  | string | ISO date                                        |

### CourseDto

| Field       | Type                                       | Description            |
| ----------- | ------------------------------------------ | ---------------------- |
| id          | string                                     | Course ID (UUID)       |
| userId      | string                                     | Owner user ID          |
| title       | string                                     | Course title           |
| description | string                                     | Course description     |
| category    | string                                     | e.g. "Programming"     |
| duration    | string                                     | e.g. "4 hours"         |
| level       | string                                     | Beginner/Intermediate/Advanced |
| author      | string                                     | Author name            |
| image       | string \| null                             | Cover image URL        |
| rating      | number                                     | 0–5                    |
| prompt      | string                                     | Original AI prompt     |
| isFavorited | boolean                                    | Current user favorited |
| modules     | CourseModuleDto[]                          | Course modules         |
| createdAt   | string                                     | ISO date               |
| updatedAt   | string                                     | ISO date               |
| createdBy   | CourseCreatorDto \| null                   | Creator info           |
| _count      | { comments: number; favorites: number }    | Optional counts        |

### CourseDetailDto (extends CourseDto)

| Field    | Type               | Description    |
| -------- | ------------------ | -------------- |
| comments | CourseCommentDto[]  | All comments   |

### CourseCommentDto

| Field       | Type                    | Description               |
| ----------- | ----------------------- | ------------------------- |
| id          | string                  | Comment ID (UUID)         |
| courseId    | string                  | Parent course ID          |
| userId      | string                  | Author user ID            |
| message     | string                  | Comment text              |
| likesCount  | number                  | Total likes               |
| likedByUser | boolean                 | Current user liked it     |
| createdAt   | string                  | ISO date                  |
| updatedAt   | string                  | ISO date                  |
| user        | CourseCreatorDto \| null | Comment author info       |

### UserProfileDto

| Field    | Type           |
| -------- | -------------- |
| id       | string         |
| email    | string         |
| fullName | string \| null |
| avatar   | string \| null |
| bio      | string \| null |

---

## Auth Endpoints

Base path: `/api/auth`

### 1. Register

```
POST /api/auth/register
```

**Auth:** None

**Request Body:**

```json
{
  "email": "string (valid email)",
  "password": "string (8–100 chars, must contain uppercase, lowercase, and digit)",
  "fullName": "string (2–100 chars, optional)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": UserDto,
    "session": {
      "accessToken": "string",
      "refreshToken": "string",
      "expiresIn": 3600
    }
  }
}
```

---

### 2. Login

```
POST /api/auth/login
```

**Auth:** None

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": UserDto,
    "expiresIn": 3600
  }
}
```

---

### 3. Refresh Token

```
POST /api/auth/refresh
```

**Auth:** None

**Request Body:**

```json
{
  "refreshToken": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": 3600
  }
}
```

---

### 4. Logout

```
POST /api/auth/logout
```

**Auth:** None

**Request Body:**

```json
{
  "accessToken": "string (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "data": { "success": true, "message": "Logged out successfully" }
}
```

---

### 5. Get Current User

```
GET /api/auth/me
```

**Auth:** Bearer token required

**Response:**

```json
{
  "success": true,
  "data": UserDto
}
```

---

### 6. Get User by ID

```
GET /api/auth/user/:userId
```

**Auth:** None

**Params:** `userId` — UUID

**Response:**

```json
{
  "success": true,
  "data": UserDto
}
```

---

### UserDto

| Field     | Type            | Description           |
| --------- | --------------- | --------------------- |
| id        | string          | User ID (UUID)        |
| email     | string          | Email address         |
| fullName  | string \| null  | Display name          |
| avatar    | string \| null  | Avatar URL            |
| bio       | string \| null  | Bio text              |
| apiKey    | string \| null  | API key               |
| createdAt | string          | ISO date              |
| updatedAt | string          | ISO date              |

---

## Course Endpoints

Base path: `/api/course`

All course endpoints require Bearer token authentication.

### 1. Generate Course (SSE)

```
POST /api/course/generate
```

**Request Body:**

```json
{
  "prompt": "string (1–2000 chars)"
}
```

**Response:** `Content-Type: text/event-stream` (Server-Sent Events)

The response streams multiple SSE events. Each event has `event:` and `data:` fields.

#### SSE Event Flow:

**1) Progress — outline started**
```
event: progress
data: {"step":"outline","message":"Generating course outline..."}
```

**2) Progress — outline complete**
```
event: progress
data: {"step":"outline_done","message":"Course \"Title\" created with 5 modules","title":"Course Title","totalModules":5}
```

**3) Progress — module generating (per module)**
```
event: progress
data: {"step":"module","moduleIndex":1,"totalModules":5,"moduleTitle":"Module Title","message":"Generating module 1/5: Module Title"}
```

**4) Progress — module result (per module)**
```
event: progress
data: {"step":"module_done","moduleIndex":1,"totalModules":5,"moduleTitle":"Module Title","moduleId":"uuid","status":"success","message":"Module 1 generated successfully"}
```

Status is `"success"` or `"failed"`.

**5) Complete — final course data**
```
event: complete
data: {"course": CourseDetailDto}
```

**6) Error (if outline fails)**
```
event: error
data: {"message":"Failed to generate course outline"}
```

---

### 2. Get All Courses

```
GET /api/course
```

**Response:**

```json
{
  "success": true,
  "data": CourseDto[]
}
```

---

### 3. Get My Courses

```
GET /api/course/my-courses
```

**Response:**

```json
{
  "success": true,
  "data": CourseDto[]
}
```

---

### 4. Get Course by ID

```
GET /api/course/:id
```

**Params:** `id` — UUID

**Response:**

```json
{
  "success": true,
  "data": CourseDetailDto
}
```

Returns course with all modules and comments. Modules with empty `content` (`""`) indicate failed generation — use the regenerate endpoint.

---

### 5. Delete Course

```
DELETE /api/course/:id
```

**Params:** `id` — UUID (must be course owner)

**Response:**

```json
{
  "success": true,
  "data": { "success": true, "message": "Course deleted successfully" }
}
```

---

### 6. Toggle Favorite

```
POST /api/course/:id/favorite
```

**Params:** `id` — Course UUID

**Response:**

```json
{
  "success": true,
  "data": { "favorited": true }
}
```

`favorited` is `true` if added, `false` if removed.

---

### 7. Get Favorites

```
GET /api/course/favorites
```

**Response:**

```json
{
  "success": true,
  "data": CourseDto[]
}
```

---

### 8. Add Comment

```
POST /api/course/:id/comments
```

**Params:** `id` — Course UUID

**Request Body:**

```json
{
  "message": "string (1–5000 chars)"
}
```

**Response:**

```json
{
  "success": true,
  "data": CourseCommentDto
}
```

---

### 9. Delete Comment

```
DELETE /api/course/comments/:commentId
```

**Params:** `commentId` — UUID (must be comment owner)

**Response:**

```json
{
  "success": true,
  "data": { "success": true, "message": "Comment deleted successfully" }
}
```

---

### 10. Toggle Like on Comment

```
POST /api/course/comments/:commentId/like
```

**Params:** `commentId` — UUID

**Response:**

```json
{
  "success": true,
  "data": { "liked": true }
}
```

---

### 11. Regenerate Module

```
POST /api/course/modules/:moduleId/regenerate
```

**Params:** `moduleId` — UUID (must be course owner)

Use this when a module has empty content (generation failed). Timeout should be ~120s.

**Response:**

```json
{
  "success": true,
  "data": CourseModuleDto
}
```

---

### 12. Update Profile

```
PUT /api/course/profile
```

**Request Body (all optional):**

```json
{
  "fullName": "string (1–100 chars)",
  "avatar": "string (valid URL)",
  "bio": "string (max 500 chars)"
}
```

**Response:**

```json
{
  "success": true,
  "data": UserProfileDto
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

Common error codes:

| Code              | Status | Description                  |
| ----------------- | ------ | ---------------------------- |
| UNAUTHORIZED      | 401    | Missing/invalid token        |
| FORBIDDEN         | 403    | Not the resource owner       |
| INVALID_CREDENTIALS | 401  | Wrong email or password      |
| USER_EXISTS       | 409    | Email already registered     |
| COURSE_NOT_FOUND  | 404    | Course ID doesn't exist      |
| COMMENT_NOT_FOUND | 404    | Comment ID doesn't exist     |
| MODULE_NOT_FOUND  | 404    | Module ID doesn't exist      |
| DATABASE_ERROR    | 500    | Internal database error      |

Validation errors (Zod) return status `400` with field-level details.

---

## Notes for Mobile Implementation

- **Auth Flow:** Call `/api/auth/login` → store `accessToken` and `refreshToken`. When `accessToken` expires, call `/api/auth/refresh` with the `refreshToken` to get a new pair. Send `accessToken` as `Authorization: Bearer <token>` on every authenticated request.
- **Token Storage:** Store tokens securely (Keychain on iOS, EncryptedSharedPreferences on Android).
- **SSE for Generate:** The generate endpoint uses Server-Sent Events. On mobile, use an SSE client or read the response stream manually. The stream sends progress updates you can use to show real-time UI feedback.
- **Failed Modules:** After generation, check each module's `content` field. Empty string = failed. Show a retry button that calls `POST /modules/:moduleId/regenerate`.
- **Auth:** Store the JWT token from the auth module and send it as `Authorization: Bearer <token>` on every request.
- **Favorites:** `isFavorited` on each course is relative to the authenticated user.
- **Timeouts:** The generate and regenerate endpoints can take 30–120 seconds. Set appropriate timeouts.
