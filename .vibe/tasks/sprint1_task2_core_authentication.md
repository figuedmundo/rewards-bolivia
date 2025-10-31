# AI Task: Sprint 1 - Implement Core Authentication (JWT & Basic Login/Registration)

> **Purpose**: This document outlines the plan for implementing the foundational user authentication system for the Rewards Bolivia API.

---

## 1. Task Overview

### Task Title
**Title:** Sprint 1: Implement Core Authentication (JWT & Basic Login/Registration)

### Goal Statement
**Goal:** To establish a secure and functional user authentication system for the API, enabling users and businesses to register and log in using email/password, and securing API endpoints with JWT access and refresh tokens. This is a foundational step for all subsequent user-facing features.

---

## 2. Strategic Analysis & Solution Options

> **AI Agent Note:** Strategic analysis is performed for the JWT token strategy.

### Problem Context
Implementing authentication requires choosing a secure and user-friendly method for managing user sessions and protecting API resources. The primary tension is between simplicity of implementation and robust security/user experience.

### Solution Options Analysis

#### Option 1: Simple JWT (Access Token Only)
**Approach:** Upon successful login, issue a single, relatively long-lived JWT access token. This token is used for all subsequent authenticated requests.

**Pros:**
- Simplest to implement initially.
- Fewer moving parts to manage.

**Cons:**
- Higher security risk: if the token is compromised, it remains valid until its (long) expiry, making revocation difficult.
- Worse UX: users would need to re-authenticate frequently if tokens are short-lived for security.

**Implementation Complexity:** Low - [Minimal token management logic]
**Risk Level:** Medium - [Higher risk of session hijacking if token is compromised]

#### Option 2: JWT with Access and Refresh Tokens (Chosen)
**Approach:** Upon successful login, issue a short-lived access token (for API access) and a long-lived refresh token (for obtaining new access tokens without re-authenticating). Refresh tokens are stored securely and can be revoked.

**Pros:**
- Enhanced security: short-lived access tokens minimize the window of vulnerability if compromised. Refresh tokens can be revoked instantly.
- Better UX: users maintain long-lived sessions without frequent re-logins.
- Industry standard for modern web/mobile applications.

**Cons:**
- More complex implementation: requires managing the lifecycle of two tokens, secure storage of refresh tokens, and a refresh endpoint.

**Implementation Complexity:** Medium - [Requires careful management of two token types]
**Risk Level:** Low - [Improved security posture with revocable refresh tokens]

### Recommendation and Justification

**Recommended Solution:** Option 2 - JWT with Access and Refresh Tokens

**Why this is the best choice:**
1.  **Enhanced Security:** The short lifespan of access tokens significantly reduces the impact of a token compromise, while refresh token revocation provides control over active sessions.
2.  **Superior User Experience:** Users can enjoy persistent sessions without the frustration of frequent re-logins, aligning with the project's goal of a fluid and intuitive experience.
3.  **Industry Best Practice:** This pattern is widely adopted and well-understood, providing a robust and maintainable solution for authentication.

---

## 3. Project Context & Current State

### Technology Stack & Architecture
This feature will be built within the established Rewards Bolivia technical environment.

```yaml
Project Name: Rewards Bolivia
Technology Stack:
  Backend: NestJS (Node.js + TypeScript)
  Mobile App: Flutter
  Web App (Dashboard): React (Vite + Tailwind CSS + shadcn/ui)
  Database (Primary): PostgreSQL
  ORM / DB Toolkit: Prisma
  Caching: Redis
  Blockchain (Audit): Polygon (PoS)
  Infrastructure: Docker & Kubernetes (K8s)
  CI/CD: GitHub Actions
  Testing: Jest (Unit), Playwright (E2E), k6 (Load)
Key Architectural Patterns:
  - Modular Monolith
  - Hybrid Off-chain/On-chain (Proof-of-Audit)
  - Event-driven (for asynchronous tasks)
```

### Current State
The monorepo structure is set up, and placeholder NestJS and React applications exist. The Docker Compose environment for PostgreSQL and Redis is running. No authentication logic or user management is currently implemented.

---

## 4. Feature Definition

### Problem Statement
Users and businesses need a secure way to identify themselves and access protected resources within the Rewards Bolivia ecosystem. Without a robust authentication system, the application cannot differentiate users, personalize experiences, or protect sensitive data.

### Success Criteria (MVP)
- [ ] Users can register with a unique email and password.
- [ ] Passwords are securely hashed (e.g., bcrypt) before storage.
- [ ] Users can log in with their registered credentials.
- [ ] Successful login returns a short-lived access token and a long-lived refresh token.
- [ ] Protected API endpoints can be accessed only with a valid access token.
- [ ] An endpoint exists to refresh an expired access token using a valid refresh token.
- [ ] An endpoint exists to log out, invalidating the refresh token.

---

## 5. Technical Requirements

### Functional Requirements
- User can register with email and password.
- User can log in with email and password.
- User can refresh their access token.
- User can log out.
- System protects routes with JWT authentication.

### Non-Functional Requirements
- **Security:** Passwords must be hashed using bcrypt. JWT tokens must be signed with a strong secret. Refresh tokens must be stored securely (e.g., HTTP-only cookies or encrypted in DB) and be revocable.
- **Performance:** Authentication endpoints should respond within 200ms.
- **Reliability:** The authentication system should be highly available and resilient to common attack vectors.

---

## 6. Data & Database Changes

### Database Schema Changes
```sql
-- Example: User table
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Example: RefreshToken table (if storing in DB)
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

### Data Model Updates (Prisma Schema)
```prisma
// Example: User model
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  passwordHash  String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  refreshTokens RefreshToken[]
}

