# E-Learning Japanese Course REST API Documentation

**Version:** 1.0.0  
**Base URL:** `https://your-domain.com/api`  
**Last Updated:** January 6, 2026

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Standard Headers](#standard-headers)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Versioning](#versioning)
7. [Pagination](#pagination)
8. [API Resources](#api-resources)
   - [Authentication](#authentication-endpoints)
   - [Admin Dashboard](#admin-dashboard)
   - [Students](#students)
   - [Exams](#exams)
   - [Questions](#questions)
   - [Materials](#materials)
   - [Meetings](#meetings)
   - [Attendance](#attendance)
   - [Student Portal](#student-portal)
   - [Public Resources](#public-resources)

---

## API Overview

This REST API powers the E-Learning Japanese Course platform, providing endpoints for:

- **Admin Management**: Dashboard statistics, student management, exam configuration, question banks, learning materials, and attendance tracking
- **Student Portal**: Exam login, question retrieval, exam submission, and result review
- **Attendance System**: Meeting management, QR-based attendance submission with triple-layer security validation
- **Public Access**: Published learning materials

### Supported Categories

| Category | Code | Description |
|----------|------|-------------|
| `Gengo` | Language | Japanese language learning track |
| `Bunka` | Culture | Japanese culture learning track |

---

## Authentication

### Authentication Method

The API uses **Database-Backed Token Authentication** with HTTP-Only cookies for admin endpoints. Unlike stateless JWT, tokens are stored in the database allowing for immediate revocation and session management.

| Property | Value |
|----------|-------|
| Token Type | Secure Random Token (128 hex characters) |
| Cookie Name | `auth_token` |
| Token Expiry | 7 days |
| Storage | HTTP-Only Cookie + Database |
| Token Length | 64 bytes (128 hex chars) |

### Key Features

| Feature | Description |
|---------|-------------|
| **Immediate Revocation** | Tokens can be invalidated instantly from the database |
| **Session Management** | View and manage all active sessions |
| **Multi-Device Logout** | Logout from all devices at once |
| **Audit Trail** | Track token usage (last used, IP, user agent) |
| **Automatic Cleanup** | Expired/revoked tokens are periodically cleaned |

### Authentication Flow

1. Client sends credentials to `POST /api/auth/login`
2. Server validates credentials and creates a secure token in the database
3. Token is returned in an HTTP-only cookie
4. Subsequent requests automatically include the cookie
5. Protected routes validate the token against the database
6. On logout, the token is revoked in the database

### Token Validation

Each request to a protected route:
1. Extracts the token from the `auth_token` cookie
2. Looks up the token in the database
3. Checks if the token is revoked or expired
4. Updates the `last_used_at` timestamp
5. Returns the associated user if valid

### Database Token Schema

```sql
CREATE TABLE auth_tokens (
  id           UUID PRIMARY KEY,
  token        VARCHAR(255) UNIQUE NOT NULL,
  user_id      UUID NOT NULL REFERENCES admin_users(id),
  expires_at   TIMESTAMP NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  user_agent   VARCHAR(500),
  ip_address   VARCHAR(45),
  is_revoked   BOOLEAN DEFAULT FALSE
);
```

### Protected Routes

| Route Pattern | Protection Level |
|---------------|------------------|
| `/api/admin/*` | Requires valid `auth_token` cookie |
| `/dashboard/*` | Requires valid `auth_token` cookie |
| `/api/auth/*` | Public (login/logout endpoints) |
| `/api/attendance/*` | Public with device fingerprinting |
| `/api/student/*` | Public with validation |
| `/api/public/*` | Public |

---

## Standard Headers

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes (for POST/PUT/PATCH) | `application/json` |
| `Accept` | Recommended | `application/json` |
| `Cookie` | Auto (for protected routes) | Contains `auth_token` |

### Response Headers

| Header | Description |
|--------|-------------|
| `Content-Type` | `application/json` |
| `Set-Cookie` | Auth token (on login/logout) |
| `X-RateLimit-Limit` | Maximum requests allowed |
| `X-RateLimit-Remaining` | Remaining requests in window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

---

## Error Handling

### Standard Error Response Structure

All error responses follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "type": "ERROR_TYPE_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| `200` | OK | Successful GET, PUT, PATCH, DELETE |
| `201` | Created | Successful POST creating a resource |
| `400` | Bad Request | Invalid request body, missing fields, validation errors |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Valid auth but insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate resource, constraint violation |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |
| `503` | Service Unavailable | Database connection issues |

### Common Error Types

| Error Type | Description |
|------------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `INVALID_DEVICE_ID` | Invalid fingerprint format |
| `MEETING_INACTIVE` | Meeting is not active |
| `MEETING_ENDED` | Meeting has ended |
| `MEETING_NOT_STARTED` | Meeting has not started yet |
| `USER_DUPLICATE` | User already exists/submitted |
| `DEVICE_DUPLICATE` | Device already used |
| `FINGERPRINT_DUPLICATE` | Fingerprint already recorded |
| `COOKIE_DUPLICATE` | Cookie-based duplicate detected |
| `RATE_LIMIT` | Too many requests |

---

## Rate Limiting

### Default Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Attendance Submit | 5 requests | 1 minute per device+meeting |
| General API | 100 requests | 1 minute per IP |

### Rate Limit Response

**HTTP 429 Too Many Requests**

```json
{
  "success": false,
  "error": "Terlalu banyak permintaan. Silakan coba lagi nanti.",
  "type": "RATE_LIMIT"
}
```

### Rate Limit Headers

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704556800
```

---

## Versioning

### Current Strategy

The API currently uses **URL path versioning** implicitly at v1. Future versions will be accessible via:

```
/api/v1/...  (current, default)
/api/v2/...  (future)
```

### Deprecation Policy

- Deprecated endpoints will include `X-API-Deprecated: true` header
- Minimum 6-month notice before removal
- Migration guides provided in changelog

---

## Pagination

### Request Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-indexed) |
| `limit` | integer | `10` | Items per page (max: 100) |

### Response Structure

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

### Filtering and Sorting

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Text search across relevant fields |
| `category` | enum | Filter by `Gengo` or `Bunka` |
| `status` | string | Resource-specific status filter |
| `sortBy` | string | Field to sort by |
| `order` | enum | `asc` or `desc` |

---

## API Resources

---

## Authentication Endpoints

### POST /api/auth/login

Authenticate admin user and establish session with database-backed token.

**Request Body**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | Yes | 1-50 characters |
| `password` | string | Yes | 1-100 characters |

**Request Headers Captured**

| Header | Usage |
|--------|-------|
| `User-Agent` | Stored with token for session identification |
| `X-Forwarded-For` | Client IP stored for audit trail |
| `X-Real-IP` | Fallback for client IP |

**Example Request**

```json
{
  "email": "admin@example.com",
  "password": "securepassword123"
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com"
  }
}
```

**Response Cookie**

```
Set-Cookie: auth_token=<secure_random_token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

**Token Storage**

On successful login, the following is stored in the database:
- Secure random token (128 hex characters)
- User ID reference
- Expiration date (7 days from creation)
- User agent string
- Client IP address
- Creation timestamp

**Error Responses**

| Status | Error |
|--------|-------|
| `400` | `{ "success": false, "message": "Validation error" }` |
| `401` | `{ "success": false, "message": "Invalid email or password" }` |
| `500` | `{ "success": false, "message": "Login failed" }` |

---

### POST /api/auth/logout

End the current admin session and revoke the token in the database.

**Request Body**: None

**Behavior**

1. Retrieves the token from the `auth_token` cookie
2. Marks the token as revoked in the database (`is_revoked = true`)
3. Clears the auth cookie from the response

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Response Cookie**

```
Set-Cookie: auth_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0
```

**Note**: Unlike JWT-based auth, the token is immediately invalidated in the database, preventing any further use even if the cookie persists.

---

### GET /api/auth/me

Get the currently authenticated user by validating the database token.

**Request Headers**

Cookie with valid `auth_token` required.

**Validation Process**

1. Token extracted from cookie
2. Token looked up in database
3. Checks: not revoked, not expired
4. Updates `last_used_at` timestamp
5. Returns associated user

**Success Response (200 OK)**

```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com"
  }
}
```

**Error Responses**

| Status | Error |
|--------|-------|
| `401` | `{ "success": false, "message": "Not authenticated" }` |

---

## Admin Dashboard

### GET /api/admin/dashboard/stats

Retrieve aggregated dashboard statistics.

**Authentication**: Required

**Success Response (200 OK)**

```json
{
  "success": true,
  "stats": {
    "totalStudents": 150,
    "totalExams": 12,
    "totalQuestions": 500,
    "totalMaterials": 45
  },
  "topStudents": [
    {
      "id": "student-uuid",
      "name": "Tanaka Yuki",
      "class": "N3-A",
      "averageScore": 92.5
    }
  ],
  "recentActivity": [
    {
      "type": "exam_created",
      "description": "New exam created: JLPT N3 Practice",
      "timestamp": "2026-01-06T10:30:00Z"
    }
  ]
}
```

**Business Logic**

- Returns top 5 students by average score
- Returns last 8 recent activities (exams, students, questions created)

---

## Students

### GET /api/admin/students

List all students with filtering and pagination.

**Authentication**: Required

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | enum | - | `Gengo` or `Bunka` |
| `search` | string | - | Search by name, class, or exam code |
| `status` | enum | `all` | `submitted`, `in-progress`, `all` |
| `page` | integer | `1` | Page number |
| `limit` | integer | `50` | Items per page |

**Example Request**

```
GET /api/admin/students?category=Gengo&status=submitted&page=1&limit=20
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Sato Kenji",
        "class": "N3-B",
        "exam_code": "GNG-2026-001",
        "category": "Gengo",
        "started_at": "2026-01-06T09:00:00Z",
        "is_submitted": true,
        "violations": 0,
        "scores": [
          {
            "score": 85,
            "total_questions": 100,
            "percentage": 85.00,
            "exam": {
              "name": "JLPT N3 Practice",
              "exam_code": "GNG-2026-001"
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### GET /api/admin/students/{id}

Get detailed information about a specific student.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Student ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Sato Kenji",
    "class": "N3-B",
    "exam_code": "GNG-2026-001",
    "category": "Gengo",
    "started_at": "2026-01-06T09:00:00Z",
    "is_submitted": true,
    "violations": 0,
    "scores": [...],
    "answers": [
      {
        "id": "answer-uuid",
        "answer": "A",
        "is_correct": true,
        "question": {
          "id": "question-uuid",
          "question_text": "What is the reading of 日本?",
          "correct_option": "A"
        }
      }
    ]
  }
}
```

**Error Responses**

| Status | Error |
|--------|-------|
| `404` | `{ "success": false, "error": "Student not found" }` |

---

### DELETE /api/admin/students/{id}

Delete a student and all related data.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Student ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

**Business Logic**

- Cascade deletes related answers and scores
- This operation is **idempotent** - deleting a non-existent student returns 404

**Error Responses**

| Status | Error |
|--------|-------|
| `404` | `{ "success": false, "error": "Student not found" }` |

---

## Exams

### GET /api/admin/exams

List all exams with filtering and pagination.

**Authentication**: Required

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | enum | - | `Gengo` or `Bunka` |
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Items per page |

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "JLPT N3 Practice Test",
        "exam_code": "GNG-2026-001",
        "category": "Gengo",
        "duration": 60,
        "start_time": "2026-01-06T09:00:00Z",
        "end_time": "2026-01-06T11:00:00Z",
        "is_active": true,
        "created_at": "2026-01-01T00:00:00Z",
        "_count": {
          "scores": 45,
          "exam_questions": 100
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "totalPages": 2
    }
  }
}
```

---

### POST /api/admin/exams

Create a new exam.

**Authentication**: Required

**Request Body**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Exam display name |
| `category` | enum | Yes | `Gengo` or `Bunka` |
| `duration` | integer | Yes | 1-180 minutes |
| `start_time` | datetime | No | ISO 8601 format |
| `end_time` | datetime | No | Must be after start_time |
| `exam_code` | string | No | Format: `GNG-YYYY-XXX` or `BNK-YYYY-XXX` |
| `is_active` | boolean | No | Default: `false` |

**Example Request**

```json
{
  "name": "JLPT N3 Mock Exam",
  "category": "Gengo",
  "duration": 90,
  "start_time": "2026-02-01T09:00:00Z",
  "end_time": "2026-02-01T12:00:00Z"
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Exam created successfully",
  "data": {
    "id": "new-exam-uuid",
    "name": "JLPT N3 Mock Exam",
    "exam_code": "GNG-2026-002",
    "category": "Gengo",
    "duration": 90,
    "start_time": "2026-02-01T09:00:00Z",
    "end_time": "2026-02-01T12:00:00Z",
    "is_active": false,
    "created_at": "2026-01-06T10:00:00Z"
  }
}
```

**Validation Rules**

- Category must be `Gengo` or `Bunka`
- Duration must be between 1 and 180 minutes
- End time must be after start time
- Exam code auto-generated if not provided
- Exam code format: `{GNG|BNK}-{YEAR}-{SEQUENCE}`

**Error Responses**

| Status | Error |
|--------|-------|
| `400` | `{ "success": false, "error": "Invalid category" }` |
| `400` | `{ "success": false, "error": "Duration must be between 1 and 180 minutes" }` |
| `400` | `{ "success": false, "error": "End time must be after start time" }` |
| `400` | `{ "success": false, "error": "Exam code already exists" }` |

---

### GET /api/admin/exams/{id}

Get detailed information about a specific exam.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Exam ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "JLPT N3 Practice Test",
    "exam_code": "GNG-2026-001",
    "category": "Gengo",
    "duration": 60,
    "start_time": "2026-01-06T09:00:00Z",
    "end_time": "2026-01-06T11:00:00Z",
    "is_active": true,
    "exam_questions": [
      {
        "question": {
          "id": "question-uuid",
          "question_text": "..."
        }
      }
    ]
  }
}
```

---

### PUT /api/admin/exams/{id}

Update an existing exam.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Exam ID |

**Request Body**

Same as POST, all fields optional.

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Exam updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Exam Name",
    ...
  }
}
```

**Idempotency**

This operation is idempotent. Sending the same update multiple times produces the same result.

---

### DELETE /api/admin/exams/{id}

Delete an exam and all related data.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Exam ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Exam deleted successfully"
}
```

**Business Logic**

- Cascade deletes related scores

---

### PATCH /api/admin/exams/{id}/toggle-active

Toggle the active status of an exam.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Exam ID |

**Request Body**: None

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Exam status updated",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "is_active": true
  }
}
```

---

## Questions

### GET /api/admin/questions

List all questions with filtering and pagination.

**Authentication**: Required

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `exam_id` | string | - | Filter by exam ID |
| `category` | enum | - | `Gengo` or `Bunka` |
| `search` | string | - | Search in question text and options |
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Items per page |

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "question_text": "What is the reading of 日本?",
        "option_a": "にほん",
        "option_b": "にっぽん",
        "option_c": "ひのもと",
        "option_d": "やまと",
        "correct_option": "A",
        "explanation": "日本 is commonly read as にほん",
        "created_at": "2026-01-01T00:00:00Z",
        "exam_ids": ["exam-uuid-1", "exam-uuid-2"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 500,
      "totalPages": 50
    }
  }
}
```

---

### POST /api/admin/questions

Create a new question.

**Authentication**: Required

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question_text` | string | Yes | The question content |
| `option_a` | string | Yes | Option A text |
| `option_b` | string | Yes | Option B text |
| `option_c` | string | Yes | Option C text |
| `option_d` | string | Yes | Option D text |
| `correct_option` | enum | Yes | `A`, `B`, `C`, or `D` |
| `explanation` | string | No | Explanation for the answer |
| `exam_ids` | array | No | Array of exam UUIDs to link |

**Example Request**

```json
{
  "question_text": "What is the meaning of 食べる?",
  "option_a": "To eat",
  "option_b": "To drink",
  "option_c": "To sleep",
  "option_d": "To walk",
  "correct_option": "A",
  "explanation": "食べる (taberu) means 'to eat' in Japanese.",
  "exam_ids": ["exam-uuid-1"]
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Question created successfully",
  "data": {
    "id": "new-question-uuid",
    "question_text": "What is the meaning of 食べる?",
    ...
  }
}
```

---

### GET /api/admin/questions/{id}

Get a specific question.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Question ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "question_text": "What is the meaning of 食べる?",
    "option_a": "To eat",
    "option_b": "To drink",
    "option_c": "To sleep",
    "option_d": "To walk",
    "correct_option": "A",
    "explanation": "食べる (taberu) means 'to eat'",
    "exam_questions": [
      {
        "exam": {
          "id": "exam-uuid",
          "name": "JLPT N5 Practice"
        }
      }
    ]
  }
}
```

---

### PUT /api/admin/questions/{id}

Update a question.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Question ID |

**Request Body**

Same as POST. Uses transaction: updates question, deletes old exam relationships, creates new ones.

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Question updated successfully",
  "data": {...}
}
```

---

### DELETE /api/admin/questions/{id}

Delete a question.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Question ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

---

## Materials

### GET /api/admin/materials

List all learning materials.

**Authentication**: Required

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | enum | - | `Gengo` or `Bunka` |
| `search` | string | - | Search in title, description, content |
| `status` | enum | `all` | `published`, `draft`, `all` |
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Items per page |

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "materials": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Introduction to Hiragana",
        "content": "# Hiragana Basics\n\n...",
        "description": "Learn the basics of Hiragana writing system",
        "category": "Gengo",
        "is_published": true,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-05T00:00:00Z",
        "author": {
          "id": "admin-uuid",
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {...}
  }
}
```

---

### POST /api/admin/materials

Create a new learning material.

**Authentication**: Required

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Material title |
| `content` | string | Yes | Material content (Markdown supported) |
| `category` | enum | Yes | `Gengo` or `Bunka` |
| `description` | string | No | Brief description |
| `author_id` | string | Yes | Admin user UUID |
| `is_published` | boolean | No | Default: `false` |

**Example Request**

```json
{
  "title": "Kanji for Beginners",
  "content": "# Basic Kanji\n\nLearn the first 50 kanji...",
  "description": "A guide to basic kanji characters",
  "category": "Gengo",
  "author_id": "admin-uuid",
  "is_published": false
}
```

**Success Response (201 Created)**

```json
{
  "success": true,
  "message": "Material created successfully",
  "data": {...}
}
```

---

### GET /api/admin/materials/{id}

Get a specific material.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Material ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Introduction to Hiragana",
    "content": "...",
    "category": "Gengo",
    "description": "...",
    "is_published": true,
    "author": {
      "id": "admin-uuid",
      "email": "admin@example.com"
    }
  }
}
```

---

### PUT /api/admin/materials/{id}

Update a material.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Material ID |

**Request Body**

All fields optional. Only provided fields are updated.

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Material updated successfully",
  "data": {...}
}
```

---

### DELETE /api/admin/materials/{id}

Delete a material.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Material ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Material deleted successfully"
}
```

---

## Meetings

### GET /api/admin/meeting

List all meetings (attendance sessions).

**Authentication**: Required

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "meetings": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Japanese Class - Week 1",
        "starts_at": "2026-01-06T09:00:00Z",
        "ends_at": "2026-01-06T11:00:00Z",
        "is_active": true,
        "created_at": "2026-01-05T00:00:00Z",
        "_count": {
          "attendances": 25
        }
      }
    ]
  }
}
```

---

### POST /api/admin/meeting

Create a new meeting for attendance tracking.

**Authentication**: Required

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | No | Meeting title (default: "Pertemuan baru") |
| `starts_at` | datetime | No | Meeting start time |
| `ends_at` | datetime | No | Meeting end time |

**Example Request**

```json
{
  "title": "Japanese Class - Week 2",
  "starts_at": "2026-01-13T09:00:00Z",
  "ends_at": "2026-01-13T11:00:00Z"
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Meeting created successfully",
  "data": {
    "id": "new-meeting-uuid",
    "title": "Japanese Class - Week 2",
    "starts_at": "2026-01-13T09:00:00Z",
    "ends_at": "2026-01-13T11:00:00Z",
    "is_active": true,
    "qr_url": "https://your-domain.com/attendance/new-meeting-uuid"
  }
}
```

---

### PATCH /api/admin/meeting/{id}/toggle

Toggle meeting active status.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Meeting ID |

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `is_active` | boolean | Yes | New active status |

**Example Request**

```json
{
  "is_active": false
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Meeting status updated",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "is_active": false
  }
}
```

---

## Attendance

### GET /api/admin/attendance/records

List attendance records with filtering.

**Authentication**: Required

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `meeting_id` | string | - | Filter by meeting |
| `student_id` | string | - | Filter by student |
| `search` | string | - | Search by student name/class |
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Items per page |

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "attendances": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "status": "HADIR",
        "recorded_at": "2026-01-06T09:05:00Z",
        "device_id": "fp_abc123",
        "reason": null,
        "student": {
          "id": "student-uuid",
          "name": "Tanaka Yuki",
          "class": "N3-A"
        },
        "meeting": {
          "id": "meeting-uuid",
          "title": "Japanese Class - Week 1"
        }
      }
    ],
    "pagination": {...}
  }
}
```

---

### GET /api/admin/attendance/{id}

Get a specific attendance record.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Attendance ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "HADIR",
    "recorded_at": "2026-01-06T09:05:00Z",
    "device_id": "fp_abc123",
    "fingerprint_hash": "sha256...",
    "reason": null,
    "student": {...},
    "meeting": {...}
  }
}
```

