# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rewards Bolivia is a modern loyalty and rewards platform built as a **monorepo** using **pnpm workspaces**. The project follows a **Modular Monolith** architecture with Domain-Driven Design (DDD) principles and Clean Architecture patterns.

Key characteristics:
- **Hybrid on-chain/off-chain model**: Combines database speed with blockchain auditability
- **Target performance**: Sub-1.5-second point redemptions
- **Tech stack**: NestJS (backend), React (frontend), Prisma (ORM), PostgreSQL, Redis, Polygon blockchain

## Essential Commands

### Development Setup

```bash
# Install dependencies
pnpm install

# Start infrastructure only (PostgreSQL + Redis)
docker-compose -f infra/local/docker-compose.yml up -d postgres redis

# Run database migrations
pnpm --filter api exec prisma migrate dev

# Start services individually (preferred for local dev)
pnpm --filter api start:dev          # API on port 3001
pnpm --filter web dev                 # Web app on port 5173
pnpm --filter @rewards-bolivia/worker dev  # Background worker
```

### Testing

```bash
# Run all tests
pnpm test

# Test specific packages
pnpm --filter api test
pnpm --filter web test

# Run tests with coverage
pnpm run --filter=web test -- --coverage

# API tests require database setup
pnpm test:api:local  # Automated: starts DB, runs migrations, tests, cleanup

# E2E tests
pnpm --filter e2e test
pnpm --filter e2e test:ui  # Playwright UI
```

### Building and Linting

```bash
# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Generate SDK from API OpenAPI spec
pnpm generate:sdk
```

### Database Operations

```bash
# Generate Prisma Client
pnpm --filter api exec prisma generate

# Create new migration
pnpm --filter api exec prisma migrate dev --name <migration_name>

# View database in Prisma Studio
pnpm --filter api exec prisma studio
```

## Architecture

### Backend (packages/api)

The API follows **DDD and Clean Architecture** with strict layer separation:

```
packages/api/src/modules/<module-name>/
├── domain/                    # Business logic, entities, repositories (interfaces)
│   ├── entities/
│   ├── repositories/
│   └── events/
├── application/              # Use cases, application services, subscribers
│   ├── *.use-case.ts
│   ├── services/
│   └── subscribers/
└── infrastructure/           # Technical implementation
    ├── controllers/
    └── repositories/         # Prisma implementations
```

**Important patterns**:
- **Repository pattern**: Domain defines interfaces (e.g., `ITransactionRepository`), infrastructure provides implementations (e.g., `PrismaTransactionRepository`)
- **Dependency injection**: Repositories injected using string tokens (e.g., `'ITransactionRepository'`)
- **Event-driven**: Uses NestJS `EventEmitter` for domain events (e.g., `TransactionCompletedEvent`)
- **Use cases**: Application logic lives in `*.use-case.ts` files, orchestrating domain logic and repositories

**Current modules**:
- `auth`: Authentication (JWT, Google OAuth)
- `users`: User management
- `transactions`: Points earning/redemption with economic controls
- `app`: Root module and health checks

### Frontend (packages/web)

React application built with Vite, Tailwind CSS, and shadcn/ui components:

```
packages/web/src/
├── components/
│   ├── ui/              # Generic components (shadcn/ui)
│   └── [feature]/       # Feature-specific components
├── pages/               # Route pages
├── hooks/               # Custom React hooks
├── contexts/            # React Context for state
└── lib/                 # Utilities and API client
```

### Shared Packages

- **`packages/shared-types`**: Shared DTOs and types organized by domain (auth, user, transactions)
- **`packages/libs/logger`**: Shared logging utilities
- **`packages/test-utils`**: Shared test fixtures and helpers
- **`packages/worker`**: Background job processor (BullMQ/Redis)

## Key Conventions

### Naming

- **Files**: `kebab-case` with type suffix: `create-user.use-case.ts`, `auth.controller.ts`, `user.entity.ts`
- **Classes**: `PascalCase` with suffix: `AuthService`, `UsersController`, `JwtAuthGuard`
- **Methods/Variables**: `camelCase`
- **Interfaces**: `PascalCase` with `I` prefix: `IUserRepository`, `ITransactionRepository`

### Testing

- **Unit tests**: `.spec.ts` suffix, colocated with source files
- **Integration tests**: `*.integration.spec.ts` in `test/integration/` directories
- **E2E tests**: `*.e2e-spec.ts` in `test/e2e/` or top-level `e2e/` directory
- **Coverage target**: 70% baseline, 90%+ for critical modules (auth, transactions)
- **Test structure**: Use Arrange-Act-Assert pattern

### Module Structure Pattern

When creating new modules in the API:

1. Define domain entities and repository interfaces in `domain/`
2. Implement use cases in `application/`
3. Implement infrastructure (controllers, Prisma repositories) in `infrastructure/`
4. Register providers in module using DI tokens for repositories
5. Create corresponding tests (.spec.ts files)

### Git Workflow

