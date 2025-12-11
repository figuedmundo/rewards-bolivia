# Task Breakdown: Wallet Analytics Dashboard

## Overview
Total Tasks: 4 task groups with 30+ sub-tasks
Estimated Effort: Medium (1 week)
Architecture: New analytics module (backend) + dashboard components (frontend)

## Task List

### Backend Infrastructure

#### Task Group 1: Analytics Module Setup & Data Layer
**Dependencies:** None
**Critical Path:** Yes - All frontend work depends on API endpoints

- [ ] 1.0 Complete analytics backend module
  - [ ] 1.1 Write 2-8 focused tests for analytics aggregation logic
    - Test monthly trends aggregation (group by month, sum credit/debit)
    - Test merchant ranking aggregation (top 3 by count and points)
    - Test summary metrics calculation (period totals, previous period comparison)
    - Test tier calculation logic (Plata 0-999, Oro 1000-4999, Diamante 5000+)
    - Test velocity calculation (monthly earn rate, trend direction)
    - Limit to critical aggregation behaviors only
  - [ ] 1.2 Create analytics module structure
    - Path: `/packages/api/src/modules/analytics/`
    - Domain: `domain/repositories/analytics.repository.ts` (IAnalyticsRepository interface)
    - Application: `application/get-analytics-summary.use-case.ts`
    - Application: `application/get-monthly-trends.use-case.ts`
    - Application: `application/get-merchant-analytics.use-case.ts`
    - Application: `application/services/insights-generator.service.ts`
    - Infrastructure: `infrastructure/controllers/analytics.controller.ts`
    - Infrastructure: `infrastructure/repositories/prisma-analytics.repository.ts`
    - Module file: `analytics.module.ts`
  - [ ] 1.3 Define IAnalyticsRepository interface
    - Method: `getAnalyticsSummary(userId: string, period: AnalyticsPeriod): Promise<AnalyticsSummary>`
    - Method: `getMonthlyTrends(userId: string, period: AnalyticsPeriod): Promise<MonthlyDataPoint[]>`
    - Method: `getMerchantAnalytics(userId: string, period: AnalyticsPeriod): Promise<MerchantStats[]>`
    - Method: `getPointsVelocity(userId: string, period: AnalyticsPeriod): Promise<VelocityMetric>`
    - Period enum: '30d' | '6m' | '12m' | 'all'
  - [ ] 1.4 Implement PrismaAnalyticsRepository
    - Reuse pattern from PrismaLedgerRepository
    - Use raw SQL for complex monthly aggregations: `SELECT DATE_TRUNC('month', "createdAt") as month, SUM("credit") as earned, SUM("debit") as redeemed FROM "PointLedger" WHERE...`
    - Join Transaction and Business tables for merchant analytics
    - Add database indexes if needed: `accountId + createdAt` on PointLedger
    - Optimize queries to handle up to 1000+ ledger entries efficiently (<500ms target)
  - [ ] 1.5 Implement GetAnalyticsSummaryUseCase
    - Calculate: totalEarned, totalRedeemed, currentBalance (from user table), activeMerchantCount
    - Calculate previous period metrics for percentage changes
    - Add percentage change calculation with direction (up/down)
    - Include Redis caching with 1-hour TTL (cache key: `analytics:summary:${userId}:${period}`)
    - Return AnalyticsSummaryDto
  - [ ] 1.6 Implement GetMonthlyTrendsUseCase
    - Query PointLedger grouped by month
    - Separate EARN and REDEEM aggregations
    - Return array of MonthlyDataPoint: { month: string, earned: number, redeemed: number }
    - Cache in Redis with 24-hour TTL (cache key: `analytics:trends:${userId}:${period}`)
  - [ ] 1.7 Implement GetMerchantAnalyticsUseCase
    - Aggregate by Business name via Transaction JOIN
    - Calculate: merchantName, transactionCount, totalPoints, percentageOfActivity
    - Return top 3 merchants by transaction count AND top 3 by total points (separate lists)
    - Handle edge case: fewer than 3 merchants (return available only)
    - Cache in Redis with 1-hour TTL
  - [ ] 1.8 Implement InsightsGeneratorService
    - Rule 1: Tier progress (if not Diamante): "You're ${points} points away from ${nextTier} tier!"
    - Rule 2: New merchants this month: "You've visited ${count} new merchants this month"
    - Rule 3: Redemption health: "Your redemption rate is ${rate}% - ${message}"
    - Rule 4: Velocity trend: "You're earning ${percent}% ${more/less} than your average"
    - Priority order: tier progress > merchant diversity > velocity changes
    - Return 2-3 insights maximum, positive/aspirational tone
  - [ ] 1.9 Ensure backend tests pass
    - Run ONLY the 2-8 tests written in 1.1
    - Verify aggregation calculations are correct
    - Verify Redis caching works (mock Redis in tests)
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests from 1.1 pass
- Repository methods return correctly aggregated data
- Use cases integrate repository + caching + business logic
- Insights generator produces contextual messages