---

### PATCH /api/admin/attendance/{id}

Update an attendance record.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Attendance ID |

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | enum | No | `HADIR`, `TIDAK_HADIR`, `TERLAMBAT`, `IZIN` |
| `student_name` | string | No | Update student name |
| `student_class` | string | No | Update student class |

**Example Request**

```json
{
  "status": "TERLAMBAT"
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Attendance updated successfully",
  "data": {...}
}
```

---

### DELETE /api/admin/attendance/{id}

Delete an attendance record.

**Authentication**: Required

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Attendance ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Attendance deleted successfully"
}
```

---

### DELETE /api/admin/attendance/records

Bulk delete attendance records.

**Authentication**: Required

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ids` | array | Yes | Array of attendance UUIDs |

**Example Request**

```json
{
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "3 attendance records deleted successfully",
  "deleted": 3
}
```

---

### POST /api/admin/attendance/scan

Record attendance via admin scan.

**Authentication**: Required

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `meeting_id` | string | Yes | Meeting UUID |
| `student_name` | string | Yes | Student name |
| `student_class` | string | Yes | Student class |
| `status` | enum | Yes | `HADIR`, `TERLAMBAT` |

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Attendance recorded",
  "data": {...}
}
```

**Business Logic**

- Upserts attendance (creates or updates if exists for student+meeting)

---

### GET /api/admin/attendance/qr

Generate QR code for a meeting.

**Authentication**: Required

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `meeting_id` | string | Yes | Meeting UUID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Business Logic**

- Generates QR code at 400x400 pixels
- High error correction level
- Returns base64 data URL

---

### POST /api/admin/attendance/permission

Record a permission/leave request by admin.

**Authentication**: Required

**Request Body**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `meeting_id` | string | Yes | Must exist |
| `student_name` | string | Yes | - |
| `student_class` | string | Yes | - |
| `reason` | string | Yes | 10-500 characters |

**Example Request**

```json
{
  "meeting_id": "meeting-uuid",
  "student_name": "Suzuki Hana",
  "student_class": "N4-B",
  "reason": "Medical appointment - doctor's note attached"
}
```

**Success Response (201 Created)**

```json
{
  "success": true,
  "message": "Permission recorded successfully",
  "data": {
    "id": "attendance-uuid",
    "student_name": "Suzuki Hana",
    "status": "IZIN",
    "reason": "Medical appointment - doctor's note attached",
    "recorded_at": "2026-01-06T08:00:00Z"
  }
}
```

**Error Responses**

| Status | Error |
|--------|-------|
| `400` | `{ "success": false, "error": "Reason must be 10-500 characters" }` |
| `409` | `{ "success": false, "error": "Attendance already exists for this student" }` |

---

## Student Portal

### POST /api/student/login

Student login to exam.

**Authentication**: None (public endpoint)

**Request Body**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | Student name |
| `class` | string | Yes | Student class |
| `exam_code` | string | Yes | Must exist and be active |
| `category` | enum | Yes | `Gengo` or `Bunka` |

**Example Request**

```json
{
  "name": "Yamamoto Taro",
  "class": "N3-A",
  "exam_code": "GNG-2026-001",
  "category": "Gengo"
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Login successful. Good luck with your exam!",
  "student": {
    "id": "student-uuid",
    "name": "Yamamoto Taro",
    "class": "N3-A",
    "exam_code": "GNG-2026-001",
    "category": "Gengo",
    "started_at": "2026-01-06T09:00:00Z",
    "is_submitted": false,
    "violations": 0
  },
  "exam": {
    "id": "exam-uuid",
    "name": "JLPT N3 Practice",
    "exam_code": "GNG-2026-001",
    "duration": 60
  }
}
```

**Validation Rules**

1. Exam must exist and be active
2. Current time must be between start_time and end_time
3. Category must match exam category
4. If student exists and already submitted, reject login

**Error Responses**

| Status | Error |
|--------|-------|
| `400` | `{ "success": false, "error": "Exam has not started yet" }` |
| `400` | `{ "success": false, "error": "Exam has ended" }` |
| `400` | `{ "success": false, "error": "You have already submitted this exam" }` |
| `404` | `{ "success": false, "error": "Invalid exam code" }` |

---

### GET /api/student/questions/{category}

Get exam questions for a category.

**Authentication**: None (should be called after student login)

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | enum | `Gengo` or `Bunka` |

**Success Response (200 OK)**

```json
{
  "success": true,
  "questions": [
    {
      "id": "question-uuid",
      "questionNumber": 1,
      "question_text": "What is the reading of 日本?",
      "options": [
        { "id": "A", "text": "にほん" },
        { "id": "B", "text": "にっぽん" },
        { "id": "C", "text": "ひのもと" },
        { "id": "D", "text": "やまと" }
      ],
      "category": "Gengo",
      "exam": {
        "category": "Gengo",
        "name": "JLPT N3 Practice",
        "exam_code": "GNG-2026-001"
      }
    }
  ],
  "total": 100,
  "category": "Gengo"
}
```

**Security Note**

- `correct_option` is **NOT** included in response

---

### POST /api/student/submit-exam

Submit exam answers.

**Authentication**: None (validates by studentId)

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `studentId` | string | Yes | Student UUID |
| `examCode` | string | Yes | Exam code |
| `answers` | array | Yes | Array of answer objects |
| `violations` | integer | No | Tab switch violations (default: 0) |
| `autoSubmitted` | boolean | No | Auto-submitted due to time/violations (default: false) |

**Answer Object**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `questionId` | string | Yes | Question UUID |
| `selectedOption` | enum | Yes | `A`, `B`, `C`, or `D` |

**Example Request**

```json
{
  "studentId": "student-uuid",
  "examCode": "GNG-2026-001",
  "answers": [
    { "questionId": "q1-uuid", "selectedOption": "A" },
    { "questionId": "q2-uuid", "selectedOption": "C" },
    { "questionId": "q3-uuid", "selectedOption": "B" }
  ],
  "violations": 2,
  "autoSubmitted": false
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Exam submitted successfully!",
  "result": {
    "score": 85,
    "totalQuestions": 100,
    "percentage": 85.00,
    "passed": true,
    "violations": 2,
    "autoSubmitted": false,
    "student": {
      "id": "student-uuid",
      "name": "Yamamoto Taro",
      "is_submitted": true
    }
  }
}
```

**Business Logic**

- Validates all question IDs exist
- Calculates score and percentage
- Creates Answer records for each response
- Creates Score record
- Updates student: `is_submitted = true`
- Passing grade: ≥ 70%

**Idempotency**

This operation is NOT idempotent. Submitting twice will return error.

**Error Responses**

| Status | Error |
|--------|-------|
| `400` | `{ "success": false, "error": "Exam code mismatch" }` |
| `400` | `{ "success": false, "error": "You have already submitted this exam" }` |
| `404` | `{ "success": false, "error": "Student not found" }` |

---

### POST /api/student/update-violations

Update violation count during exam.

**Authentication**: None (validates by studentId)

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `studentId` | string | Yes | Student UUID |
| `violations` | integer | Yes | New violation count |

**Example Request**

```json
{
  "studentId": "student-uuid",
  "violations": 3
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Violations updated successfully",
  "data": {
    "violations": 3
  }
}
```

**Business Logic**

- Only works if exam not yet submitted
- Tracks tab switches and suspicious behavior

---

### POST /api/student/find-for-review

Find student for exam review access.

**Authentication**: None

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `studentName` | string | Yes | Student name (case-insensitive search) |
| `examCode` | string | Yes | Exam code |

**Example Request**

```json
{
  "studentName": "yamamoto",
  "examCode": "GNG-2026-001"
}
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "message": "Student found! Redirecting to review...",
  "studentId": "student-uuid",
  "examCode": "GNG-2026-001",
  "studentName": "Yamamoto Taro",
  "examName": "JLPT N3 Practice"
}
```

**Validation Rules**

1. Student must have submitted the exam
2. Exam period must have ended

**Error Responses**

| Status | Error |
|--------|-------|
| `403` | `{ "success": false, "error": "Exam not completed yet" }` |
| `403` | `{ "success": false, "error": "Exam still ongoing" }` |
| `404` | `{ "success": false, "error": "No exam results found" }` |

---

### GET /api/student/exam-review

Get full exam review with answers.

**Authentication**: None

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `studentId` | string | Yes | Student UUID |
| `examCode` | string | Yes | Exam code |

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "exam": {
      "id": "exam-uuid",
      "name": "JLPT N3 Practice",
      "exam_code": "GNG-2026-001",
      "category": "Gengo",
      "duration": 60
    },
    "student": {
      "id": "student-uuid",
      "name": "Yamamoto Taro",
      "class": "N3-A",
      "category": "Gengo"
    },
    "score": {
      "score": 85,
      "total_questions": 100,
      "percentage": 85.00,
      "passed": true
    },
    "questions": [
      {
        "id": "question-uuid",
        "questionNumber": 1,
        "question_text": "What is the reading of 日本?",
        "options": [
          { "id": "A", "text": "にほん" },
          { "id": "B", "text": "にっぽん" },
          { "id": "C", "text": "ひのもと" },
          { "id": "D", "text": "やまと" }
        ],
        "correct_option": "A",
        "student_answer": "A",
        "is_correct": true,
        "explanation": "日本 is commonly read as にほん"
      }
    ],
    "summary": {
      "total_questions": 100,
      "correct_answers": 85,
      "wrong_answers": 15,
      "violations": 2
    }
  }
}
```

