# Product Roadmap

This roadmap reflects the current state of the project and outlines upcoming features. Core infrastructure (Auth, Users, Transactions, Ledger with dual-level hashing) is already implemented.

**Strategic Focus**: Cliente-First MVP approach - complete customer-business transaction loop before advanced features.

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
- [x] React dashboard with Wallet UI components (desktop-focused)
- [x] Auto-generated TypeScript-Axios SDK
- [x] Docker Compose local development environment
- [x] Wallet Transaction Filtering with CSV export
- [x] Point Expiration Notifications (email/SMS)

## Phase 0 - MVP Foundation (Cliente-Business Transaction Loop)

**Goal**: Deliver a complete, functional customer journey from earning to redeeming points with mobile-first PWA experience.

**Customer (Cliente) Journey:**

1. [ ] Mobile-Responsive Wallet Homepage - Convert existing wallet UI to mobile-first PWA with touch-optimized navigation, animated balance card, and quick actions `M`
2. [ ] QR Scanner Component (Cliente Side) - Camera-based QR scanning for earning points at businesses, with visual feedback and error handling `M`
3. [ ] Point Earning Flow - Complete UX from scanning business QR → API call → visual confirmation ("🎉 +50 points earned at Café Chaco") `S`
4. [ ] Redemption Initiation Flow - Cliente-side interface to initiate redemption, select point amount, generate redemption QR for business to scan `M`
5. [ ] P2P Point Transfer UI - Send points to other users via username/QR code with confirmation flow and transaction history `M`
6. [ ] Gamification V0 (Visual-Only) - Display tier badges (Plata/Oro/Diamante), progress bar toward next tier, basic visual hierarchy (no tier logic/multipliers yet) `S`
7. [ ] PWA Configuration - Service worker, offline fallback, installable app, web push notification setup `S`

**Business (Negocio) Journey:**

8. [ ] Business QR Generation (Earn) - Generate dynamic QR codes with transaction amount for customers to scan and earn points `M`
9. [ ] Business QR Scanner (Redeem) - Scan customer redemption QR, validate points, apply discount (0-30% configurable), confirm transaction `M`
10. [ ] Simple Business Dashboard - Today's stats (points issued, redeemed, transactions), current balance, recent activity feed `M`
11. [ ] Emission Rules Configuration - UI for businesses to set reward percentage (e.g., 5% of purchase = points), expiration policies `S`

**System & Economic Rules:**

12. [ ] Burn Fee Implementation - Apply 0.5% burn on redemptions, create BURN ledger entries, update economic metrics `S`
13. [ ] Point Expiration Worker Enhancement - Handle 12-month standard expiration, 3-6 month promo expiration, create EXPIRE entries `M`
14. [ ] Tier Calculation Logic (Backend) - Calculate user tier based on 12-month point accumulation (Plata/Oro/Diamante thresholds), expose via API `S`
15. [ ] Manual Business Onboarding Support - Admin tools to manually create business accounts, assign test points for MVP validation `XS`

**Acceptance Criteria for Phase 0:**
- ✅ Customer can scan QR at a café and earn points
- ✅ Customer can redeem points at checkout with QR
- ✅ Customer sees tier badge and progress in wallet
- ✅ Business can generate QR for customers to earn
- ✅ Business can scan customer QR to apply discount
- ✅ All transactions create proper ledger entries with hashing
- ✅ Economic metrics update correctly (burn, circulation)
- ✅ PWA is installable on mobile devices

## Phase 1 - Enhanced Wallet Experience

**Goal**: Add analytics, insights, and personalization to increase engagement (runs after MVP is validated).

1. [ ] Wallet Analytics Dashboard - Display user-specific insights (monthly earn/redeem trends, top merchants, point velocity) with Recharts `M` *(Paused - spec ready in `.paused-2025-12-11-wallet-analytics-dashboard/`)*
2. [ ] Personalized Insights Engine - Threshold-based recommendations (tier progress nudges, merchant discovery, spending patterns) `M`
3. [ ] Multi-Merchant Wallet View - Filter/group transactions by merchant, see balances per business, merchant loyalty stats `S`
4. [ ] Web Push Notifications - Browser-based push for point earnings, redemptions, expirations, tier upgrades `S`
5. [ ] Transaction Search & Advanced Filters - Full-text search across descriptions, advanced date ranges, amount filters `S`

## Phase 2 - Business Onboarding & Operations

**Goal**: Enable self-service business onboarding and advanced merchant operations.

6. [ ] Business Registration Flow - Self-service onboarding with KYC verification, business plan selection, account setup wizard `M`
7. [ ] Earn/Redeem API v2 Stabilization - Refactor transaction engine for business plans, expiration, blocking, fees, tier multipliers with unified validation layer `M`
8. [ ] Advanced Business Point Issuance - Manual user lookup, bulk operations, CSV import for batch point grants `L`
9. [ ] Advanced Redemption UI - Receipt generation, redemption history export, dispute resolution interface `M`
10. [ ] Business Analytics Dashboard - Customer analytics (lifetime value, visit frequency, churn risk), revenue impact, campaign performance `M`

## Phase 3 - Economic Health & Admin Tools

**Goal**: Provide admins with comprehensive economic oversight and intervention tools.

