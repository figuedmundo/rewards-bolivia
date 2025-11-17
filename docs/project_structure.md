
# Project Structure

This document provides a high-level overview of the monorepo's structure, highlighting key files and directories.

```
/
├── .github/                # Contains GitHub Actions workflows for CI/CD.
│   └── workflows/
│       └── ci.yml          # Defines the continuous integration pipeline.
├── .husky/                 # Holds Git hooks for enforcing code quality.
│   ├── commit-msg          # Hook to lint commit messages.
│   └── pre-commit          # Hook to run linting and formatting before commits.
├── agent-os/               # Agent-OS configuration and AI-friendly documentation.
│   ├── config.yml          # Configuration for AI agents and workflows.
│   ├── product/            # Product documentation for AI context.
│   │   ├── mission.md      # Product mission and vision.
│   │   ├── roadmap.md      # Product roadmap and milestones.
│   │   └── tech-stack.md   # Technical stack decisions and rationale.
│   └── standards/          # Coding standards and conventions.
│       ├── backend/        # Backend-specific standards (NestJS, DDD, etc.).
│       ├── frontend/       # Frontend standards (React, Tailwind, etc.).
│       ├── testing/        # Testing conventions and practices.
│       └── global/         # Cross-cutting standards (Git, documentation, etc.).
├── docs/                   # Houses all project documentation.
│   ├── ARCHITECTURE.md     # Describes the high-level software architecture.
│   ├── DB_MIGRATIONS.md    # Instructions and guidelines for database migrations.
│   ├── TESTING.md          # Comprehensive testing strategy and guidelines.
│   ├── TSDR.md             # Technical System Design Reference.
│   ├── project_structure.md# This file, outlining the project layout.
│   ├── api/                # API-specific documentation.
│   │   └── ledger-endpoints.md # Ledger and audit API documentation.
│   ├── Rewards_Bolivia/    # Product and business documentation.
│   │   └── the_rewards_bolivia/ # Detailed product specs, economics, flows.
│   ├── RUNBOOKS/           # Operational procedures and guides.
│   └── ...
├── e2e/                    # Contains end-to-end tests for the application.
│   ├── package.json        # Defines dependencies and scripts for E2E tests.
│   ├── playwright.config.ts# Configuration file for the Playwright test framework.
│   └── user-journey.spec.ts# An example test suite for a user journey.
├── infra/                  # Infrastructure as Code (IaC) for different environments.
│   ├── local/              # Configuration for the local development environment.
│   │   └── docker-compose.yml # Docker Compose file to run local services (DB, cache, etc.).
│   └── prod/               # Configuration for the production environment.
├── packages/               # Contains the source code for all applications and shared libraries.
│   ├── api/                # The NestJS backend application (modular monolith).
│   │   ├── prisma/
│   │   │   └── schema.prisma # The Prisma schema defining the database models.
│   │   ├── src/
│   │   │   ├── main.ts       # The main entry point for the API application.
│   │   │   ├── app.module.ts # The root module of the NestJS application.
│   │   │   └── modules/      # Houses the different feature modules.
│   │   │       ├── auth/     # Authentication module (JWT, Google OAuth).
│   │   │       ├── users/    # User management module.
│   │   │       └── transactions/ # Transaction and ledger module.
│   │   │           ├── domain/        # Business logic, entities, repositories.
│   │   │           ├── application/   # Use cases, services, jobs.
│   │   │           └── infrastructure/# Controllers, Prisma repositories.
│   │   ├── Dockerfile.dev    # Dockerfile for building the development image of the API.
│   │   ├── package.json      # API-specific dependencies and scripts.
│   │   └── ...
│   ├── web/                # The React frontend application (dashboard with Wallet UI).
│   │   ├── src/
│   │   │   ├── main.tsx      # The main entry point for the React application.
│   │   │   ├── App.tsx       # The root component of the React application.
│   │   │   ├── pages/        # Page-level components.
│   │   │   ├── components/   # Reusable UI components.
│   │   │   │   ├── ui/       # shadcn/ui components.
│   │   │   │   └── wallet/   # Wallet-specific components (Balance, History).
│   │   │   ├── hooks/        # Custom React hooks (useWallet, useAuth, etc.).
│   │   │   ├── lib/          # Utilities and API clients.
│   │   │   │   ├── api.ts    # Base API service.
│   │   │   │   └── wallet-api.ts # Wallet API using generated SDK.
│   │   │   └── contexts/     # React Context providers.
│   │   ├── Dockerfile.dev    # Dockerfile for building the development image of the web app.
│   │   ├── package.json      # Web app-specific dependencies and scripts.
│   │   └── vite.config.ts    # Configuration file for Vite (with SDK optimizeDeps).
│   ├── worker/             # The background job processor (BullMQ/Redis).
│   │   ├── src/
│   │   │   └── worker.ts     # The main entry point for the worker.
│   │   └── package.json      # Worker-specific dependencies and scripts.
│   ├── libs/               # Shared libraries used across different packages.
│   │   ├── auth/           # Library for authentication-related utilities.
│   │   ├── logger/         # A shared logging library.
│   │   └── utils/          # Common utility functions.
│   ├── sdk/                # Auto-generated TypeScript-Axios API client.
│   │   ├── index.ts        # Main export file.
│   │   ├── api.ts          # Generated API classes (UsersApi, TransactionsApi, LedgerApi).
│   │   ├── configuration.ts# SDK configuration.
│   │   └── package.json    # SDK package configuration.
│   ├── shared-types/       # Holds shared TypeScript types and DTOs.
│   │   ├── src/
│   │   │   ├── auth/       # Auth-related DTOs.
│   │   │   ├── user/       # User-related DTOs.
│   │   │   └── transactions/ # Transaction and ledger DTOs.
│   │   └── package.json    # Shared types package configuration.
│   ├── test-utils/         # Test utilities and fixtures.
│   │   └── src/
│   │       └── factories/  # Test data factories.
│   └── infra-scripts/      # Infrastructure utility scripts.
├── .env.example            # An example file for environment variables.
├── .gitignore              # Specifies files and directories to be ignored by Git.
├── package.json            # The root package.json for the monorepo.
├── pnpm-lock.yaml          # The lockfile for pnpm, ensuring consistent dependency installation.
├── pnpm-workspace.yaml     # Defines the workspaces within the pnpm monorepo.
└── README.md               # The main README file for the project.
```
