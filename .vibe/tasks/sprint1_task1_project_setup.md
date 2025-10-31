# AI Task: Sprint 1 - Initial Project Setup & Monorepo Configuration

> **Purpose**: This document outlines the plan for the first foundational task of Sprint 1: establishing the project's monorepo structure and local development environment.

---

## 1. Task Overview

### Task Title
**Title:** Sprint 1: Initial Project Setup & Monorepo Configuration

### Goal Statement
**Goal:** To establish the foundational monorepo structure for the Rewards Bolivia project, including package setup for the API and web dashboard, and a basic Docker Compose configuration for local development. This will ensure a consistent and reproducible environment for all developers.

---

## 2. Strategic Analysis & Solution Options

> **AI Agent Note:** Strategic analysis is skipped for this task. The implementation path is a direct execution of the architectural decisions already defined in the Tech Stack Decision Record (TSDR), which specifies a Modular Monolith within a monorepo and a Docker-based local environment.

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
The project currently consists of documentation and planning files. There is no application code, repository structure, or local development environment yet.

---

## 4. Feature Definition

### Problem Statement
To begin development, the team needs a standardized and reproducible project structure. Without a monorepo and a containerized environment, managing dependencies and ensuring consistency across different developer machines would be difficult and inefficient.

### Success Criteria (MVP)
- [ ] A monorepo is initialized (e.g., using pnpm workspaces).
- [ ] Placeholder packages for `api` (NestJS) and `web` (React/Vite) are created within the monorepo.
- [ ] A `docker-compose.yml` file is created at the root.
- [ ] The Docker Compose setup can successfully start a PostgreSQL and a Redis service.
- [ ] Basic configuration files (`.gitignore`, `.editorconfig`) are added.

---

## 5. Technical Requirements

### Functional Requirements
- A developer can run `pnpm install` at the root to install all dependencies for all packages.
- A developer can run `docker-compose up` to start the required database and cache services.

### Non-Functional Requirements
- **Portability:** The setup must be cross-platform (work on macOS, Windows, Linux).
- **Performance:** The local environment startup time via Docker Compose should be less than 60 seconds.

---

## 6. Data & Database Changes

No schema changes are part of this task. The focus is on creating and running the database service itself. A default database will be created by the Docker service.

---

## 7. API & Backend Changes

No API changes. A placeholder NestJS application will be created via its CLI, but no custom endpoints will be added in this task.

---

## 8. Frontend Changes

No UI changes. A placeholder React/Vite application will be created via its CLI.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Monorepo and Package Setup
- **Task 1.1:** Initialize a pnpm workspace at the project root by creating a `pnpm-workspace.yaml` file.
- **Task 1.2:** Create a `packages` directory to house the applications.
- **Task 1.3:** Inside `packages`, scaffold a new NestJS application named `api`.
- **Task 1.4:** Inside `packages`, scaffold a new React + Vite (TypeScript) application named `web`.

### Milestone 2: Docker & Environment Setup
- **Task 2.1:** Create a `docker-compose.yml` file at the root.
- **Task 2.2:** Define services for `postgres` and `redis` in the `docker-compose.yml` file. Configure them with persistent volumes to retain data across restarts.
- **Task 2.3:** Create a `.env.example` file at the root, documenting the environment variables needed for the Docker services (e.g., `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`).
- **Task 2.4:** Create a root `.gitignore` file with common ignores for Node.js, Docker, IDEs, and OS-specific files.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| Inconsistent developer environments | Medium | Medium | Using Docker Compose is the primary mitigation. Clear, tested setup instructions in the main README.md will be essential to ensure all developers can get started smoothly. |
| Dependency conflicts between packages | Low | Medium | pnpm workspaces are designed to handle this well by hoisting common dependencies and linking packages correctly. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Monorepo First:** Set up the pnpm workspace and scaffold the `api` and `web` packages.
2.  **Docker Environment:** Create the `docker-compose.yml` and associated `.env.example` file.
3.  **Gitignore:** Create the `.gitignore` file.
4.  **Verification:** Run `docker-compose up -d` to confirm the services start without errors.

### Communication Preferences
- Announce when the monorepo structure is in place.
- Announce when the Docker environment is ready to be tested.
- Confirm once all tasks are complete and the foundation is ready for the next developer to build upon.
