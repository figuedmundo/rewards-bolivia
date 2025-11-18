# Product Roadmap

This roadmap reflects the current state of the project and outlines upcoming features. Core infrastructure (Auth, Users, Transactions, Ledger with dual-level hashing) is already implemented.

## Completed Foundation

- [x] Monorepo architecture with pnpm workspaces
- [x] NestJS API with DDD/Clean Architecture
- [x] Prisma schema with User, Business, Transaction, PointLedger models
- [x] Authentication system (JWT + Google OAuth)
- [x] Transaction engine (EARN/REDEEM/ADJUSTMENT/BURN)
- [x] Immutable ledger with per-transaction SHA256 hashing
- [x] Daily audit hash generation (automated cron at 3 AM UTC)
- [x] Economic Control System with real-time metric monitoring
- [x] Admin audit endpoints (query, verify daily hashes)
- [x] Granular ledger query endpoints (user-scoped)
- [x] Background worker system (BullMQ/Redis)
- [x] React dashboard with Wallet UI components
- [x] Auto-generated TypeScript-Axios SDK
- [x] Docker Compose local development environment

## Phase 1 - Enhanced Wallet Experience

1. [x] Wallet Transaction Filtering - Add advanced filters to transaction history (date range, type, amount, merchant), export capabilities, and search functionality `S`
2. [ ] Point Expiration Notifications - Implement user notifications (email/SMS) for upcoming point expirations with configurable warning periods `M`
3. [ ] Wallet Analytics Dashboard - Display user-specific insights (monthly earn/redeem trends, top merchants, point velocity) with charts `M`

## Phase 2 - Business Onboarding & Operations

4. [ ] Business Registration Flow - Complete self-service onboarding with KYC verification, business plan selection, and account setup wizard `M`
5. [ ] Earn/Redeem API v2 Stabilization — Refactor the transaction engine to support upcoming features (business plans, expiration, blocking, fees, tier multipliers). Introduce a unified validation layer for all transaction types with consistent error codes, atomic safety rules, and backward-compatible behavior. Ensure the new engine is fully covered by integration and economic consistency tests. `M`
6. [ ] Business Point Issuance UI - Build merchant interface for issuing points via QR code scanning, manual user lookup, and bulk operations `L`
7. [ ] Point Redemption UI - Create checkout interface with point application, discount calculation (0-30%), real-time validation, and receipt generation `M`
8. [ ] Business Transaction Dashboard - Provide merchants with analytics on issued points, redemptions, active customers, and revenue impact `M`

## Phase 3 - Economic Health & Admin Tools

9. [ ] Economic Dashboard V2 - Enhance admin dashboard with trend charts, predictive analytics, comparison views (day/week/month), and drill-down capabilities `L`
10. [ ] Alert Configuration UI - Build interface for admins to configure economic thresholds, notification channels, and severity levels `M`
11. [ ] Semi-Automated Emission Engine - Implement admin tools for adjusting point emission rates with approval workflows, impact simulations, and rollback capabilities `L`
12. [ ] System Health Monitoring - Add operational metrics (API latency, queue depth, error rates) with real-time dashboards and incident tracking `M`

## Phase 4 - Business Plans & Advanced Logic

13. [ ] Business Plan Engine Implementation - Build tiered plan system (Starter/Basic/Pro/Premium) with feature gates, blocked balance calculations, and automatic upgrades `L`
14. [ ] Point Expiration Automation - Implement scheduled job for expiring points based on business rules, creating EXPIRE ledger entries, and triggering notifications `M`
15. [ ] Point Blocking System - Add ability to block points during pending transactions, disputed charges, or fraud investigations with audit trail `M`

## Phase 5 - Performance & Scaling

16. [ ] Performance Testing Suite - Implement k6 load tests for earn/redeem endpoints with defined SLOs (95th percentile < 1.5s), automated regression tests `S`
17. [ ] API Rate Limiting Enhancement - Add sophisticated rate limiting with Redis counters, role-based quotas, IP-based throttling, and burst allowances `M`
18. [ ] Database Optimization - Implement query optimization, add strategic indexes, partition large tables (PointLedger), enable connection pooling `M`
19. [ ] Redis Caching Layer - Add caching for wallet balances, frequently accessed ledger queries, and business configurations with smart invalidation `M`

## Phase 6 - Multi-Business Features

20. [ ] Point Transfer Between Businesses - Enable businesses to transfer points with configurable fees, approval workflows, and comprehensive transfer history `L`
21. [ ] Business Collaboration Tools - Allow businesses to create joint promotions, shared point pools, and cross-redemption agreements `L`
22. [ ] Referral Program System - Implement customer referral codes, bonus point rewards, tracking dashboard, and leaderboard features `M`

## Phase 7 - Loyalty Tiers & Gamification

23. [ ] Loyalty Tiers System - Build Bronze/Silver/Gold tier progression with multiplier bonuses, tier-specific benefits, and progression UI `L`
24. [ ] Achievement System - Create achievement badges, milestone rewards, and gamification elements to increase engagement `M`
25. [ ] Personalized Offers Engine - Implement recommendation system for targeted offers based on transaction history and user behavior `L`

## Phase 8 - Advanced Analytics & Reporting

26. [ ] Business Retention Analytics - Provide merchants with customer lifetime value, churn prediction, and retention cohort analysis `M`
27. [ ] Transaction Value Trend Analysis - Build charts showing issuance vs redemption patterns, seasonal trends, and forecasting models `M`
28. [ ] Regulatory Compliance Reporting - Automated generation of audit reports, tax documentation, and regulatory submissions `M`
29. [ ] Custom Report Builder - Allow admins and businesses to create custom reports with filters, aggregations, and scheduled delivery `L`

## Phase 9 - Blockchain Integration

30. [ ] Blockchain Anchoring Implementation - Submit daily audit hashes to Polygon blockchain with gas optimization, verification endpoints, and explorer UI `XL`
31. [ ] On-chain Verification Tools - Build public verification interface allowing anyone to independently verify ledger integrity against blockchain `M`
32. [ ] Smart Contract for Point Reserves - Deploy smart contract managing point reserve requirements with automated monitoring and alerts `L`

## Phase 10 - Mobile & Expansion

33. [ ] Mobile App (React Native) - Build iOS/Android app with wallet, QR scanning, offline-first sync, push notifications, and biometric auth `XL`
34. [ ] Multi-Currency Support - Enable businesses to issue points in different currencies or point types with exchange rate management `L`
35. [ ] White-Label Solution - Create customizable white-label version allowing businesses to brand their own loyalty platform `XL`

> Notes
> - Items are ordered by strategic value and technical dependencies
> - Each feature represents end-to-end functionality (API + UI + tests)
> - Effort estimates: XS (1 day), S (2-3 days), M (1 week), L (2 weeks), XL (3+ weeks)
> - Blockchain features require infrastructure setup and may shift based on regulatory landscape
> - Mobile app timeline depends on Phase 1-4 stability