---

#### Task Group 2: API Controllers & DTOs
**Dependencies:** Task Group 1
**Critical Path:** Yes - Frontend needs these endpoints

- [ ] 2.0 Complete analytics API layer
  - [ ] 2.1 Write 2-8 focused tests for API endpoints
    - Test GET /api/analytics/summary with JWT auth
    - Test GET /api/analytics/trends with period parameter validation
    - Test GET /api/analytics/merchants endpoint
    - Test GET /api/analytics/insights endpoint
    - Test authorization (user can only access own data)
    - Test error handling (invalid period, missing auth)
    - Limit to critical controller behaviors only
  - [ ] 2.2 Create shared-types DTOs
    - Path: `/packages/shared-types/src/analytics/`
    - AnalyticsSummaryDto: totalEarned, totalRedeemed, currentBalance, activeMerchantCount, percentageChanges
    - MonthlyDataPointDto: month (string), earned (number), redeemed (number)
    - MerchantStatsDto: merchantName, transactionCount, totalPoints, percentage
    - PointsVelocityDto: monthlyRate, trend (up/down/stable), percentChange
    - PersonalizedInsightDto: message (string), type (tier|merchant|velocity|redemption)
    - AnalyticsPeriod enum: '30d' | '6m' | '12m' | 'all'
  - [ ] 2.3 Create AnalyticsController
    - Path: `/packages/api/src/modules/analytics/infrastructure/controllers/analytics.controller.ts`
    - Endpoint: GET /api/analytics/summary?period=6m
    - Endpoint: GET /api/analytics/trends?period=6m
    - Endpoint: GET /api/analytics/merchants?period=6m
    - Endpoint: GET /api/analytics/insights?period=6m
    - Apply @UseGuards(JwtAuthGuard) to all endpoints
    - Parse and validate period query parameter (default: 6m)
    - Extract userId from @Request() req (req.user.id)
    - Return appropriate HTTP status codes (200, 400, 401, 500)
  - [ ] 2.4 Add validation for query parameters
    - Use class-validator for period enum validation
    - Default to '6m' if period not provided
    - Return 400 Bad Request for invalid period values
  - [ ] 2.5 Register AnalyticsModule in AppModule
    - Import AnalyticsModule in app.module.ts
    - Ensure Redis module is available for caching
    - Verify JWT auth guards work for analytics routes
  - [ ] 2.6 Update OpenAPI spec (Swagger)
    - Add @ApiTags('analytics') to controller
    - Document all endpoints with @ApiOperation
    - Include query parameter descriptions
    - Add response type decorators (@ApiResponse)
    - Generate updated SDK: `pnpm generate:sdk`
  - [ ] 2.7 Ensure API layer tests pass
    - Run ONLY the 2-8 tests written in 2.1
    - Verify endpoints return correct status codes
    - Verify JWT auth is enforced
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests from 2.1 pass
- All endpoints accessible at /api/analytics/*
- JWT authentication required and working
- Query parameters validated correctly
- OpenAPI spec updated and SDK generated

---

### Frontend Components

#### Task Group 3: Analytics Dashboard UI Components
**Dependencies:** Task Group 2 (API endpoints must exist)
**Critical Path:** Yes - Primary user-facing feature

- [ ] 3.0 Complete analytics dashboard frontend
  - [ ] 3.1 Write 2-8 focused tests for analytics components
    - Test AnalyticsSummary component renders metrics with loading state
    - Test MonthlyTrendsChart renders chart with mock data
    - Test MerchantAnalytics component renders top merchants
    - Test TierProgress component shows correct tier and progress bar
    - Test period filter changes trigger query refetch
    - Test empty states display when no data
    - Limit to critical component behaviors only
  - [ ] 3.2 Create analytics query hooks
    - Path: `/packages/web/src/hooks/useAnalytics.ts`
    - Hook: `useAnalyticsSummary(period: AnalyticsPeriod)`
    - Hook: `useMonthlyTrends(period: AnalyticsPeriod)`
    - Hook: `useMerchantAnalytics(period: AnalyticsPeriod)`
    - Hook: `usePersonalizedInsights(period: AnalyticsPeriod)`
    - Query keys factory: `analyticsKeys.summary`, `analyticsKeys.trends`, etc.
    - Configure: staleTime: 5 minutes, refetchOnWindowFocus: true
    - Pattern: Follow useWallet.ts hook patterns (TanStack Query)
  - [ ] 3.3 Create API client functions
    - Path: `/packages/web/src/lib/analytics-api.ts`
    - Function: `getAnalyticsSummary(period: AnalyticsPeriod): Promise<AnalyticsSummaryDto>`
    - Function: `getMonthlyTrends(period: AnalyticsPeriod): Promise<MonthlyDataPointDto[]>`
    - Function: `getMerchantAnalytics(period: AnalyticsPeriod): Promise<MerchantStatsDto[]>`
    - Function: `getPersonalizedInsights(period: AnalyticsPeriod): Promise<PersonalizedInsightDto[]>`
    - Use generated SDK or fetch with JWT token
    - Handle errors and return typed responses
  - [ ] 3.4 Create AnalyticsSummary component
    - Path: `/packages/web/src/components/wallet/analytics/AnalyticsSummary.tsx`
    - Display 4 metric cards in responsive grid (2x2 on tablet, 4x1 on desktop)
    - Show: Total Earned, Total Redeemed, Current Balance, Active Merchants
    - Include percentage change badges with color coding (green up, red down)
    - Use lucide-react icons: TrendingUp, TrendingDown, ArrowRight
    - Loading state: Skeleton cards using shadcn/ui Skeleton component
    - Error state: Retry button with error message
    - Pattern: Follow WalletBalance.tsx card layout
  - [ ] 3.5 Create MonthlyTrendsChart component
    - Path: `/packages/web/src/components/wallet/analytics/MonthlyTrendsChart.tsx`
    - Use Recharts library: AreaChart with two series (EARN green, REDEEM orange)
    - Lazy load: Use React.lazy() and Suspense for code splitting
    - Responsive: Use ResponsiveContainer from Recharts
    - Tooltip: Show exact amounts on hover
    - Empty state: Encouraging message when no data ("Start earning to see trends!")
    - Loading: Skeleton with chart-like placeholder
  - [ ] 3.6 Create MerchantAnalytics component
    - Path: `/packages/web/src/components/wallet/analytics/MerchantAnalytics.tsx`
    - Use shadcn/ui Tabs: "By Transactions" and "By Points"
    - Display horizontal bar chart (CSS-based or Recharts BarChart)
    - Show: merchant name, count/points, percentage bar
    - Handle: Fewer than 3 merchants (show available only)
    - Empty state: "Make purchases to see merchant insights"
    - Icon: Users from lucide-react
  - [ ] 3.7 Create TierProgress component
    - Path: `/packages/web/src/components/wallet/analytics/TierProgress.tsx`
    - Calculate tier from balance: Plata (0-999), Oro (1000-4999), Diamante (5000+)
    - Display: Tier badge with culturally-relevant icon (Award from lucide-react)
    - Progress bar: shadcn/ui Progress component showing distance to next tier
    - Micro-copy: "You need ${points} more points to reach ${nextTier}!"
    - Diamante tier: Celebration message instead of progress bar
    - Styling: Bolivian design aesthetic (use warm colors, friendly typography)
  - [ ] 3.8 Create PersonalizedInsights component
    - Path: `/packages/web/src/components/wallet/analytics/PersonalizedInsights.tsx`
    - Display 2-3 insights as cards or list items
    - Use icons based on insight type (Award, Users, TrendingUp, BarChart3)
    - Positive, aspirational tone
    - Responsive: Stack vertically on mobile, horizontal on desktop
    - Pattern: Card-based layout matching existing wallet components
  - [ ] 3.9 Create AnalyticsDashboard container component
    - Path: `/packages/web/src/components/wallet/analytics/AnalyticsDashboard.tsx`
    - Period filter: Tabs or Select dropdown (30d, 6m, 12m, all) - default 6m
    - Layout: Stack components vertically with consistent spacing
    - Responsive breakpoints: Mobile (<640px), Tablet (640-1024px), Desktop (>1024px)
    - Integrate: AnalyticsSummary, PersonalizedInsights, MonthlyTrendsChart, MerchantAnalytics, TierProgress
    - Use shadcn/ui Card components for consistent styling
    - Minimum 44px touch targets for all interactive elements
  - [ ] 3.10 Add analytics route/page
    - Path: `/packages/web/src/pages/Analytics.tsx` or integrate into existing Wallet page
    - Import and render AnalyticsDashboard component
    - Add navigation link in wallet section (if separate page)
    - Protected route: Require authentication
  - [ ] 3.11 Implement cache invalidation on transactions
    - Update useRedeemPoints hook in useWallet.ts
    - Update useEarnPoints hook in useWallet.ts
    - Invalidate analytics queries on success: `queryClient.invalidateQueries({ queryKey: analyticsKeys.all })`
    - Ensure real-time feeling: Analytics refetch after earning/redeeming points
  - [ ] 3.12 Ensure UI component tests pass
    - Run ONLY the 2-8 tests written in 3.1
    - Verify components render correctly with mock data
    - Verify loading and error states work
    - Do NOT run entire test suite

**Acceptance Criteria:**
- The 2-8 tests from 3.1 pass
- All analytics components render correctly
- Responsive design works across mobile/tablet/desktop
- Charts render in <200ms for 12-month datasets
- Period filter changes trigger data refetch
- Empty and loading states display properly

---

### Testing & Performance Optimization

#### Task Group 4: Integration Testing & Performance Validation
**Dependencies:** Task Groups 1-3
**Critical Path:** No - But required for production readiness

- [ ] 4.0 Complete integration testing and performance optimization
  - [ ] 4.1 Review existing tests from Task Groups 1-3
    - Review backend aggregation tests (2-8 from Task 1.1)
    - Review API endpoint tests (2-8 from Task 2.1)
    - Review frontend component tests (2-8 from Task 3.1)
    - Total existing: approximately 6-24 tests
  - [ ] 4.2 Analyze critical test coverage gaps
    - Identify missing end-to-end workflow tests (user loads dashboard → sees data)
    - Check cache invalidation integration (transaction → analytics refresh)
    - Verify period filter changes work across all components
    - Focus ONLY on gaps related to analytics dashboard feature
    - Do NOT assess entire application coverage
  - [ ] 4.3 Write up to 10 additional integration tests maximum
    - Test: Full dashboard load with all components (E2E-style)
    - Test: Period filter changes propagate to all charts
    - Test: Transaction completion invalidates analytics cache
    - Test: Redis cache hit/miss scenarios for performance
    - Test: Tier progress updates when balance changes
    - Test: Empty states display when user has no transactions
    - Test: Merchant analytics handles < 3 merchants correctly
    - Test: Mobile responsive layout breakpoints
    - Test: Chart lazy loading and render performance
    - Test: API response time <500ms with cache, <2s cold start
    - Maximum 10 tests - prioritize end-to-end workflows
  - [ ] 4.4 Performance validation and optimization
    - Verify: API endpoints respond in <500ms (cached) and <2s (cold)
    - Verify: Chart renders in <200ms for 12-month datasets
    - Verify: Dashboard initial load <3s (including lazy-loaded chart)
    - Optimize: Add database indexes if queries slow (accountId + createdAt on PointLedger)
    - Optimize: Lazy load Recharts library (React.lazy + Suspense)
    - Optimize: Redis cache TTL values (summary: 1h, trends: 24h, merchants: 1h)
    - Test: Bundle size impact (Recharts should be code-split)
  - [ ] 4.5 Run feature-specific tests only
    - Run backend tests: `pnpm --filter api test -- analytics`
    - Run frontend tests: `pnpm --filter web test -- analytics`
    - Run integration tests written in 4.3
    - Expected total: approximately 16-34 tests maximum
    - Do NOT run entire application test suite
    - Verify all analytics feature tests pass
  - [ ] 4.6 Manual testing checklist
    - Test all period filters (30d, 6m, 12m, all) on all components
    - Test with user who has no transactions (empty states)
    - Test with user who has < 3 merchants (merchant analytics)
    - Test tier transitions (Plata → Oro → Diamante)
    - Test mobile responsive design (320px, 640px, 1024px+ widths)
    - Test dark mode support (if applicable)
    - Test accessibility: keyboard navigation, screen reader labels
    - Test cache behavior: Load page, make transaction, verify auto-refresh
  - [ ] 4.7 Documentation updates
    - Update `/packages/web/README.md` with analytics components
    - Document analytics API endpoints in `/docs/api/` (if needed)
    - Add analytics module to backend architecture docs
    - Document cache strategy and invalidation rules
    - Include usage examples in component documentation

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 16-34 tests total)
- No more than 10 additional integration tests added
- API response times meet performance targets (<500ms cached, <2s cold)
- Chart render times <200ms for 12-month data
- Dashboard loads in <3s total (including lazy-loaded components)
- Manual testing checklist 100% complete
- Documentation updated

---

## Execution Order

Recommended implementation sequence:
1. **Backend Infrastructure** (Task Group 1) - Analytics module, repositories, use cases
2. **API Layer** (Task Group 2) - Controllers, DTOs, OpenAPI/SDK generation
3. **Frontend Components** (Task Group 3) - Dashboard, charts, hooks, integration
4. **Testing & Optimization** (Task Group 4) - Integration tests, performance validation, documentation

## Critical Path

The following tasks are on the critical path and block other work:
- Task 1.0: Backend analytics module (blocks Task 2.0 and 3.0)
- Task 2.0: API endpoints (blocks Task 3.0)
- Task 3.0: Frontend dashboard (blocks Task 4.0)

## Dependencies Map

```
Task 1 (Backend) → Task 2 (API) → Task 3 (Frontend) → Task 4 (Testing)
                                       ↓
                              Task 3.11 (Cache invalidation)
```

## Performance Targets Summary

- **API Response Time:** <500ms (cached), <2s (cold start)
- **Chart Render Time:** <200ms for 12-month datasets
- **Dashboard Load Time:** <3s total (including lazy-loaded components)
- **Cache TTL:** Summary (1h), Trends (24h), Merchants (1h)
- **Bundle Size:** Recharts code-split to avoid bloating main bundle

## Technology Stack Summary

**Backend:**
- NestJS (analytics module)
- Prisma ORM (aggregation queries)
- Redis (caching layer)
- PostgreSQL (PointLedger, Transaction, Business tables)

**Frontend:**
- React (components)
- TanStack Query (data fetching)
- Recharts (charts library - lazy loaded)
- shadcn/ui (Card, Tabs, Skeleton, Progress components)
- Tailwind CSS (responsive design)
- Vite (bundler with code splitting)

**Shared:**
- TypeScript
- shared-types package (DTOs)

## Notes

- **Test-Driven Approach:** Each task group starts with writing 2-8 focused tests (x.1 sub-task) and ends with running ONLY those tests
- **Incremental Delivery:** After Task Group 2, backend is functional and can be tested with tools like Postman or cURL
- **Reuse Existing Patterns:** Follow WalletBalance.tsx, useWallet.ts, PrismaLedgerRepository patterns extensively
- **Performance First:** Implement caching, lazy loading, and optimized queries from the start
- **Responsive Design:** Test on mobile (320px), tablet (640px), desktop (1024px+) throughout development
- **Cultural Sensitivity:** Use Bolivian design aesthetic for tier badges and positive/aspirational messaging