// Example: RefreshToken model
model RefreshToken {
  id         String    @id @default(cuid())
  userId     String
  token      String    @unique
  expiresAt  DateTime
  createdAt  DateTime  @default(now())
  revokedAt  DateTime?
  user       User      @relation(fields: [userId], references: [id])

  @@index([userId])
}
```

---

## 7. API & Backend Changes

### API Endpoints Design
```markdown
#### POST /auth/register
**Description**: Registers a new user with email and password.
**Request Body**: `{ "email": "string", "password": "string" }`
**Success Response (201 Created)**: `{ "message": "User registered successfully" }`
**Error Response (409 Conflict)**: `{ "message": "Email already registered" }`

#### POST /auth/login
**Description**: Authenticates a user and issues JWT tokens.
**Request Body**: `{ "email": "string", "password": "string" }`
**Success Response (200 OK)**: `{ "accessToken": "string", "refreshToken": "string" }`
**Error Response (401 Unauthorized)**: `{ "message": "Invalid credentials" }`

#### POST /auth/refresh
**Description**: Refreshes an expired access token using a valid refresh token.
**Request Body**: `{ "refreshToken": "string" }`
**Success Response (200 OK)**: `{ "accessToken": "string" }`
**Error Response (401 Unauthorized)**: `{ "message": "Invalid or expired refresh token" }`

#### POST /auth/logout
**Description**: Invalidates a refresh token, effectively logging out the user.
**Request Body**: `{ "refreshToken": "string" }`
**Success Response (200 OK)**: `{ "message": "Logged out successfully" }`
**Error Response (401 Unauthorized)**: `{ "message": "Invalid refresh token" }`

#### GET /users/me (Protected Route Example)
**Description**: Retrieves information about the authenticated user.
**Authentication**: Required (Bearer Access Token)
**Success Response (200 OK)**: `{ "id": "string", "email": "string", ... }`
**Error Response (401 Unauthorized)**: `{ "message": "Unauthorized" }`
```

---

## 8. Frontend Changes

No frontend UI changes are part of this task. The focus is on building the backend authentication API. Frontend applications (`web` and `mobile`) will consume these APIs in subsequent tasks.

---

## 9. Implementation Plan & Tasks

### Milestone 1: User & Auth Module Setup
- **Task 1.1:** Configure NestJS `api` project to use Prisma. Install `@prisma/client` and `prisma` dev dependency. Initialize Prisma (`npx prisma init`).
- **Task 1.2:** Define `User` and `RefreshToken` models in `prisma/schema.prisma`.
- **Task 1.3:** Run Prisma migration to create `users` and `refresh_tokens` tables in PostgreSQL.
- **Task 1.4:** Create a new NestJS `AuthModule` and `UsersModule`.
- **Task 1.5:** Implement a password hashing utility (e.g., `bcrypt`) within the `AuthModule`.

### Milestone 2: Registration & Login Endpoints
- **Task 2.1:** Implement `AuthService` with methods for user registration and validation.
- **Task 2.2:** Implement `AuthService` method for user login, including password comparison and JWT token generation.
- **Task 2.3:** Create `AuthController` with `POST /auth/register` and `POST /auth/login` endpoints.
- **Task 2.4:** Integrate `JwtService` from `@nestjs/jwt` for token creation.

### Milestone 3: Token Management & Protection
- **Task 3.1:** Implement a `JwtStrategy` and `JwtAuthGuard` to protect API routes using access tokens.
- **Task 3.2:** Implement `AuthService` method for refreshing access tokens using a valid refresh token.
- **Task 3.3:** Implement `AuthService` method for invalidating refresh tokens (logout).
- **Task 3.4:** Add `POST /auth/refresh` and `POST /auth/logout` endpoints to `AuthController`.
- **Task 3.5:** Create a sample protected route (e.g., `GET /users/me` in `UsersController`) to test authentication.

### Milestone 4: Testing
- **Task 4.1:** Write unit tests for `AuthService` (registration, login, token generation, refresh, logout logic).
- **Task 4.2:** Write integration tests for `AuthController` endpoints (register, login, refresh, logout, protected route access).
- **Task 4.3:** Ensure password hashing and JWT token validation are covered by tests.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **JWT Secret Exposure** | Medium | High | Store JWT secrets in environment variables (`.env` file, Docker secrets in production) and never hardcode them. |
| **Refresh Token Theft** | Medium | High | Store refresh tokens securely (e.g., HTTP-only cookies for web, encrypted storage for mobile). Implement refresh token rotation and allow server-side revocation. |
| **Brute-force Attacks** | Medium | Medium | Implement rate limiting on login attempts (e.g., using Redis) and account lockout mechanisms. |
| **SQL Injection / XSS** | Low | High | NestJS/Prisma provide good protection against SQL injection. Input validation (e.g., using class-validator) on all incoming data is crucial to prevent XSS and other injection attacks. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Database Setup:** Start by configuring Prisma and defining the User and RefreshToken models, then apply the migration.
2.  **Auth Module Core:** Implement the `AuthModule`, `UsersModule`, services, and controllers for basic registration and login.
3.  **Token Management:** Add JWT generation, refresh, and logout logic.
4.  **Security:** Implement JWT guards and strategies to protect routes.
5.  **Testing:** Thoroughly test all authentication flows, including edge cases and security aspects.

### Communication Preferences
- Provide a concise summary of the plan before starting.
- Announce the completion of each major milestone (e.g., "Milestone 1: User & Auth Module Setup is complete.").
- Highlight any security considerations or decisions made during implementation.