11. [ ] Economic Dashboard V2 - Enhanced admin dashboard with trend charts, predictive analytics, comparison views (day/week/month), drill-down capabilities `L`
12. [ ] Alert Configuration UI - Interface for admins to configure economic thresholds, notification channels, severity levels `M`
13. [ ] Semi-Automated Emission Engine - Admin tools for adjusting point emission rates with approval workflows, impact simulations, rollback capabilities `L`
14. [ ] System Health Monitoring - Operational metrics (API latency, queue depth, error rates) with real-time dashboards and incident tracking `M`

## Phase 4 - Business Plans & Advanced Logic

**Goal**: Implement business plan tiers and advanced point management features.

15. [ ] Business Plan Engine Implementation - Tiered plan system (Starter/Basic/Pro/Premium) with feature gates, blocked balance calculations, automatic upgrades `L`
16. [ ] Point Blocking System - Block points during pending transactions, disputed charges, fraud investigations with audit trail `M`
17. [ ] Advanced Expiration Rules - Configurable expiration policies per business plan, grace periods, expiration warning notifications `M`

## Phase 5 - Performance & Scaling

**Goal**: Optimize for production load and ensure sub-1.5s transaction performance.

18. [ ] Performance Testing Suite - k6 load tests for earn/redeem endpoints with SLOs (95th percentile < 1.5s), automated regression tests `S`
19. [ ] API Rate Limiting Enhancement - Sophisticated rate limiting with Redis counters, role-based quotas, IP-based throttling, burst allowances `M`
20. [ ] Database Optimization - Query optimization, strategic indexes, partition large tables (PointLedger), connection pooling `M`
21. [ ] Redis Caching Layer - Caching for wallet balances, ledger queries, business configurations with smart invalidation `M`

## Phase 6 - Multi-Business Features

**Goal**: Enable business-to-business collaboration and customer referral programs.

22. [ ] Point Transfer Between Businesses - Enable B2B point transfers with configurable fees, approval workflows, transfer history `L`
23. [ ] Business Collaboration Tools - Joint promotions, shared point pools, cross-redemption agreements `L`
24. [ ] Referral Program System - Customer referral codes, bonus point rewards, tracking dashboard, leaderboards `M`

## Phase 7 - Loyalty Tiers & Gamification (Full System)

**Goal**: Implement full tier progression with multipliers, achievements, and personalized offers.

25. [ ] Loyalty Tiers System V2 - Full tier progression logic with multiplier bonuses (Oro 1.2x, Diamante 1.5x), tier-specific benefits, auto-progression `L`
26. [ ] Achievement System - Achievement badges, milestone rewards, streaks, challenges, social leaderboards `M`
27. [ ] Personalized Offers Engine - Recommendation system for targeted offers based on transaction history and user behavior `L`

## Phase 8 - Advanced Analytics & Reporting

**Goal**: Provide deep business intelligence and regulatory compliance reporting.

28. [ ] Business Retention Analytics - Customer lifetime value, churn prediction, retention cohort analysis for merchants `M`
29. [ ] Transaction Value Trend Analysis - Charts showing issuance vs redemption patterns, seasonal trends, forecasting models `M`
30. [ ] Regulatory Compliance Reporting - Automated audit reports, tax documentation, regulatory submissions `M`
31. [ ] Custom Report Builder - Allow admins and businesses to create custom reports with filters, aggregations, scheduled delivery `L`

## Phase 9 - Blockchain Integration

**Goal**: Implement on-chain verification and point reserve management.

32. [ ] Blockchain Anchoring Implementation - Submit daily audit hashes to Polygon blockchain with gas optimization, verification endpoints, explorer UI `XL`
33. [ ] On-chain Verification Tools - Public verification interface for independent ledger integrity verification against blockchain `M`
34. [ ] Smart Contract for Point Reserves - Deploy smart contract managing point reserve requirements with automated monitoring and alerts `L`

## Phase 10 - Native Mobile & Expansion

**Goal**: Launch native mobile apps and enable platform expansion features.

35. [ ] Mobile App (React Native) - iOS/Android app with wallet, native QR scanning, offline-first sync, push notifications, biometric auth `XL`
36. [ ] Multi-Currency Support - Enable businesses to issue points in different currencies or point types with exchange rate management `L`
37. [ ] White-Label Solution - Customizable white-label version allowing businesses to brand their own loyalty platform `XL`

---

## 📊 Roadmap Strategy Notes

### Phase 0 Priority
**Phase 0 (MVP Foundation) is the critical path.** All other phases depend on completing the cliente-business transaction loop. Estimated completion: 3-4 weeks.

### Effort Estimates
- **XS**: 1 day
- **S**: 2-3 days
- **M**: 1 week
- **L**: 2 weeks
- **XL**: 3+ weeks

### Key Principles
1. **Cliente-First**: Customer experience drives business value
2. **PWA Before Native**: Progressive Web App validates UX before React Native investment
3. **Manual-to-Automated**: Start with manual business onboarding, automate after validation
4. **Visual-to-Logic**: Gamification visuals (Phase 0) before full tier logic (Phase 7)
5. **Incremental Delivery**: Each phase delivers working, valuable features

### Dependencies
- Phase 1-10 require Phase 0 completion
- Native mobile (Phase 10) requires PWA validation (Phase 0)
- Full gamification (Phase 7) requires Gamification V0 (Phase 0)
- Business plans (Phase 4) can run parallel to Phase 1-3

### Paused Work
- **Wallet Analytics Dashboard**: Spec complete in `.paused-2025-12-11-wallet-analytics-dashboard/`, resume in Phase 1
