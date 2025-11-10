# AI Task: Implement a Robust Linting Strategy

> **Purpose**: This task is to establish a consistent and automated linting process for both the frontend (web) and backend (api) packages, improving code quality, enforcing style consistency, and catching potential errors early in the development cycle.

---

## 1. Task Overview

### Task Title
**Title:** Implement a Robust Linting Strategy Across the Monorepo

### Goal Statement
**Goal:** To establish a consistent and automated linting process for both the frontend (web) and backend (api) packages, improving code quality, enforcing style consistency, and catching potential errors early in the development cycle.

---

## 2. Strategic Analysis & Solution Options

A unified linting strategy is a standard best practice for monorepos, and the chosen solution is straightforward. Therefore, a detailed strategic analysis is not required.

### Why Use Turborepo for a Unified Linting Strategy?

While it's true that both the `api` and `web` packages have their own `lint` scripts, simply calling them individually from the root of the project is inefficient and misses out on the significant advantages of using a monorepo orchestration tool like Turborepo. Here's a detailed breakdown of why `turbo` is the right choice for this project:

1.  **Simplified Developer Experience with a Single Command**:
    *   **Without Turborepo**: To lint the entire project, a developer would need to run multiple commands, such as `pnpm --filter=api lint` and then `pnpm --filter=web lint`. This is cumbersome, error-prone, and requires developers to remember the specific commands for each package.
    *   **With Turborepo**: We can define a single, memorable script in the root `package.json`, like `"lint": "turbo run lint"`. A developer can then simply run `pnpm lint` from the project root to lint all packages. This simplifies the development workflow and reduces cognitive load.

2.  **Intelligent Parallel Execution for Faster Linting**:
    *   **Without Turborepo**: Running the linting commands sequentially means that the `web` package's linter will only start after the `api` package's linter has completely finished.
    *   **With Turborepo**: `turbo run lint` will inspect the project and run the `lint` scripts for both `api` and `web` in parallel, as they don't depend on each other. This can nearly halve the time it takes to lint the entire project, providing faster feedback to developers.

3.  **Powerful Caching for Unmatched Speed (Remote Caching)**:
    *   This is one of Turborepo's most significant features. The first time you run `pnpm lint`, Turborepo will perform the linting for all packages and then store a cache of the results.
    *   On subsequent runs, if the files in a particular package (e.g., `web`) have not changed, Turborepo will skip running the linter for that package entirely and instead restore the results from the cache. This is what Turborepo calls "Remote Caching".
    *   This means that if you only make changes to the `api` package, running `pnpm lint` will be almost instantaneous for the `web` package, as it will just replay the cached logs. This dramatically speeds up local development and CI/CD pipelines, as you're only ever doing the minimum amount of work necessary.

4.  **Scalability for a Growing Monorepo**:
    *   As the "Rewards Bolivia" project grows and more packages are added (e.g., a mobile app, a shared UI library), the benefits of Turborepo will become even more pronounced.
    *   Without a tool like `turbo`, the time it takes to run all the necessary checks (linting, testing, building) will grow linearly with the number of packages.
    *   With `turbo`, the time will grow much more slowly, thanks to parallelization and caching. This ensures that the project remains fast and easy to work on, even as it becomes more complex.

5.  **Consistency with Existing Project Tooling**:
    *   The project already uses `turbo` for its `test` script (`"test": "turbo run test"`).
    *   Using `turbo` for the `lint` script as well establishes a consistent and predictable way of running tasks across the monorepo. This makes the project easier to understand and onboard new developers.

In summary, while it's technically possible to run the individual lint scripts without `turbo`, doing so would be a missed opportunity to leverage a powerful tool that is specifically designed to solve the challenges of working with monorepos. By using `turbo`, we get a faster, more efficient, and more scalable development workflow with a better developer experience.

### Recommendation and Justification

**Recommended Solution:** Use `turbo` to run linting across all workspaces.

