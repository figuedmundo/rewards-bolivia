# AI Task Template: Rewards Bolivia Feature Development

> **Purpose**: This template provides a systematic framework for planning and executing new features for the Rewards Bolivia project. It ensures consistency, quality, and alignment with the project's architectural and product goals.

---

## 1. Task Overview

### Task Title
**Title:** Implement Google OAuth2 Authentication

### Goal Statement
**Goal:** To allow users to sign up and log in to the Rewards Bolivia platform using their Google accounts, providing a faster, more secure, and convenient authentication method. This will reduce friction for new users and improve the overall user experience.

---

## 2. Strategic Analysis & Solution Options

### Problem Context
The task is to add Google social login. The primary technical decision is how to integrate this into our existing NestJS authentication module.

### Solution Options Analysis

#### Option 1: Use `passport-google-oauth20` with NestJS
**Approach:** Integrate the `passport-google-oauth20` strategy into the existing `AuthModule`. This involves creating a Google strategy, a controller with `/auth/google` and `/auth/google/callback` endpoints, and updating the `AuthService` to handle user creation or retrieval upon successful authentication from Google.

**Pros:**
- It is the standard and most common approach for adding OAuth providers in a NestJS application.
- It is well-documented and widely used within the Passport.js ecosystem.
- Integrates seamlessly with our existing Passport-based JWT strategy.

**Cons:**
- Requires careful handling of environment variables for Google API keys.
- The frontend and backend callback logic needs to be coordinated correctly to ensure a smooth user redirection flow.

**Implementation Complexity:** Medium - Requires configuration on both Google Cloud Platform (to get API keys) and in the code, plus frontend/backend coordination for the redirects.
**Risk Level:** Low - This is a well-established and reliable pattern.

### Recommendation and Justification

**Recommended Solution:** Option 1 - Use `passport-google-oauth20` with NestJS

**Why this is the best choice:**
1.  **Idiomatic Approach:** It is the idiomatic and recommended way to implement third-party authentication in NestJS, ensuring maintainability and compatibility.
2.  **Extensibility:** This pattern makes it trivial to add other OAuth providers (e.g., Apple, Facebook) in the future by simply adding new Passport strategies.
3.  **Security:** It leverages the battle-tested security of Passport.js for handling the OAuth2 flow.

---

## 3. Project Context & Current State

### Technology Stack & Architecture
This feature will be built within the established Rewards Bolivia technical environment.

```yaml
Project Name: Rewards Bolivia
Technology Stack:
  Backend: NestJS (Node.js + TypeScript)
  Web App (Dashboard): React (Vite + Tailwind CSS + shadcn/ui)
  Database (Primary): PostgreSQL
  ORM / DB Toolkit: Prisma
  Caching: Redis
  Infrastructure: Docker
  CI/CD: GitHub Actions (pending)
  Testing: Jest (Unit), E2E tests
Key Architectural Patterns:
  - Modular Monolith
```

### Current State
The system currently has a local authentication strategy using email/password, which issues JWTs for session management. The `AuthModule`, `UsersModule`, and `JwtStrategy` are already in place. The frontend has basic login/register forms but no social login options.

---

## 4. Feature Definition

### Problem Statement
The current registration process requires users to manually enter their details and create a new password. This is a point of friction that can lead to user drop-off. A social login option like Google is a standard expectation for modern applications and is missing from our platform.

### Success Criteria (MVP)
- [ ] A user can click a "Sign in with Google" button on the frontend.
- [ ] The user is redirected to the Google consent screen.
- [ ] After granting permission, the user is redirected back to the application and is successfully logged in.
- [ ] If the user is new, a new user account is created automatically in the database using their Google profile information (name, email).
- [ ] If the user already exists (matched by email), the system logs them in without creating a new account.
- [ ] A valid JWT is issued to the client upon successful login.

---

## 5. Technical Requirements

### Functional Requirements
- **User Story:** As a new user, I want to sign up with my Google account so that I don't have to fill out a form or remember a new password.
- **System Requirement 1:** The system must securely manage Google OAuth2 client ID and secret using environment variables.
- **System Requirement 2:** The system must handle the OAuth2 callback, exchange the authorization code for an access token, and fetch the user's profile from Google.

### Non-Functional Requirements
- **Security:** Client secrets must not be exposed on the frontend or committed to version control.
- **Performance:** The entire OAuth2 login flow should feel near-instantaneous to the user after they grant consent.