**Validation Rules**

1. Student must exist
2. Exam must be submitted
3. Exam code must match student's exam
4. Exam must have ended

---

## Attendance (Public)

### GET /api/attendance/meeting/{id}

Get meeting details and status.

**Authentication**: None

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Meeting ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "meeting": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Japanese Class - Week 1",
    "starts_at": "2026-01-06T09:00:00Z",
    "ends_at": "2026-01-06T11:00:00Z",
    "is_active": true,
    "status": {
      "is_active": true,
      "is_ended": false,
      "message": "Meeting is active"
    }
  }
}
```

**Business Logic**

- Auto-disables meeting if `ends_at` has passed
- Returns computed status based on `is_active`, start time, and end time

---

### GET /api/attendance/list/{id}

List attendances for a meeting.

**Authentication**: None

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Meeting ID |

**Success Response (200 OK)**

```json
{
  "success": true,
  "attendances": [
    {
      "id": "attendance-uuid",
      "student_id": "student-uuid",
      "meeting_id": "meeting-uuid",
      "status": "HADIR",
      "recorded_at": "2026-01-06T09:05:00Z",
      "student": {
        "name": "Tanaka Yuki",
        "class": "N3-A"
      }
    }
  ]
}
```

---

### POST /api/attendance/submit

Submit attendance via student self-service (QR scan).

**Authentication**: Device fingerprinting (triple-layer security)

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `meeting_id` | string | Yes | Meeting UUID |
| `student_name` | string | Yes | Student name |
| `student_class` | string | Yes | Student class |
| `device_id` | string | Yes | Device fingerprint from FingerprintJS |

**Example Request**

```json
{
  "meeting_id": "meeting-uuid",
  "student_name": "Tanaka Yuki",
  "student_class": "N3-A",
  "device_id": "fp_a1b2c3d4e5f6"
}
```

**Success Response (201 Created)**

```json
{
  "success": true,
  "message": "Absensi berhasil dicatat",
  "attendance": {
    "id": "attendance-uuid",
    "student_name": "Tanaka Yuki",
    "class": "N3-A",
    "status": "HADIR",
    "recorded_at": "2026-01-06T09:05:00Z"
  }
}
```

**Response Cookie**

```
Set-Cookie: attendance_{meeting_id}=submitted; HttpOnly; Secure; SameSite=Strict; Path=/
```

**Triple-Layer Security Validation**

1. **User Duplicate Check**: Same student_id + meeting_id + date
2. **Device ID Check**: Same device_id + meeting_id + date
3. **Fingerprint Hash Check**: Same fingerprint_hash + meeting_id + date

**Business Logic**

- Creates student if not exists
- Sets status to `TERLAMBAT` if >15 minutes after meeting start
- Stores hashed fingerprint for security
- Rate limited: 5 requests per minute per device+meeting

**Error Responses**

| Status | Type | Error |
|--------|------|-------|
| `400` | `INVALID_DEVICE_ID` | Invalid fingerprint format |
| `403` | `MEETING_INACTIVE` | Meeting is not active |
| `403` | `MEETING_ENDED` | Meeting has ended |
| `403` | `MEETING_NOT_STARTED` | Meeting has not started yet |
| `404` | - | Meeting not found |
| `409` | `COOKIE_DUPLICATE` | Device already submitted (cookie) |
| `409` | `USER_DUPLICATE` | User already submitted |
| `409` | `DEVICE_DUPLICATE` | Device already used |
| `409` | `FINGERPRINT_DUPLICATE` | Fingerprint already used |
| `429` | `RATE_LIMIT` | Too many requests |

---

### POST /api/attendance/submit-permission

Submit permission/leave request by student.

**Authentication**: None

**Request Body**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `meeting_id` | string | Yes | Must exist |
| `student_name` | string | Yes | - |
| `student_class` | string | Yes | - |
| `reason` | string | Yes | 10-500 characters |

**Example Request**

```json
{
  "meeting_id": "meeting-uuid",
  "student_name": "Suzuki Hana",
  "student_class": "N4-B",
  "reason": "Sick - cannot attend class today"
}
```

**Success Response (201 Created)**

```json
{
  "success": true,
  "message": "Izin berhasil dicatat",
  "attendance": {
    "id": "attendance-uuid",
    "student_name": "Suzuki Hana",
    "class": "N4-B",
    "status": "IZIN",
    "reason": "Sick - cannot attend class today",
    "recorded_at": "2026-01-06T08:00:00Z",
    "meeting_title": "Japanese Class - Week 1"
  }
}
```

**Error Responses**

| Status | Type | Error |
|--------|------|-------|
| `400` | - | Reason must be 10-500 characters |
| `403` | `MEETING_INACTIVE` | Meeting is not active |
| `403` | `MEETING_ENDED` | Meeting has ended |
| `409` | `USER_DUPLICATE` | Already has attendance record |

---

## Public Resources

### GET /api/public/materials

Get published learning materials.

**Authentication**: None (public endpoint)

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | enum | - | `Gengo` or `Bunka` |
| `search` | string | - | Search in title or description |
| `page` | integer | `1` | Page number |
| `limit` | integer | `10` | Items per page |

**Example Request**

```
GET /api/public/materials?category=Gengo&search=hiragana&page=1&limit=10
```

**Success Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "materials": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Introduction to Hiragana",
        "content": "# Hiragana Basics\n\n...",
        "category": "Gengo",
        "description": "Learn the basics of Hiragana",
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-05T00:00:00Z",
        "author": {
          "email": "admin@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**Business Logic**

- Only returns `is_published: true` materials
- Case-insensitive search

---

## Data Models

### Enums

**Category**
```
Gengo | Bunka
```

**Option**
```
A | B | C | D
```

**AttendanceStatus**
```
HADIR | TIDAK_HADIR | TERLAMBAT | IZIN
```

### Entity Relationships

```
AdminUser
  └── Materials (author)
  └── Attendances (scanned_admin)

Exam
  └── ExamQuestions → Questions
  └── Scores → Students

Student
  └── Answers → Questions
  └── Scores → Exams
  └── Attendances → Meetings

Meeting
  └── Attendances → Students
```

---

## Changelog

### v1.0.0 (2026-01-06)

- Initial API documentation
- Authentication endpoints
- Admin management endpoints
- Student portal endpoints
- Attendance system with triple-layer security
- Public materials access

---

## Support

For API support or to report issues:

- **Documentation Issues**: Open a GitHub issue
- **Security Vulnerabilities**: Contact security@your-domain.com
- **General Support**: support@your-domain.com
