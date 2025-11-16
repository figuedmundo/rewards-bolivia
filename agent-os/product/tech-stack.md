# Tech Stack

## Framework & Runtime

- **Backend Framework:** NestJS 10.x - Enterprise-grade Node.js framework with built-in dependency injection, modularity, and TypeScript support. Chosen for its alignment with Domain-Driven Design principles and clean architecture patterns.
- **Language/Runtime:** TypeScript 5.x on Node.js 18.x - Type safety reduces runtime errors and improves developer experience. Node.js provides excellent performance for I/O-heavy operations like point transactions.
- **Package Manager:** pnpm 8.x with workspaces - Faster than npm/yarn, efficient disk usage through hard linking, and excellent monorepo support for managing multiple packages.

## Frontend

- **JavaScript Framework:** React 18.x with Vite 5.x - React provides component reusability and strong ecosystem. Vite offers instant hot module replacement and optimized production builds (3-5x faster than Create React App).
- **CSS Framework:** Tailwind CSS 3.x - Utility-first approach enables rapid UI development with consistent design tokens. Reduces CSS bundle size through PurgeCSS integration.
- **UI Components:** shadcn/ui - Radix UI primitives with Tailwind styling, providing accessible components that are owned by the codebase (not npm dependencies). Enables full customization while maintaining accessibility standards.
- **State Management:** TanStack Query (React Query) v5 - Powerful data fetching and caching solution reducing boilerplate by 70%. Handles server state synchronization, optimistic updates, and background refetching automatically.
- **Routing:** React Router v6 - Industry-standard routing solution with nested routes and protected route support.

## Database & Storage

- **Database:** PostgreSQL 15.x - ACID-compliant relational database ideal for financial transactions. Provides strong consistency guarantees and powerful JSON support for flexible schemas.
- **ORM/Query Builder:** Prisma 5.x - Type-safe database client with excellent migration tools and introspection. Generates TypeScript types from schema, eliminating type mismatches. Superior developer experience compared to TypeORM.
- **Caching:** Redis 7.x - In-memory data store used for balance caching (70% load reduction), session management, and BullMQ job queues. Sub-millisecond read/write performance.
- **Job Queue:** BullMQ - Redis-based queue for background jobs (daily hash generation, emission rate checks). Provides retry logic, job prioritization, and concurrency control.

## Blockchain Integration

- **Blockchain Network:** Polygon (Matic) - Layer 2 Ethereum scaling solution with low gas fees ($0.01 per transaction) and fast finality (2-3 seconds). Ideal for high-frequency audit hash anchoring.
- **Smart Contract Language:** Solidity (planned) - Industry-standard language for Ethereum-compatible chains.
- **Web3 Library:** ethers.js (planned) - Lightweight library for blockchain interactions with excellent TypeScript support.

## Testing & Quality

- **Backend Test Framework:** Jest 29.x with Supertest - Comprehensive testing framework with excellent NestJS integration. Supertest enables HTTP endpoint testing without server startup.
- **Frontend Test Framework:** Vitest - Vite-native test runner with Jest-compatible API. 10x faster than Jest for unit tests due to native ESM support.
- **E2E Testing:** Playwright 1.x - Multi-browser automation (Chromium, Firefox, WebKit) with parallel execution. Provides video recording and screenshot capabilities for CI debugging.
- **Load Testing:** k6 - Modern load testing tool with JavaScript DSL. Targets: 100 req/s @ sub-200ms p95 latency for transaction endpoints.
- **Linting:** ESLint 8.x with TypeScript plugin - Enforces code quality standards and catches common errors. Configured with Airbnb base + custom rules for NestJS.
- **Formatting:** Prettier 3.x - Opinionated code formatter ensuring consistent style across team. Integrated with lint-staged for pre-commit formatting.
- **Git Hooks:** Husky + lint-staged - Pre-commit hooks run linting and formatting on staged files only, keeping commits fast (<5 seconds).
- **Commit Convention:** Commitlint with Conventional Commits - Enforces semantic commit messages (feat/fix/docs/refactor). Enables automated changelog generation.

## Deployment & Infrastructure