---

## 6. Data & Database Changes

### Database Schema Changes
To support multiple authentication providers, the `User` model in `prisma.schema` will be updated. The `password` will become optional, and fields for `provider` and `providerId` will be added.

### Data Model Updates (Prisma Schema)
```prisma
// In packages/api/prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String? // Optional for OAuth users

  // Fields for OAuth providers
  provider   String   @default("local")
  providerId String?

  // Other existing fields...
  // e.g., refreshTokens RefreshToken[]

  @@unique([provider, providerId])
}
```

---

## 7. API & Backend Changes

### API Endpoints Design
```markdown
#### GET /api/auth/google
**Description**: Initiates the Google OAuth2 login flow, redirecting the user to the Google consent screen.
**Authentication**: None required.

#### GET /api/auth/google/callback
**Description**: The endpoint Google redirects to after user consent. Handles user lookup/creation, issues a JWT, and redirects the user back to the frontend.
**Authentication**: Handled by the `passport-google-oauth20` strategy.
```

### Module Changes
- **`auth.module.ts`**: Update to import and register the new Google strategy.
- **`auth.controller.ts`**: Add the `/google` and `/google/callback` endpoints.
- **`auth.service.ts`**: Add logic to handle user validation from the Google profile (find or create user).
- **`google.strategy.ts`**: New file to define the `passport-google-oauth20` strategy.

---

## 8. Frontend Changes

### New Components
- **GoogleSignInButton:** A reusable button component for initiating the Google login flow.

### Page Updates
- **Login/Register Pages:** Add the `GoogleSignInButton` to these pages.
- **`/auth/callback` Route:** A new route to handle the final step of authentication, receiving the JWT from the backend (e.g., via query parameters), storing it, and redirecting the user to their dashboard.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Google Cloud & Backend Setup
- [ ] **Task 1.1:** Create a project in Google Cloud Platform, configure the OAuth consent screen, and obtain a Client ID and Client Secret.
- [ ] **Task 1.2:** Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to the `.env` file and add placeholders to `.env.example`.
- [ ] **Task 1.3:** Update the `User` model in `prisma.schema` as described above and run `npx prisma migrate dev`.
- [ ] **Task 1.4:** Install `passport-google-oauth20` and `@types/passport-google-oauth20` in the `api` package.
- [ ] **Task 1.5:** Implement `google.strategy.ts` in the `packages/api/src/auth` directory.
- [ ] **Task 1.6:** Update `auth.module.ts` to register the new strategy.

### Milestone 2: Backend Logic & API Endpoints
- [ ] **Task 2.1:** Implement the `validate` method in `auth.service.ts` to find or create a user based on the Google profile.
- [ ] **Task 2.2:** Add the `/google` and `/google/callback` endpoints to `auth.controller.ts`, protected by the Google Auth Guard.
- [ ] **Task 2.3:** Write integration tests for the Google OAuth2 flow.
> **Note:** Automated E2E tests for the OAuth flow will be skipped. This will be manually tested after the frontend implementation is complete.

### Milestone 3: Frontend Integration
- [ ] **Task 3.1:** Create the `GoogleSignInButton` component in the `web` package.
- [ ] **Task 3.2:** Add the button to the login and registration pages.
- [ ] **Task 3.3:** Implement the frontend logic to handle the redirect to `/api/auth/google` and the callback logic to store the JWT.
- [ ] **Task 3.4:** Write E2E tests for the full Google login flow.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Misconfiguration of Redirect URIs** | Medium | High | Double-check that the authorized redirect URIs in the Google Cloud Console exactly match the ones used in the application. Use environment variables for domains to avoid errors between `localhost` and production. |
| **Insecure Storage of Client Secret** | Low | High | Ensure the `.env` file containing the secret is listed in `.gitignore`. In production, use a dedicated secret management service. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Analyze & Plan:** Start by reading this entire plan.
2.  **Backend First:** Implement the backend changes first (Milestone 1 & 2). Ensure all backend tests are passing before moving to the frontend.
3.  **Frontend Implementation:** Once the API is stable, proceed with the frontend changes (Milestone 3).
4.  **Integration & E2E Testing:** Connect the frontend to the backend and perform end-to-end testing.
5.  **Review & Refactor:** Review the code for adherence to project standards.

### Communication Preferences
- Announce the completion of each major milestone.
- If you encounter a blocker, stop and ask for clarification.
