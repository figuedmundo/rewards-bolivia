# Tech Stack

This document outlines the complete technical stack for Rewards Bolivia, including rationale for each technology choice.

## Framework & Runtime

### Backend Application Framework
- **Technology:** NestJS (Node.js + TypeScript)
- **Version:** Latest stable (v10+)
- **Rationale:** NestJS provides enterprise-grade architecture with built-in dependency injection, decorators for clean code, and excellent TypeScript support. Its modular structure aligns perfectly with our Domain-Driven Design approach. Strong ecosystem for authentication, validation, and API documentation.

### Language & Runtime
- **Technology:** TypeScript on Node.js
- **Node Version:** v20 LTS
- **TypeScript Version:** v5+
- **Rationale:** TypeScript provides type safety across the entire stack (frontend, backend, shared types). Node.js offers excellent performance for I/O-heavy operations like point transactions. LTS version ensures stability for production deployment.

### Package Manager
- **Technology:** pnpm
- **Version:** v8+
- **Rationale:** pnpm workspaces enable efficient monorepo management with hard-linked dependencies, saving disk space and installation time. Superior performance compared to npm/yarn. Built-in workspace protocol for local package dependencies.

## Frontend

### JavaScript Framework
- **Technology:** React
- **Version:** v18+
- **Build Tool:** Vite
- **Rationale:** React provides component-based architecture with massive ecosystem. Vite offers lightning-fast hot module replacement (HMR) and optimized production builds. JSX enables declarative UI development.

### State Management
- **Technology:** TanStack Query (React Query)
- **Version:** v5+
- **Rationale:** TanStack Query handles server state synchronization, caching, and background refetching automatically. Perfect for real-time wallet balance updates and transaction history. Reduces boilerplate compared to Redux.

### CSS Framework
- **Technology:** Tailwind CSS
- **Version:** v3+
- **Rationale:** Utility-first approach enables rapid UI development without context switching. Small production bundle size with PurgeCSS. Highly customizable with design tokens. Excellent developer experience.

### UI Components
- **Technology:** shadcn/ui
- **Rationale:** Provides beautifully designed, accessible components built on Radix UI primitives. Copy-paste approach means no additional bundle size - components live in your codebase. Full customization control. TypeScript native.

### Routing
- **Technology:** React Router
- **Version:** v6+
- **Rationale:** Industry standard for React routing with nested routes, lazy loading, and programmatic navigation. Type-safe route definitions.

## Database & Storage

### Primary Database
- **Technology:** PostgreSQL
- **Version:** v15+
- **Rationale:** ACID compliance essential for financial transactions. Advanced features like JSONB for flexible data, row-level security, and excellent performance. Open-source with strong community. Robust backup and replication options.

### ORM/Query Builder
- **Technology:** Prisma
- **Version:** v5+
- **Rationale:** Type-safe database client with auto-generated TypeScript types. Schema-first design with migration management. Excellent developer experience with Prisma Studio for database inspection. Built-in connection pooling.

### Caching & Queue
- **Technology:** Redis
- **Version:** v7+
- **Use Cases:** Session storage, API rate limiting, wallet balance caching, job queues (BullMQ)
- **Rationale:** In-memory data structure store provides sub-millisecond latency for frequently accessed data (wallet balances). Enables distributed rate limiting. Persistent queue storage for background jobs.

### Background Job Processing
- **Technology:** BullMQ
- **Version:** Latest stable
- **Rationale:** Redis-based queue system with advanced features (delayed jobs, job prioritization, retries, cron scheduling). Perfect for daily audit hash generation, point expiration, and alert processing. Built-in UI for monitoring.

## Blockchain & Web3

### Blockchain Network
- **Technology:** Polygon (Matic) - Proof of Stake
- **Rationale:** Low transaction fees (<$0.01) enable cost-effective daily hash anchoring. EVM-compatible allows standard Solidity contracts. Fast finality (~2 seconds). Strong ecosystem and infrastructure.

### Web3 Library
- **Technology:** ethers.js
- **Version:** v6+
- **Rationale:** Well-maintained, comprehensive Web3 library with excellent TypeScript support. Smaller bundle size than web3.js. Strong documentation and community.

## API & SDK

### API Documentation
- **Technology:** OpenAPI (Swagger)
- **Implementation:** @nestjs/swagger
- **Rationale:** Auto-generated API documentation from TypeScript decorators. Interactive API explorer for testing. OpenAPI spec serves as source of truth for SDK generation.

### API Client SDK
- **Technology:** TypeScript-Axios (openapi-generator)
- **Rationale:** Auto-generated type-safe client from OpenAPI spec ensures frontend-backend consistency. Axios provides interceptors for auth token injection. Eliminates manual API client maintenance.

