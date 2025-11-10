# AI Task Template: Rewards Bolivia Feature Development

> **Purpose**: This template provides a systematic framework for planning and executing new features for the Rewards Bolivia project. It ensures consistency, quality, and alignment with the project's architectural and product goals.

---

## 1. Task Overview

### Task Title
**Title:** T2.5 Middleware de roles (client, business, admin)

### Goal Statement
**Goal:** To create a middleware in the NestJS API that protects endpoints based on user roles (client, business, admin), ensuring that only authorized users can access specific resources.

---

## 2. Strategic Analysis & Solution Options

### Recommendation and Justification

**Recommended Solution:** NestJS Guards

**Why this is the best choice:**
1.  **Native Integration:** Guards are a fundamental part of NestJS, designed specifically for authorization.
2.  **Declarative:** Roles can be attached to routes declaratively using decorators, making the code clean and easy to read.
3.  **Reusable:** Guards can be easily reused across different modules and controllers.

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
  Infrastructure: Docker & Kubernetes (K8s)
  CI/CD: GitHub Actions
  Testing: Jest (Unit), Playwright (E2E), k6 (Load)
Key Architectural Patterns:
  - Modular Monolith
```

### Current State
The authentication system is in place, with JWT and Google OAuth. Users can log in and get a valid token. However, there is no mechanism to restrict access to certain endpoints based on user roles.

---

## 4. Feature Definition

### Problem Statement
The API needs a robust way to control access to different resources. For example, only users with the `admin` role should be able to access administrative dashboards, and only `business` users should be able to access business-specific functionalities.

### Success Criteria (MVP)
- [ ] A `RolesGuard` is created and functional.
- [ ] A `@Roles` decorator is created to specify which roles are allowed to access an endpoint.
- [ ] The `RolesGuard` correctly allows or denies access based on the user's role.
- [ ] Unit tests are created for the `RolesGuard`.

---

## 5. Technical Requirements

### Functional Requirements
- **System Requirement 1:** The system must be able to extract the user's roles from the JWT payload.
- **System Requirement 2:** The system must compare the user's roles with the roles required by the endpoint.
- **System Requirement 3:** The system must return a `403 Forbidden` error if the user does not have the required roles.

### Non-Functional Requirements
- **Performance:** The middleware should add minimal overhead to the request-response cycle.
- **Security:** The role-checking mechanism must be secure and not easily bypassable.

---

## 6. Data & Database Changes

### Database Schema Changes
The `User` model in `schema.prisma` needs a `role` field.

```prisma
model User {
  id             String    @id @default(cuid())
  // ... existing fields
  role           String    @default("client") // client, business, admin
}
```

---

## 7. API & Backend Changes

### API Endpoints Design
The changes will be in the implementation of the guard and the application of the decorator to existing or new endpoints. For example:

```typescript
@Get('admin-only-route')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
getAdminData() {
  // ...
}
```

---

## 8. Frontend Changes
No frontend changes are required for this task.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Backend Logic
- **Task 1.1:** Add the `role` field to the `User` model in `schema.prisma` and create a migration.
- **Task 1.2:** Create a `roles.decorator.ts` file to define the `@Roles` decorator.
- **Task 1.3:** Create a `roles.guard.ts` file and implement the `RolesGuard`.
- **Task 1.4:** Write unit tests for the `RolesGuard`.
- **Task 1.5:** Apply the `RolesGuard` to a test endpoint and verify its functionality.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Incorrect Role Definition** | Low | Medium | Ensure that the roles are well-defined and consistently used across the application. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Analyze & Plan:** Start by reading the entire plan.
2.  **Backend First:** Implement the backend changes first, including database migrations, service logic, and API endpoints. Ensure all backend tests are passing.
3.  **Integration & E2E Testing:** Connect the frontend to the backend and perform end-to-end testing to validate the complete user flow.
4.  **Review & Refactor:** Before finalizing, review the code for adherence to project standards and refactor where necessary.

### Communication Preferences
- Provide a concise summary of the plan before starting.
- Announce the completion of each major milestone.
- If you encounter a blocker or a significant ambiguity, stop and ask for clarification.

---

## 12. Commit Message

```
feat(auth): implement role-based access control

Implements a robust role-based access control (RBAC) system using NestJS Guards. This change introduces the `RolesGuard` and a `@Roles` decorator to protect endpoints based on user roles (client, business, admin).

Key changes:
- Adds a `role` field to the `User` model in `schema.prisma`.
- Creates `RolesGuard` to handle role-based authorization logic.
- Creates `@Roles` decorator to specify required roles for endpoints.
- Updates `AuthService` to include the user's role in the JWT payload.
- Updates `JwtStrategy` to extract the user's role from the JWT payload.
- Adds a test endpoint (`/users/admin-only`) to demonstrate the usage of the `RolesGuard`.

This change fulfills the requirement for T2.5 and provides a secure and scalable way to manage access to different parts of the API.
```