**Why this is the best choice:**
1.  **Consistency:** It aligns with the existing `test` script, which already uses `turbo`.
2.  **Efficiency:** `turbo` can run tasks in parallel and cache results, which will be beneficial as the project grows.
3.  **Simplicity:** It provides a single command to lint the entire project.

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
  Infrastructure: Docker & pnpm workspaces
  CI/CD: GitHub Actions
  Testing: Jest (Unit), Vitest (Unit), Playwright (E2E)
Key Architectural Patterns:
  - Modular Monolith
```

### Current State
Currently, both the `api` and `web` packages have their own `lint` scripts defined in their respective `package.json` files. However, there is no top-level script in the root `package.json` to run linting across all workspaces. An attempt to add a `lint` script that uses `turbo` failed because `turbo` is not installed as a dev dependency in the root `package.json`.

---

## 4. Feature Definition

### Problem Statement
The project currently lacks a unified and easily executable linting strategy. Developers have to run linting for each package separately, which is inefficient and can lead to inconsistencies. The `turbo` CLI, which is the intended tool for this task, is not installed as a dev dependency, causing the `lint` command to fail.

### Success Criteria (MVP)
- [ ] A single command (`pnpm lint`) from the root of the project lints all workspaces successfully.
- [ ] `turbo` is added as a dev dependency to the root `package.json`.
- [ ] The `GEMINI.md` file is updated to reflect the new, working linting command.

---

## 5. Technical Requirements

### Functional Requirements
- **System Requirement 1:** Add `turbo` as a dev dependency to the root `package.json`.
- **System Requirement 2:** Ensure `pnpm install` installs `turbo` correctly.
- **System Requirement 3:** The `pnpm lint` command must execute `turbo run lint` and succeed.
- **System Requirement 4:** The `lint` command should correctly lint all workspaces (`api` and `web`).

---

## 6. Data & Database Changes

None.

---

## 7. API & Backend Changes

None.

---

## 8. Frontend Changes

None.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Implement Unified Linting
- **Task 1.1:** Add `turbo` as a dev dependency to the root `package.json`.
- **Task 1.2:** Run `pnpm install` to install the new dependency.
- **Task 1.3:** Run `pnpm lint` from the root of the project and verify that it lints all workspaces without errors.
- **Task 1.4:** Update the `GEMINI.md` documentation to reflect the correct and working `pnpm lint` command.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Inconsistent Linting Rules** | Low | Medium | Each workspace already has its own linting configuration. This task focuses on orchestration, not rule changes. Future work could unify rules if needed. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Analyze & Plan:** Start by reading the entire plan.
2.  **Add Dependency:** Add the `turbo` dev dependency to the root `package.json`.
3.  **Install:** Run `pnpm install`.
4.  **Verify:** Run `pnpm lint` to ensure it works as expected.
5.  **Document:** Update `GEMINI.md`.

---

## Commit Message

```
feat: Implement unified linting strategy and update documentation

This commit introduces a unified linting strategy across the monorepo using `turbo run lint`.
It ensures that `pnpm lint` from the project root now lints both `api` and `web` packages.

Resolved existing linting issues in the `packages/web` directory, including:
- Replaced `any` type with `User` interface in `AuthContext.tsx`.
- Refactored `require()` statements to ES module imports and updated `useAuth` mocking in `LoginPage.test.tsx`.
- Corrected unused variable linting error in `LoginPage.tsx`.

Updated `README.md` to provide comprehensive documentation for:
- Running Playwright E2E tests.
- Understanding Husky Git hooks (`pre-commit` and `commit-msg`).
- Generating and viewing LCOV code coverage reports for the `web` package.
- The 'e2e' package is now correctly included in 'pnpm-workspace.yaml', resolving issues with pnpm filtering.
- The 'rewards-bolivia-e2e' package has been renamed to 'e2e' for conciseness.
- The 'README.md' has been comprehensively updated to:
  - Use 'pnpm' consistently across all commands.
  - Provide accurate instructions for running E2E tests from the project root, including options for headed mode, UI mode, specific browser projects (e.g., Chromium), and viewing test reports.
  - Clarify installation and running project steps.

Added `coverage/` to the root `.gitignore` to prevent committing generated code coverage reports.
```