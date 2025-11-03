# AI Task Template: Rewards Bolivia Feature Development

> **Purpose**: This template provides a systematic framework for planning and executing new features for the Rewards Bolivia project. It ensures consistency, quality, and alignment with the project's architectural and product goals.

---

## 1. Task Overview

### Task Title
**Title:** Fix Docker Build for API Service in Monorepo

### Goal Statement
**Goal:** To enable the `api` service to be built and run successfully via `docker-compose`, by resolving the workspace dependency issues within the Docker build process.

---

## 2. Strategic Analysis & Solution Options

> **AI Agent Note:** Strategic analysis is not required for this task as a clear and correct implementation path has been identified.

---

## 3. Project Context & Current State

### Technology Stack & Architecture
This task will be executed within the established Rewards Bolivia technical environment.

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
Key Architectural Patterns:
  - Modular Monolith
  - Hybrid Off-chain/On-chain (Proof-of-Audit)
```

### Current State
The `api` service fails to build in Docker due to `npm` being unable to resolve local workspace packages (`@rewards-bolivia/logger`, `@rewards-bolivia/shared-types`). The `workspace:*` protocol is not being handled correctly in the current Docker build setup.

---

## 4. Feature Definition

### Problem Statement
The Docker build for the `api` service is failing because it's not correctly set up to handle the monorepo's workspace structure. This prevents local development using Docker, as the containerized `api` service cannot access its internal dependencies from other packages in the monorepo.

### Success Criteria (MVP)
- [ ] `docker-compose -f infra/local/docker-compose.yml up --build` completes successfully for the `api` service.
- [ ] The `api` service starts correctly within its Docker container.
- [ ] The running `api` service can resolve its internal dependencies on `@rewards-bolivia/logger` and `@rewards-bolivia/shared-types` without runtime errors.

---

## 5. Technical Requirements

### Functional Requirements
- The `api` service's Docker build process must be updated to correctly handle the monorepo workspace structure.
- The Docker image for the `api` service must contain all necessary code and built artifacts from its workspace dependencies.

### Non-Functional Requirements
- **Developer Experience:** The process of building and running the `api` service via Docker should be reliable and reflect the local development environment.

---

## 6. Data & Database Changes

None.

---

## 7. API & Backend Changes

No changes to the API or backend logic are required. The changes are confined to the build process.

---

## 8. Frontend Changes

None.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Fix API Docker Build
- **Task 1.1:** Verify that the root `package.json` correctly defines all workspaces (`packages/*`, `libs/*`, `shared-types`).
- **Task 1.2:** Update `packages/api/Dockerfile.dev` to ensure the Docker build context is the monorepo root.
- **Task 1.3:** Modify `packages/api/Dockerfile.dev` to copy all necessary source code from the monorepo (`packages`, `libs`, `shared-types`, etc.).
- **Task 1.4:** In `packages/api/Dockerfile.dev`, ensure `npm install` is run from the monorepo root to correctly link workspace packages.
- **Task 1.5:** Add steps to `packages/api/Dockerfile.dev` to explicitly build the necessary workspace dependencies (`@rewards-bolivia/logger`, `@rewards-bolivia/shared-types`) before building and running the `api` package.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Incorrect Docker Context** | Low | Medium | The `docker-compose.yml` file already sets the build context to the monorepo root. The main risk is ensuring the Dockerfile correctly copies files from this context. This will be mitigated by careful implementation and testing of the Dockerfile changes. |
| **Build Order Issues** | Low | Medium | Explicitly building workspace dependencies in the Dockerfile in the correct order will mitigate any issues with dependency resolution during the build process. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Analyze & Plan:** Start by reading this entire plan.
2.  **Verify Workspaces:** Confirm that the root `package.json` is correctly configured for all workspaces.
3.  **Update Dockerfile:** Modify `packages/api/Dockerfile.dev` according to the implementation plan.
4.  **Build & Verify:** After applying the changes, the final verification will be to run the Docker build and confirm that the `api` service starts successfully.

### Communication Preferences
- Announce the completion of each major task.
- If an unexpected build error occurs, stop and report the error for further analysis.
