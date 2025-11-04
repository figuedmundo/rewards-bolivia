# AI Task Template: Implement Refresh Token Logic

> **Purpose**: This template provides a systematic framework for planning and executing the refresh token feature for the Rewards Bolivia project.

---

## 1. Task Overview

### Task Title
**Title:** Implement Refresh Token Logic for Secure Sessions

### Goal Statement
**Goal:** To allow users to maintain their sessions securely without needing to log in frequently by implementing a robust refresh token mechanism with rotation and secure storage.

---

## 2. Strategic Analysis & Solution Options

> **AI Agent Note:** A deep strategic analysis is not required as the chosen pattern (JWT with rotating refresh tokens) is a well-established industry standard for secure session management.

### Recommendation and Justification

**Recommended Solution:** JWT with Rotating Refresh Tokens stored in HttpOnly Cookies.

**Why this is the best choice:**
1.  **Security:** Storing refresh tokens in HttpOnly cookies mitigates XSS attacks, as the token is not accessible to client-side JavaScript. Token rotation (issuing a new refresh token on each use) helps detect token theft.
2.  **User Experience:** Provides a seamless session experience, as users are not forced to log in every 15 minutes.
3.  **Industry Standard:** This approach is a recognized best practice for handling authentication in modern web applications.

---

## 3. Project Context & Current State

### Technology Stack & Architecture
This feature will be built within the established Rewards Bolivia technical environment (NestJS, Prisma, PostgreSQL).

### Current State
The system currently issues short-lived JWT access tokens (15 min) upon successful email/password or Google OAuth2 authentication. There is no mechanism to refresh these tokens, forcing users to re-authenticate upon expiration. The `RefreshToken` model already exists in the Prisma schema but is not fully implemented.

---

## 4. Feature Definition

### Problem Statement
The short lifespan of access tokens leads to a poor user experience, as users are frequently logged out. A secure and persistent session management mechanism is required.

### Success Criteria (MVP)
- [ ] On login/register, the backend issues a long-lived `refreshToken` and a short-lived `accessToken`.
- [ ] The `refreshToken` is sent to the client via a secure, HttpOnly cookie.
- [ ] A new endpoint, `POST /auth/refresh`, accepts the `refreshToken` from the cookie.
- [ ] The refresh endpoint validates the token, revokes the old one, and issues a new `accessToken` and a new `refreshToken` (rotation).
- [ ] A new endpoint, `POST /auth/logout`, invalidates the user's current refresh token from the database.
- [ ] The system prevents refresh token reuse by checking if it has been revoked.

---

## 5. Technical Requirements

### Functional Requirements
- **User Story:** As a user, I want to stay logged in for an extended period so that I don't have to enter my credentials repeatedly.
- **System Requirement 1:** The system must issue a long-lived refresh token (e.g., 7 days) upon successful authentication.
- **System Requirement 2:** The system must provide a secure endpoint to exchange a valid refresh token for a new access token.
- **System Requirement 3:** Refresh tokens must be invalidated upon logout and protected against reuse.

### Non-Functional Requirements
- **Security:** Refresh tokens must be hashed in the database. Communication should be over HTTPS.
- **Performance:** The `/auth/refresh` endpoint response time must be < 300ms (p95).

---

## 6. Data & Database Changes

### Data Model Updates (Prisma Schema)
The existing `RefreshToken` model is sufficient. We will ensure the `token` field stores a hashed version of the token, not the raw token.

```prisma
model RefreshToken {
  id         String    @id @default(cuid())
  userId     String
  token      String    @unique // This will store the hashed token
  expiresAt  DateTime
  createdAt  DateTime  @default(now())
  revokedAt  DateTime?
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

---

## 7. API & Backend Changes

### API Endpoints Design
```markdown
#### POST /auth/refresh
**Description**: Exchanges a valid refresh token for a new pair of access and refresh tokens.
**Authentication**: Not required (uses refresh token from cookie).
**Request Body**: Empty
**Cookie**: `refresh_token=<user_refresh_token>`
**Success Response (200 OK)**:
Sets a new `refresh_token` HttpOnly cookie.
```json
{
  "accessToken": "new_short_lived_jwt"
}
```

#### POST /auth/logout
**Description**: Invalidates the user's refresh token.
**Authentication**: Required (JWT Access Token).
**Request Body**: Empty
**Success Response (204 No Content)**:
Clears the `refresh_token` cookie.
```

---

## 8. Frontend Changes

### Implementation
- An API client interceptor (e.g., using Axios) will be created.
- When an API request returns a 401 Unauthorized error, the interceptor will automatically call `POST /auth/refresh`.
- If the refresh is successful, the interceptor will retry the original request with the new `accessToken`.
- If the refresh fails, the user will be redirected to the login page.
- The application's logout function will be updated to call `POST /auth/logout`.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Backend Logic
- **Task 1.1:** Update `AuthService` to hash refresh tokens before storing them in the database.
- **Task 1.2:** Modify the `login` and `google/callback` flows in `AuthController` to set the `refreshToken` in a secure HttpOnly cookie.
- **Task 1.3:** Create a `RefreshTokenStrategy` for Passport.js to validate the token from the cookie.
- **Task 1.4:** Implement the `POST /auth/refresh` endpoint, including token rotation logic (revoke old, create new).
- **Task 1.5:** Implement the `POST /auth/logout` endpoint to revoke the token.
- **Task 1.6:** Write comprehensive unit and integration tests for the refresh and logout flows.

### Milestone 2: Frontend Integration
- **Task 2.1:** Create an Axios instance or similar API client with an interceptor to handle automatic token refreshing.
- **Task 2.2:** Update the application's state management to handle the new `accessToken`.
- **Task 2.3:** Update the logout functionality to call the `/auth/logout` endpoint and clear local user state.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Refresh Token Theft** | Medium | High | Use HttpOnly cookies to prevent XSS access. Implement token rotation to detect and invalidate stolen tokens quickly. Enforce HTTPS. |
| **Race Conditions on Refresh** | Low | Medium | The token rotation mechanism naturally mitigates this. If a token is used twice, the second attempt will fail because the token family will have been revoked. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Analyze & Plan:** Start by reading this plan.
2.  **Backend First:** Implement all backend changes (Milestone 1). Ensure all new and existing tests pass.
3.  **Frontend Implementation:** Once the API is stable and tested, proceed with the frontend changes (Milestone 2).
4.  **Integration & E2E Testing:** Connect the frontend to the backend and validate the complete user flow.
5.  **Review & Refactor:** Review the code for adherence to project standards.
