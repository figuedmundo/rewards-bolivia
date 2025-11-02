# AI Task Template: Rewards Bolivia Bug Fixes & Refactoring

> **Purpose**: This template provides a systematic framework for AI assistants to analyze, plan, and execute bug fixes and code refactoring tasks with consistent high quality, specifically tailored for the Rewards Bolivia project.

---

## 📋 Template Metadata

- **Template Version**: 1.1.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-11-02
- **Project Name**: Rewards Bolivia
- **Task ID**: [TASK_ID or TICKET_NUMBER]

---

## 🎯 Task Definition

### Issue Summary
**[Provide a clear, one-sentence description of the bug or refactoring need]**

*Example: "User authentication fails with expired tokens instead of refreshing, and the login page UI has alignment issues on mobile."*

### Reported Symptoms
List all observable problems:
- [ ] Symptom 1: [e.g., "Login fails with a 401 error after 15 minutes."]
- [ ] Symptom 2: [e.g., "The login button is partially obscured on screens smaller than 375px."]
- [ ] Symptom 3: [e.g., "No error message is displayed to the user on failed login."]

### User Impact
- **Severity**: [Critical / High / Medium / Low]
- **Affected Users**: [All users / Specific user group / Edge case]
- **Workaround Available**: [Yes / No]
- **Business Impact**: [Describe impact on business/users, e.g., "Prevents users from accessing the app, leading to frustration and potential churn."]

---

## 🏗️ Project Context

### Project Information
```yaml
Project Name: Rewards Bolivia
Architecture: Monorepo (npm workspaces) with a modular monolith backend and a separate frontend.
Technology Stack:
  Backend:
    - Framework: NestJS (TypeScript)
    - Database: PostgreSQL
    - ORM: Prisma
    - Auth: Passport.js (JWT, Google OAuth 2.0)
  Frontend:
    - Framework: React (TypeScript)
    - Build Tool: Vite
    - Styling: Tailwind CSS
    - Components: shadcn/ui, lucide-react
    - Routing: React Router
  Testing:
    - Backend: Jest (Unit & E2E)
    - Frontend: Vitest, React Testing Library
  Infrastructure:
    - Containerization: Docker, Docker Compose
```

### Project Paths & Commands
```yaml
Project Paths:
  Root: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/personal/rewards-bolivia
  API (Backend): packages/api
  Web (Frontend): packages/web
  Prisma Schema: packages/api/prisma/schema.prisma
  Docker Compose: docker-compose.yml

Key Commands:
  - Install All Dependencies: `npm install`
  - Run API Dev Server: `npm run api -- start:dev`
  - Run Web Dev Server: `npm run web -- dev`
  - Run API Tests: `npm run api -- test`
  - Run API E2E Tests: `npm run api -- test:e2e`
  - Run Web Tests: `npm run web -- test`
  - Lint API: `npm run api -- lint`
  - Lint Web: `npm run web -- lint`
  - Generate Prisma Client: `npm run api -- postinstall`
```

### Project Standards & Guidelines

#### Coding Standards
```yaml
Frontend (packages/web):
  - Component Style: Functional Components with Hooks.
  - Styling Approach: Tailwind CSS utility classes. Use `clsx` and `tailwind-merge` for conditional classes.
  - File Naming: PascalCase for components (`MyComponent.tsx`), camelCase for hooks/utils (`useMyHook.ts`).
  - State Management: React Context API for global state, `useState`/`useReducer` for local state.
  - Props Validation: TypeScript interfaces.

Backend (packages/api):
  - Code Style: NestJS conventions, Prettier for formatting.
  - API Pattern: RESTful services structured in modules.
  - Error Handling: Use standard NestJS exceptions (`BadRequestException`, `NotFoundException`, etc.).
  - Validation: `class-validator` and `class-transformer` decorators on DTOs.
  - Database: All interactions must go through the `PrismaService`.
  - Documentation: Add comments for complex logic.
```

#### UI/UX Standards
```yaml
Design System:
  - Component Library: `shadcn/ui` (refer to `packages/web/src/components/ui`).
  - Icons: `lucide-react`.
  - Color Palette & Typography: Defined in `packages/web/tailwind.config.js`.
  
Interaction Patterns:
  - Loading States: Use skeleton components or spinners for data fetching.
  - Error Display: Use toast notifications for non-critical errors and inline messages for form validation.
  - Confirmations: Use the `AlertDialog` component from `shadcn/ui` for destructive actions.
```

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request
**AI Instructions**: Before touching any code, thoroughly understand what's being asked.