### API Style
- **Technology:** RESTful HTTP/JSON
- **Rationale:** Simple, widely understood, excellent tooling. Suitable for CRUD operations on resources (users, transactions, ledger). Future consideration: GraphQL for complex queries.

## Testing & Quality

### Backend Testing
- **Framework:** Jest
- **Version:** v29+
- **Test Types:** Unit tests (.spec.ts), Integration tests (.integration.spec.ts)
- **Rationale:** Industry standard for Node.js testing. Built-in mocking, coverage reporting, and snapshot testing. Excellent TypeScript support.

### Frontend Testing
- **Framework:** Vitest
- **Version:** v1+
- **Component Testing:** @testing-library/react
- **Rationale:** Vite-native test runner with Jest-compatible API. Blazing fast with instant HMR. Testing Library encourages testing user behavior over implementation details.

### E2E Testing
- **Framework:** Playwright
- **Version:** v1.40+
- **Rationale:** Modern E2E testing with multi-browser support (Chromium, Firefox, WebKit). Built-in test runner, codegen, and trace viewer. Excellent debugging experience. Parallel test execution.

### Linting & Formatting
- **Linter:** ESLint
- **Formatter:** Prettier
- **Config:** Airbnb base + custom rules
- **Rationale:** ESLint catches code quality issues and enforces consistent patterns. Prettier ensures consistent formatting. Pre-commit hooks via Husky prevent bad code from entering the repo.

### Code Quality Tools
- **Pre-commit:** Husky + lint-staged
- **Commit Linting:** commitlint (Conventional Commits)
- **Rationale:** Automated quality checks reduce manual review burden. Conventional Commits enable automated changelog generation and semantic versioning.

## Deployment & Infrastructure

### Containerization
- **Technology:** Docker
- **Version:** Latest stable
- **Orchestration (Future):** Kubernetes
- **Rationale:** Docker ensures consistent environments across development, staging, and production. Multi-stage builds optimize image size. Docker Compose simplifies local development.

### CI/CD
- **Technology:** GitHub Actions
- **Rationale:** Native GitHub integration, free for public repos, generous free tier for private repos. YAML-based workflows enable version-controlled CI/CD. Parallel job execution. Rich marketplace of actions.

### Hosting (Planned)
- **API & Worker:** AWS ECS (Fargate) or Railway
- **Database:** AWS RDS (PostgreSQL) or Supabase
- **Redis:** AWS ElastiCache or Upstash
- **Frontend:** Vercel or Cloudflare Pages
- **Rationale:** AWS ECS provides scalable container hosting. Railway offers simpler deployment for MVP. Vercel excels at static site hosting with edge caching. Managed services reduce operational burden.

### Environment Management
- **Technology:** dotenv + env-schema validation
- **Validation Library:** @nestjs/config + Joi
- **Rationale:** Environment variables enable configuration without code changes. Schema validation ensures required vars are present at startup. Prevents runtime errors from misconfiguration.

## Monitoring & Observability

### Logging
- **Technology:** Custom logger service (shared library)
- **Format:** Structured JSON logs
- **Future:** Pino or Winston
- **Rationale:** Structured logs enable powerful querying in log aggregation tools. JSON format works seamlessly with CloudWatch, Datadog, or Grafana Loki.

### Error Tracking (Planned)
- **Technology:** Sentry
- **Rationale:** Automatic error capturing with source maps, release tracking, and user context. Excellent alerting and triage workflow. Free tier sufficient for MVP.

### Application Monitoring (Planned)
- **Technology:** Datadog or Grafana + Prometheus
- **Rationale:** Real-time metrics on API latency, database queries, Redis operations, and queue depth. Essential for maintaining sub-1.5s transaction SLO.

### Uptime Monitoring (Planned)
- **Technology:** UptimeRobot or Better Uptime
- **Rationale:** External monitoring ensures platform availability. SMS/email alerts for downtime. Status page for customer communication.

## Third-Party Services

### Authentication
- **OAuth Provider:** Google OAuth 2.0
- **JWT Implementation:** @nestjs/jwt + passport-jwt
- **Rationale:** Google OAuth reduces friction for user signup. JWT enables stateless authentication with refresh token rotation for security.

### Email (Planned)
- **Technology:** SendGrid or Resend
- **Rationale:** Transactional email for auth verification, point expiration warnings, and economic alerts. SendGrid offers generous free tier. Resend provides modern developer experience.

### SMS (Planned)
- **Technology:** Twilio
- **Rationale:** SMS notifications for high-value transactions and critical alerts. Strong API and documentation. Pay-as-you-go pricing.

