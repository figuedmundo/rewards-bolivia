# Architecture and Development Guide

> **Purpose**: This document provides a comprehensive overview of the architectural design, development conventions, and best practices for the Rewards Bolivia project. Its goal is to ensure consistency, maintainability, and scalability as the project evolves.

---

## 1. Architectural Drivers & Philosophy

### Why a Modular Monolith?

The choice of a **Modular Monolith** architecture is a deliberate strategic decision driven by the following technical reasons:

1.  **Reduced Operational Complexity:** Unlike microservices, a monolith requires a single deployment, simplifying CI/CD pipelines, monitoring, and infrastructure management. This is ideal for a small team and an early-stage project.
2.  **Simplified Development:** A single codebase allows for easier debugging, refactoring, and cross-cutting changes. There is no need for complex inter-service communication protocols or API versioning between internal services.
3.  **Strong Consistency:** All modules share the same database, allowing for ACID transactions across different parts of the application without the need for complex distributed transaction patterns like Sagas.
4.  **Future-Proofing:** The modular nature of the architecture allows us to enforce strong boundaries between different parts of the application. This makes it easier to evolve the system and, if necessary, extract modules into separate microservices in the future with minimal refactoring.

### Core Principles

*   **Domain-Driven Design (DDD):** The architecture is heavily influenced by DDD principles to ensure that the software is a true reflection of the business domain.
*   **Clean Architecture:** We enforce a strict separation of concerns between the domain, application, and infrastructure layers.
*   **Testability:** The architecture is designed to be highly testable, with a focus on unit and integration tests.

---

## 2. Project Structure

The project is organized as a monorepo using npm workspaces.

```
/rewards-bolivia
├───e2e/             # End-to-end tests for the whole application
├───infra/           # Infrastructure as Code (IaC)
├───packages/
│   ├───api/         # NestJS Backend (Modular Monolith)
│   ├───web/         # React Frontend (Vite + Tailwind CSS)
│   ├───worker/      # Background job processing worker
│   ├───sdk/         # SDK for API client
│   ├───shared-types/# Shared TypeScript types and DTOs
│   ├───libs/        # Shared libraries (auth, logger, etc.)
│   ├───test-utils/  # Utilities for testing
│   └───infra-scripts/# Scripts for infrastructure management
├───.github/         # CI/CD Workflows
└───.vibe/           # Project documentation and tasks
```

### Backend (`packages/api`)

The backend is a NestJS application structured around DDD principles.

```
/packages/api/
├───prisma/                       # Prisma schema and migrations
└───src/
    ├───application/              # Application Logic (Use Cases, DTOs)
    ├───domain/                   # Domain Logic (Entities, Repositories, Domain Services)
    ├───infrastructure/           # Infrastructure (Controllers, Prisma Repositories, Gateways)
    ├───modules/                  # Feature modules (e.g., auth, users)
    ├───app.module.ts             # Root application module
    └───main.ts                   # Application entry point
```

### Frontend (`packages/web`)

The frontend is a React application built with Vite.

```
/packages/web/src/
├───components/                 # Reusable UI components
│   ├───ui/                     # Generic, unstyled components (e.g., from shadcn/ui)
│   └───[feature-name]/         # Components specific to a feature
├───contexts/                   # React Contexts for state management
├───hooks/                      # Custom React hooks
├───lib/                        # Utility functions and API client
├───pages/                      # Top-level page components
├───assets/                     # Static assets (images, fonts, etc.)
├───App.tsx
└───main.tsx
```

### Infrastructure (`infra`)

The `infra` folder contains all Infrastructure as Code (IaC) definitions. This includes:

*   **Docker Compose files:** For local development and production environments.
*   **Kubernetes manifests:** For deploying the application to a Kubernetes cluster.
*   **Terraform scripts:** For provisioning cloud infrastructure.

By keeping all IaC in a single place, we ensure that our infrastructure is version-controlled, reproducible, and easy to manage.

---


## 3. Layer Descriptions

*   **Domain Layer:** This is the core of the application. It contains the business logic, entities, and value objects. It is completely independent of any other layer and should not have any dependencies on external frameworks or libraries.
*   **Application Layer:** This layer orchestrates the execution of use cases. It uses the domain layer to perform business logic and the repository interfaces to persist data. It is responsible for handling transactions and coordinating with other services.
*   **Infrastructure Layer:** This layer contains the implementation details. It includes controllers, database repositories, and gateways to external services. It depends on the application and domain layers but not the other way around.

---

## 4. Naming Conventions

*   **Files:** `name.type.ts` (e.g., `create-user.use-case.ts`, `auth.controller.ts`, `user.entity.ts`). The `kebab-case` style is preferred for file names with multiple words, for example `jwt-auth.guard.ts`.
*   **Classes:** `PascalCase` with suffixes (e.g., `AuthService`, `UsersController`, `JwtAuthGuard`).
*   **Methods:** `camelCase` (e.g., `getUser`, `createTransaction`).
*   **Variables:** `camelCase` (e.g., `user`, `transactionAmount`).
*   **Interfaces:** `PascalCase` with the `I` prefix (e.g., `IUserRepository`).

---

## 5. Testing

For a detailed guide on our testing strategy, conventions, and best practices, please refer to the [Testing Documentation](./TESTING.md).

---