#### Questions to Answer:
- [ ] What is the exact problem being reported?
- [ ] What is the expected behavior?
- [ ] What is the current (incorrect) behavior?
- [ ] Is this a bug fix, refactoring, or both?

#### Output Format:
```markdown
### Problem Understanding
**What**: [Concise description of the problem]
**Expected**: [What should happen]
**Actual**: [What currently happens]
**Type**: [Bug / Performance / UX / Code Quality]
```

### Step 1.2: Identify Affected Areas
**AI Instructions**: Determine which parts of the codebase are involved. Use `glob` and `search_file_content` to locate relevant files.

#### Analysis Checklist:
- [ ] Which features/modules are affected? (e.g., `auth`, `users`)
- [ ] Which layers are involved? (UI, API, Database, Service, etc.)

#### Files to Investigate:
1.  **Primary Files**: Files directly mentioned or obviously related.
2.  **Secondary Files**: Dependencies and consumers of primary files.
3.  **Configuration Files**: `nest-cli.json`, `vite.config.ts`, etc.
4.  **Test Files**: Existing tests that might need updates (`*.spec.ts`, `*.test.tsx`).

#### Output Format:
```markdown
### Affected Areas

**Layers Involved**:
- [ ] Frontend UI Components (`packages/web/src/components` or `pages`)
- [ ] Frontend State/Hooks (`packages/web/src/contexts` or `hooks`)
- [ ] Backend Controller (`packages/api/src/*.controller.ts`)
- [ ] Backend Service (`packages/api/src/*.service.ts`)
- [ ] Backend Module (`packages/api/src/*.module.ts`)
- [ ] Database Schema (`packages/api/prisma/schema.prisma`)
- [ ] Other: [specify]

**Primary Files**:
- `path/to/file1.tsx` - [Brief description of role]
- `path/to/file2.ts` - [Brief description of role]

**Secondary Files** (May need updates):
- `path/to/related1.tsx` - [Why it might be affected]
- `path/to/related2.spec.ts` - [Why it might be affected]
```

### Step 1.3: Gather Project Context
**AI Instructions**: Read the necessary files to understand the current implementation. Use `read_file` or `read_many_files`.

#### What to Look For:
- [ ] Current implementation approach in services and components.
- [ ] Data structures (Prisma models, DTOs, TypeScript interfaces).
- [ ] Error handling patterns (`try/catch`, NestJS exception filters).
- [ ] Existing tests and mocking strategies.
- [ ] `TODO` comments or known issues.

### Step 1.4: Root Cause Analysis
**AI Instructions**: Dig deep to find the TRUE cause, not just symptoms.

#### Output Format:
```markdown
### Root Cause Analysis

**Symptom**: [Observable problem]
**Immediate Cause**: [Direct technical reason, e.g., "API call is sending an expired token."]
**Root Cause**: [Underlying reason, e.g., "The refresh token logic is not being triggered on a 401 response from the API interceptor."]

**Evidence**:
1. [Finding 1 supporting the root cause, e.g., "Network tab shows a 401 error on `/api/v1/profile`."]
2. [Finding 2 supporting the root cause, e.g., "The `axios` interceptor in `packages/web/src/lib/api.ts` lacks a retry mechanism after token refresh."]
```

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria
**AI Instructions**: Clearly define what "done" looks like.

#### Success Criteria Template:
```markdown
### Success Criteria

**Functional Requirements**:
- [ ] Requirement 1: [e.g., "Authenticated requests succeed even after the initial access token expires."]
- [ ] Requirement 2: [e.g., "The login page renders correctly on a 375px wide screen."]

**Technical Requirements**:
- [ ] No console errors or warnings in the browser.
- [ ] All existing tests pass (`npm run api -- test` and `npm run web -- test`).
- [ ] New tests are added to cover the bug fix.
- [ ] Code adheres to the project's ESLint and Prettier rules.

**Acceptance Tests**:
1. **Test**: [Specific user action, e.g., "Log in, wait 20 minutes, and refresh the profile page."]
   **Expected**: [The page loads successfully without requiring a new login.]
   
2. **Test**: [Another action, e.g., "Open the login page on a mobile viewport."]
   **Expected**: [All form fields and buttons are visible and usable.]
```

### Step 2.2: Break Down into Steps
**AI Instructions**: Divide the work into logical, manageable steps. Order them by dependency (e.g., backend changes before frontend).

#### Output Format:
```markdown
### Implementation Steps

#### Step 1: [Step Name, e.g., "Update API Refresh Token Logic"]
**Priority**: [Critical / High / Medium]
**Package**: `api`
**Objectives**:
- [ ] Objective 1: [e.g., "Modify `JwtStrategy` to handle expired tokens gracefully."]
**Changes Required**:
- `packages/api/src/auth/auth.service.ts`: [What changes]
**Verification**:
- [ ] How to verify step is complete (e.g., "New unit test for `auth.service` passes.")

---

#### Step 2: [Step Name, e.g., "Implement Frontend Token Refresh Interceptor"]
**Priority**: [Critical / High / Medium]
**Package**: `web`
**Dependencies**: Step 1
**Objectives**:
- [ ] Objective 1: [e.g., "Create an Axios interceptor to catch 401 errors and attempt a token refresh."]
**Changes Required**:
- `packages/web/src/lib/axios.ts`: [What changes]
**Verification**:
- [ ] How to verify step is complete (e.g., "Manual test of leaving the app open for >15 mins and navigating works.")
```

---

## 🛠️ PHASE 3: Implementation Guidance

### Step 3.1: File-by-File Implementation Guide
**AI Instructions**: Provide specific guidance for each file that needs changes, using the `replace` tool.

#### Template for Each File:
```markdown
### File: `path/to/file.ext`

**Issue in This Code**:
- [Explain what's wrong and why.]

**Required Changes**:
1. [Change 1 description]
2. [Change 2 description]

**Guidance**:
- [Provide the `old_string` and `new_string` for the `replace` tool call.]
- [Explain why the change fixes the issue.]
```

### Step 3.2: Edge Cases to Handle
**AI Instructions**: List edge cases and how to handle them.

- **Scenario**: Refresh token itself is expired or invalid.
  - **Expected Behavior**: The user should be logged out and redirected to the login page.
  - **Solution**: The API refresh endpoint should return a specific error (e.g., 403 Forbidden), which the frontend interceptor should handle by clearing local storage and forcing a redirect.
- **Scenario**: Multiple concurrent API requests fail with a 401.
  - **Expected Behavior**: Only one refresh token request should be sent. Other requests should wait for the new token.
  - **Solution**: Implement a locking mechanism in the frontend interceptor to prevent multiple refresh attempts.

---

## 📊 PHASE 4: Deliverables

### Step 4.1: Code and Test Deliverables
**AI Instructions**: Ensure all deliverables meet quality standards.

- **Code Changes**: Provide the full, updated content for each modified file.
- **Test Changes**: Provide the full content for new or updated test files (`*.spec.ts`, `*.test.tsx`).
- **Test Results**: Confirm that all tests pass by running the appropriate commands (`npm run api -- test`, `npm run web -- test`).

### Step 4.2: Documentation
- **Commit Messages**: Use Conventional Commits format (e.g., `fix(api): handle expired tokens in auth service`).
- **Code Comments**: Add JSDoc/TSDoc comments for any new or complex functions.

---

## 📝 PHASE 5: Summary & Documentation

### Step 5.1: Change Summary
**AI Instructions**: Provide a comprehensive summary of all changes made.

```markdown
## Implementation Summary

### Overview
**Task**: [Brief description]
**Status**: Complete

---

### Changes Made

#### Backend Changes (`packages/api`)
1.  **File**: `packages/api/src/auth/auth.service.ts`
    - **Change**: [Description]
    - **Reason**: [Why this change was needed]

#### Frontend Changes (`packages/web`)
1.  **File**: `packages/web/src/lib/axios.ts`
    - **Change**: [Description]
    - **Reason**: [Why this change was needed]

---

### Bug Fixes Applied
- **Bug**: [Bug Description]
- **Root Cause**: [Brief explanation]
- **Fix**: [How it was fixed]
- **Verification**: [Run `npm run api -- test:e2e` and manually verify the login flow remains active after 20 minutes.]
```
