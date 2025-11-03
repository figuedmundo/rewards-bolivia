# AI Task: Architectural Refactor based on Project Structure Feedback

> **Purpose**: This document outlines the plan for executing a foundational architectural refactoring of the Rewards Bolivia project. The goal is to implement the recommendations from the "Project Structure Feedback" document to improve modularity, scalability, and developer experience.

---

## 1. Task Overview

### Task Title
**Title:** Architectural Refactor: Implement Core Structural Improvements

### Goal Statement
**Goal:** To refactor the project structure to align with expert recommendations, establishing clear boundaries between packages, separating concerns, and setting up a robust foundation for future development. This will increase maintainability, reduce technical debt, and improve developer velocity.

---

## 2. Strategic Analysis & Solution Options

> **AI Agent Note:** The strategic analysis for this task was completed in the "Project Structure Feedback" document. This plan is the execution of that strategy. The recommendation is to proceed with the incremental migration plan outlined in the feedback.

### Recommendation and Justification

**Recommended Solution:** Adopt the incremental migration plan from the feedback document.

**Why this is the best choice:**
1.  **Minimizes Disruption:** An incremental approach allows for continuous development and avoids a "big bang" refactor that would halt progress.
2.  **Delivers Value Quickly:** Foundational packages like `shared-types` and `worker` provide immediate benefits by reducing duplication and clarifying background processing.
3.  **Reduces Risk:** Each step is small, verifiable, and builds upon the last, making it easier to catch and fix issues as they arise.

---

## 3. Project Context & Current State

### Technology Stack & Architecture
The existing technology stack remains the same. This refactor will primarily reorganize the project structure and introduce new packages within the monorepo.

```yaml
Project Name: Rewards Bolivia
Technology Stack:
  Backend: NestJS (Node.js + TypeScript)
  Web App (Dashboard): React (Vite + Tailwind CSS)
  Database (Primary): PostgreSQL
  ORM / DB Toolkit: Prisma
  Caching: Redis
  Infrastructure: Docker
  CI/CD: GitHub Actions
Key Architectural Patterns:
  - Modular Monolith
```

### Current State
The project is a monorepo with two primary packages: `api` and `web`. Shared logic is not clearly separated, there is no dedicated worker package, and infrastructure configurations are mixed. The feedback document provides a detailed analysis of the current state.

---

## 4. Feature Definition (Structural Improvement)

### Problem Statement
The current project structure lacks clear separation for shared code, background workers, and environment-specific infrastructure, leading to risks of code duplication, tight coupling, and operational incidents. This refactor addresses these foundational issues to enable scalable future development.

### Success Criteria (MVP for this Refactor)
- [ ] A `packages/shared-types` package is created and contains common DTOs/types.
- [ ] The `api` and `web` packages are successfully consuming types from `packages/shared-types`.
- [ ] A `packages/worker` package is created with a basic job processor.
- [ ] Infrastructure code is separated into `infra/local` and `infra/prod`.
- [ ] An OpenAPI specification is generated from the `api` package.
- [ ] A `packages/sdk` is created and contains a client generated from the OpenAPI spec.
- [ ] CI pipeline is updated to be package-aware and includes migration checks.
- [ ] A shared `packages/test-utils` package is created for testing utilities.

---

## 5. Technical Requirements

### Functional Requirements
- **System Requirement 1:** The monorepo must be organized into a multi-package structure, including `libs`, `worker`, `sdk`, and `shared-types`.
- **System Requirement 2:** Imports between packages must use workspace aliases (e.g., `@shared-types/*`), not relative paths.
- **System Requirement 3:** The `worker` package must be able to run independently to process background jobs.
- **System Requirement 4:** The CI pipeline must be able to run tests and builds selectively for changed packages.