- **Containerization:** Docker 24.x with multi-stage builds - Consistent environments from dev to prod. Multi-stage builds reduce image size by 60% (production images ~200MB).
- **Orchestration:** Docker Compose for local/staging - Simple orchestration for development. Defines services (API, Web, Postgres, Redis) with volume mounts for persistence.
- **CI/CD:** GitHub Actions - Automated workflows for testing, building, and deploying on push/PR. Includes parallel job execution (linting, unit tests, E2E tests).
- **Container Registry:** Docker Hub (public registry) - Stores production-ready images with semantic versioning tags.
- **Hosting:** Self-hosted (home_lab server) - SSH-based deployment to dedicated server. Future migration to cloud (AWS/GCP) planned for scale.
- **Environment Management:** dotenv - Loads environment variables from .env files. Separate configs for development, staging, and production.

## Third-Party Services

- **Authentication:** Passport.js with JWT strategy + Google OAuth2 - Modular authentication middleware for NestJS. Supports local strategy (bcrypt password hashing) and social login.
- **Email:** (Planned) SendGrid or Postmark - Transactional email service for notifications (point expiration warnings, admin alerts).
- **Monitoring:** (Planned) Sentry for error tracking, Prometheus + Grafana for metrics - Real-time error reporting and performance monitoring.
- **Code Coverage:** Codecov - Automated coverage reports in CI/CD with PR comments showing coverage changes.

## Architecture Patterns

- **Monorepo Structure:** pnpm workspaces with packages:
  - `packages/api` - NestJS backend
  - `packages/web` - React frontend
  - `packages/sdk` - TypeScript client generated from OpenAPI (typescript-axios generator)
  - `packages/shared-types` - Shared DTOs and domain types
  - `packages/libs/logger` - Shared logging utilities
  - `packages/worker` - BullMQ background job processor
  - `packages/test-utils` - Shared test fixtures and helpers
  - `e2e` - End-to-end Playwright tests

- **Backend Architecture:** Modular Monolith with Domain-Driven Design (DDD) and Clean Architecture
  - **Domain Layer:** Business entities, repository interfaces, domain events (no framework dependencies)
  - **Application Layer:** Use cases (e.g., `create-transaction.use-case.ts`), application services, event subscribers
  - **Infrastructure Layer:** Controllers (NestJS), repository implementations (Prisma), external service adapters

- **Dependency Injection:** NestJS DI container with string tokens for repositories (e.g., `'ITransactionRepository'`). Enables easy mocking in tests and swapping implementations.

- **Event-Driven Design:** NestJS EventEmitter2 for domain events (e.g., `TransactionCompletedEvent`). Decouples modules - transactions module emits events consumed by ledger and economic control modules.

## Naming Conventions

- **Files:** kebab-case with type suffix
  - Use cases: `create-user.use-case.ts`
  - Controllers: `auth.controller.ts`
  - Entities: `user.entity.ts`
  - Services: `ledger-hash.service.ts`

- **Classes:** PascalCase with suffix
  - Services: `AuthService`, `EconomicControlService`
  - Controllers: `TransactionsController`
  - Guards: `JwtAuthGuard`, `RolesGuard`
  - Entities: `User`, `Transaction`

- **Interfaces:** PascalCase with `I` prefix
  - Repository interfaces: `IUserRepository`, `ITransactionRepository`
  - DTOs: `CreateTransactionDto`, `LoginDto`

- **Methods/Variables:** camelCase
  - Methods: `createTransaction()`, `validateBalance()`
  - Variables: `pointBalance`, `transactionId`

## Performance Targets

- **API Latency:** p95 < 200ms for transaction endpoints, p99 < 500ms
- **Throughput:** 100 req/s sustained load without degradation
- **Database Queries:** < 50ms p95 for single-table queries, < 100ms for joins
- **Cache Hit Rate:** > 80% for balance queries
- **Test Suite Runtime:** < 5 minutes for full CI/CD pipeline
- **Build Time:** < 2 minutes for production builds

## Security Practices

- **Authentication:** JWT with 15-minute access tokens, 30-day refresh tokens stored in HttpOnly cookies
- **Password Hashing:** bcrypt with 10 rounds (industry standard)
- **Input Validation:** class-validator on all DTOs with global ValidationPipe
- **SQL Injection Protection:** Prisma parameterized queries (ORM-level protection)
- **CORS:** Configured for specific origins (not wildcard in production)
- **Rate Limiting:** (Planned) Redis-backed rate limiting by IP and user ID
- **Secrets Management:** Environment variables, never committed to git (.env in .gitignore)
