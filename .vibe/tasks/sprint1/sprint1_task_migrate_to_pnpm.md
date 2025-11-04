# AI Task: Migrate from NPM to PNPM

> **Purpose**: This document outlines the plan to fully migrate the Rewards Bolivia monorepo from `npm` to `pnpm`, ensuring a consistent and efficient development environment.

---

## 1. Task Overview

### Task Title
**Title:** Complete Migration from NPM to PNPM for Better Monorepo Support

### Goal Statement
**Goal:** To finalize the project's package management migration from `npm` to `pnpm`. This will resolve Docker build issues related to workspace dependencies, streamline the CI/CD pipeline, and improve local development efficiency.

---

## 2. Strategic Analysis & Solution Options

> **AI Agent Note:** Strategic analysis is not required. The decision to use `pnpm` has been made based on its superior monorepo handling and ability to resolve known issues with `npm` in Dockerized environments. This task is the direct implementation of that decision.

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
```

### Current State
The project is in a partially migrated state. The root `package.json` specifies `pnpm` as the package manager, and the `Dockerfile.dev` files for the `api` and `web` services use `pnpm` commands. However, the CI workflow (`.github/workflows/ci.yml`) and the scripts in the root `package.json` still use `npm`. A `pnpm-lock.yaml` file is missing, which is crucial for consistent dependency installation.

---

## 4. Feature Definition

### Problem Statement
The inconsistent package manager usage is causing several problems:
1.  Local development and CI/CD workflows are unreliable.
2.  The `EUNSUPPORTEDPROTOCOL` error during Docker builds persists because the environment is not fully configured for `pnpm`.
3.  Developers might use `npm` and `pnpm` interchangeably, leading to lockfile conflicts and "works on my machine" issues.

### Success Criteria (MVP)
- [ ] All project dependencies are managed by a single `pnpm-lock.yaml` file in the root directory.
- [ ] `pnpm install` runs successfully from the monorepo root.
- [ ] `docker-compose -f infra/local/docker-compose.yml up --build` completes successfully for all services without errors.
- [ ] The CI pipeline defined in `.github/workflows/ci.yml` executes successfully using `pnpm`.
- [ ] All scripts in the root `package.json` are updated to use `pnpm`.

---

## 5. Implementation Plan & Tasks

### Milestone 1: Complete PNPM Migration
- **Task 1.1:** Remove any existing `package-lock.json` file to prevent conflicts.
- **Task 1.2:** Run `pnpm import` to generate a `pnpm-lock.yaml` file from `npm`'s dependency metadata.
- **Task 1.3:** Run `pnpm install` to confirm that all dependencies are installed correctly.
- **Task 1.4:** Update the scripts in the root `package.json` to use `pnpm` instead of `npm`.
- **Task 1.5:** Update the `.github/workflows/ci.yml` file to use `pnpm` for installing dependencies and running scripts.
- **Task 1.6:** Review and confirm that `packages/api/Dockerfile.dev` and `packages/web/Dockerfile.dev` are correctly configured for `pnpm`.

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Script Failures** | Low | Medium | Some scripts might have subtle dependencies on `npm`'s behavior. All scripts will be tested manually after the migration to ensure they work as expected with `pnpm`. |
| **CI/CD Issues** | Low | Medium | The CI environment needs to be configured correctly for `pnpm`. The workflow will be updated to use the `pnpm/action-setup` GitHub Action for caching and installation, which is the standard practice. |

---

## 7. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Analyze & Plan:** Start by reading this entire plan.
2.  **Execute Migration:** Follow the tasks outlined in Milestone 1 sequentially.
3.  **Verify:** After each major change (e.g., updating CI, updating scripts), verify that the changes work as expected.
4.  **Final Build:** The final verification will be to run the Docker build and the CI pipeline to ensure everything is working correctly.

### Communication Preferences
- Announce the completion of each task in the implementation plan.
- If an unexpected error occurs, report it immediately for analysis.