- **Commit messages**: Follow Conventional Commits (enforced by commitlint)
- **Pre-commit hooks**: Auto-run lint-staged (ESLint + Prettier)
- **Branch naming**: Use feature branches (e.g., `feat/transactions-module`)

## Database Schema

Key models (Prisma):
- **User**: Users with point balances, supports OAuth (Google) and local auth
- **Business**: Business accounts with point balances, owned by users
- **Transaction**: Point transactions (EARN/REDEEM/ADJUSTMENT/BURN) between users and businesses
- **PointLedger**: Immutable ledger entries tracking all point movements with balance snapshots
- **RefreshToken**: JWT refresh token management
- **EconomicAlert**: System alerts for economic anomalies

**Important**: The ledger is the source of truth for point balances. Transactions create corresponding PointLedger entries.

## Economic Control System

The transactions module includes an `EconomicControlService` that:
- Monitors real-time economic metrics (total supply, circulation ratio, burn rate)
- Validates transactions against economic health thresholds
- Publishes alerts when metrics are concerning
- Prevents transactions during critical economic states

When working on transactions, always consider economic impact and ensure proper ledger entries.

## Ledger & Audit System

The project implements a **dual-level hashing strategy** for comprehensive audit coverage:

### Per-Transaction Hashing (Epic 6)

Every `PointLedger` entry has a SHA256 hash stored in the `hash` field:

- **Hash Format:** `SHA256(id|type|accountId|debit|credit|balanceAfter|transactionId|createdAt)`
- **Computation:** Automatic during ledger entry creation via `LedgerCreationHelper`
- **Purpose:** Enable real-time verification and instant proof-of-entry
- **Verification:** Via `GET /ledger/entries/:id/verify` endpoint
- **Implementation:** [LedgerHashService](packages/api/src/modules/transactions/application/services/ledger-services/ledger-hash.service.ts)

### Daily Batch Hashing (Epic 5)

All ledger entries for a given day are aggregated into a single hash:

- **Timing:** Generated automatically at 3 AM UTC via `GenerateDailyAuditHashJob`
- **Storage:** `DailyAuditHash` table
- **Purpose:** Enable blockchain anchoring (gas-efficient) and compliance audits
- **Implementation:** [AuditHashService](packages/api/src/modules/transactions/application/services/ledger-services/audit-hash.service.ts)

### API Endpoints

**Granular Ledger Queries (User-Scoped):**
- `GET /api/ledger/entries` - Query entries by account/transaction/date range
- `GET /api/ledger/entries/:id` - Get single entry with hash
- `GET /api/ledger/entries/:id/verify` - Verify entry integrity

**Daily Audit Operations (Admin-Only):**
- `GET /api/admin/audit/hash/:date` - Get daily hash
- `GET /api/admin/audit/verify/:date` - Verify daily hash
- `POST /api/admin/audit/generate/:date` - Manual hash generation
- `GET /api/admin/audit/hashes` - List recent daily hashes

### Module Organization

```
packages/api/src/modules/transactions/
├── application/
│   ├── services/
│   │   └── ledger-services/
│   │       ├── audit-hash.service.ts (daily batch hashing)
│   │       ├── ledger-hash.service.ts (per-transaction hashing)
│   │       └── ledger-creation.helper.ts (hash-aware creation)
│   └── jobs/
│       ├── generate-daily-audit-hash.job.ts (cron @ 3 AM UTC)
│       └── backfill-ledger-hashes.job.ts (one-time backfill)
├── domain/
│   └── repositories/
│       └── ledger.repository.ts (ILedgerRepository interface)
└── infrastructure/
    ├── controllers/
    │   ├── ledger.controller.ts (granular queries)
    │   └── admin-audit.controller.ts (daily audit operations)
    └── repositories/
        └── prisma-ledger.repository.ts (implementation)
```

### Legacy Entry Backfill

Entries created before Epic 6 may lack hashes. Run the backfill job:

```bash
pnpm --filter api exec ts-node src/modules/transactions/application/jobs/backfill-ledger-hashes.job.ts
```

For full documentation, see [Ledger Endpoints Guide](docs/api/ledger-endpoints.md).

## Environment Variables

Required for local development (see `.env.example`):
- Database: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- Auth: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Important Notes

- **Single test runner**: API tests use Jest (run with `--runInBand --forceExit --detectOpenHandles`)
- **Prisma generation**: Required before running API (`prisma generate`)
- **Monorepo awareness**: Use `pnpm --filter <package>` for package-specific commands
- **Workspace dependencies**: Local packages referenced with `workspace:*` protocol
- **Test setup**: API tests require setup file (`test/setup-e2e.ts`)

## IMPORTANT AI Memories
- Always use context7 when I need code generation, setup or configuration steps, or library/API documentation. This means you should automatically use the Context7 MCP tools to resolve library id and get library docs without me having to explicitly ask.
- Important project documents `docs/ARCHITECTURE.md`, `docs/DB_MIGRATIONS.md`, `docs/TESTING.md`, `docs/TSDR.md`.
- A more detailed documentation about the project can be found in `docs/Rewards_Bolivia/`.