### Non-Functional Requirements
- **Maintainability:** The new structure should make it easier to locate code, understand dependencies, and add new features without unintended side effects.
- **Developer Experience:** Setting up the local development environment should be streamlined with helper scripts.
- **Scalability:** The architecture must support the future addition of new applications (e.g., a mobile app) and the potential extraction of modules into microservices.

---

## 6. Data & Database Changes

No direct database schema changes are planned for this initial refactor. However, a key part of this task is to establish a robust process for future migrations.

### Migration Policy
- All schema changes must be accompanied by a Prisma migration file in the PR.
- The CI pipeline will be updated to run `prisma migrate deploy` on a temporary database to validate the migration.

---

## 7. API & Backend Changes

### OpenAPI Specification
- An OpenAPI (Swagger) endpoint will be added to the NestJS application.
- The CI pipeline will include a step to generate an OpenAPI spec from this endpoint.

---

## 8. Frontend Changes

### Dependency Updates
- The `web` package will be updated to import DTOs and types from the new `packages/shared-types` and `packages/sdk` packages instead of defining them locally.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Foundational Packages & Types
- **Task 1.1:** Create `packages/shared-types` and move common DTOs (e.g., `RegisterUserDto`) into it.
- **Task 1.2:** Configure TypeScript path mapping (`tsconfig.json`) to allow workspace imports (`@shared-types/*`).
- **Task 1.3:** Update `api` and `web` packages to import from `packages/shared-types`.
- **Task 1.4:** Create a minimal `packages/libs/logger` package for structured logging.

### Milestone 2: Worker & Infrastructure Separation
- **Task 2.1:** Create a minimal `packages/worker` package with a placeholder for a background job (e.g., using BullMQ or a similar library).
- **Task 2.2:** Create `infra/local` and `infra/prod` directories.
- **Task 2.3:** Move the existing `docker-compose.yml` files to `infra/local`.
- **Task 2.4:** Create placeholder README files in `infra/prod` for future Kubernetes/Terraform configurations.

### Milestone 3: API Contract and SDK Generation
- **Task 3.1:** Add OpenAPI (Swagger) generation to the NestJS application.
- **Task 3.2:** Create a `packages/sdk` directory.
- **Task 3.3:** Add a script to the root `package.json` to generate a TypeScript client from the OpenAPI spec and place it in `packages/sdk`.

### Milestone 4: Testing and CI Improvements
- **Task 4.1:** Create a `packages/test-utils` package for shared testing helpers and fixtures.
- **Task 4.2:** Update the CI workflow (`.github/workflows/ci.yml`) to be package-aware (e.g., using `turbo` or similar tools to run tests only on affected packages).
- **Task 4.3:** Add a CI step to validate Prisma migrations against an ephemeral database.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Broken Builds** | Medium | Medium | Implement changes incrementally (milestone by milestone) and run tests at each stage. Ensure local development setup is fully functional before merging. |
| **Complex TS/Build Config** | Medium | Medium | Start with simple path mapping in `tsconfig.json`. Use a well-documented tool like Turborepo to manage monorepo build dependencies. |
| **Increased Local Setup Complexity** | Low | Low | Create simple, high-level scripts in the root `package.json` (e.g., `npm run dev`) to abstract away the complexity of running multiple packages. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Follow the Plan:** Execute the implementation plan milestone by milestone. Do not skip steps.
2.  **Verify Each Step:** After each milestone, run the relevant tests (`lint`, `test`, `build`) to ensure the project is in a working state.
3.  **Backend and Structure First:** Focus on creating the new package structure, moving files, and updating backend configurations.
4.  **Update Frontend Consumers:** Once the shared packages (`shared-types`, `sdk`) are in place, update the `web` package to consume them.
5.  **CI Last:** The final step is to update the CI pipeline to reflect the new, more efficient package-aware structure.

### Communication Preferences
- Announce the start and completion of each milestone.
- If a step fails or a configuration becomes overly complex, pause and describe the issue before proceeding.
- I will provide the code for each step. Await confirmation before proceeding to the next.