### File Storage (Future)
- **Technology:** AWS S3 or Cloudflare R2
- **Use Case:** Business logos, user profile images, audit exports
- **Rationale:** Object storage with CDN integration for fast global access. R2 offers S3-compatible API without egress fees.

## Security & Cryptography

### Hashing Algorithm
- **Technology:** SHA256 (crypto module)
- **Use Cases:** Ledger entry hashing, daily audit batch hashing
- **Rationale:** Cryptographically secure, widely trusted, supported natively in Node.js. Fast computation suitable for per-transaction hashing.

### Password Hashing
- **Technology:** bcrypt
- **Rationale:** Industry standard for password hashing with adaptive cost factor. Built-in salt generation. Resistant to rainbow table attacks.

### Secrets Management (Planned)
- **Technology:** AWS Secrets Manager or HashiCorp Vault
- **Rationale:** Centralized secret storage with automatic rotation. Audit logging of secret access. Better than environment variables in production.

## Development Tools

### Monorepo Management
- **Technology:** pnpm workspaces
- **Build System:** Native TypeScript compilation (tsc) + Vite
- **Rationale:** pnpm workspaces handle local package dependencies elegantly. No additional build tool (Turborepo) needed initially. Keep it simple.

### Code Editor
- **Recommended:** Visual Studio Code
- **Extensions:** ESLint, Prettier, Prisma, Docker
- **Rationale:** Excellent TypeScript support, integrated terminal, git integration. Free and open-source.

### Database Management
- **Technology:** Prisma Studio
- **Alternative:** pgAdmin, TablePlus
- **Rationale:** Prisma Studio provides GUI for database inspection. pgAdmin for advanced queries and performance analysis.

### API Testing
- **Technology:** Bruno or Postman
- **Rationale:** REST client for manual API testing during development. OpenAPI import enables instant test collection generation.

## Architecture Patterns

### Backend Architecture
- **Pattern:** Modular Monolith with DDD + Clean Architecture
- **Layers:** Domain (entities, repositories) → Application (use cases, services) → Infrastructure (controllers, Prisma repos)
- **Rationale:** DDD ensures business logic lives in domain layer, separate from framework. Clean Architecture enables testability. Modular monolith provides independence without microservices complexity.

### Repository Pattern
- **Implementation:** Interface in domain layer, Prisma implementation in infrastructure
- **Dependency Injection:** String tokens (e.g., 'ITransactionRepository')
- **Rationale:** Decouples business logic from data access. Enables easy testing with mock repositories.

### Event-Driven Communication
- **Technology:** NestJS EventEmitter
- **Events:** TransactionCompletedEvent, EconomicAlertEvent, PointsExpiredEvent
- **Rationale:** Loose coupling between modules. Subscribers can react to domain events without tight dependencies.

## Performance & Scalability

### Target SLOs
- **API Latency (p95):** < 1.5 seconds for earn/redeem transactions
- **Database Queries:** < 100ms for wallet balance lookups
- **Uptime:** 99.5% (MVP), 99.9% (production)

### Optimization Strategies
- **Redis Caching:** Wallet balances, frequently accessed ledger data
- **Database Indexing:** Composite indexes on ledger (accountId, createdAt), transactions (userId, type)
- **Connection Pooling:** Prisma connection pool (max 20 connections)
- **Horizontal Scaling:** Stateless API enables load balancing across multiple instances

## Future Considerations

### Mobile Application
- **Technology:** React Native or Flutter
- **Rationale:** React Native enables code sharing with web frontend. Flutter provides better performance and native feel. Decision pending based on team expertise.

### Real-time Updates
- **Technology:** WebSockets (Socket.io) or Server-Sent Events
- **Use Case:** Live wallet balance updates, transaction notifications
- **Rationale:** Enhance UX with instant updates without polling. Consideration for Phase 2+.

### GraphQL API
- **Technology:** Apollo Server + NestJS GraphQL
- **Use Case:** Complex nested queries for analytics dashboard
- **Rationale:** GraphQL reduces over-fetching for complex data requirements. Consideration for admin analytics in Phase 3+.

---

## Summary

This tech stack balances modern best practices with pragmatic choices for a loyalty platform. Core principles:

1. **Type Safety:** TypeScript everywhere (backend, frontend, shared types, SDK)
2. **Developer Experience:** Tools that enhance productivity (Prisma, Vite, pnpm)
3. **Performance:** Sub-1.5s transactions via caching, optimized queries, and hybrid architecture
4. **Auditability:** Cryptographic hashing + immutable ledger + blockchain anchoring
5. **Scalability:** Stateless API, horizontal scaling, managed services
6. **Maintainability:** Clean Architecture, DDD, comprehensive testing, monorepo organization

All choices support the mission: instant, transparent, auditable loyalty transactions for Bolivian businesses and consumers.
