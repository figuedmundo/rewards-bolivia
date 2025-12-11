# Specification: Wallet Analytics Dashboard

## Goal
Provide users with personalized insights into their point activity through interactive charts and metrics that show monthly trends, merchant behavior, tier progress, and actionable recommendations to increase engagement and point velocity.

## User Stories
- As a user, I want to see visual charts of my earning and spending patterns so that I understand where my points come from and how I'm using them
- As a user, I want to track my progress toward the next reward tier so that I feel motivated to earn more points
- As a user, I want personalized insights about my point activity so that I can make better decisions about earning and redeeming

## Specific Requirements

**Analytics Summary Metrics**
- Display 4 key metrics in a grid: Total Earned (period), Total Redeemed (period), Current Balance, Active Merchant Count
- Show percentage changes compared to previous period with visual indicators (up/down arrows, color coding)
- Calculate metrics server-side with efficient aggregation queries on PointLedger table
- Cache results in Redis with 1-hour TTL to minimize database load
- Support time period filters: 30 days, 6 months (default), 12 months, All time

**Monthly Trends Visualization**
- Line/Area chart showing monthly earn vs redeem amounts for selected period
- Group PointLedger entries by month using SQL date functions
- Display dual-axis chart with separate series for EARN (green) and REDEEM (red/orange) transactions
- Use Recharts library with responsive container and tooltip showing exact amounts
- Lazy load chart component to improve initial page load performance
- Show empty state with encouraging message when no data exists for period

**Merchant Analytics**
- Display top 3 merchants by transaction count and total points (separate tabs)
- Aggregate by Business name via JOIN on Transaction → Business tables
- Show merchant name, transaction count, total points, and percentage of overall activity
- Use horizontal bar chart for visual comparison between merchants
- Handle edge case where user has fewer than 3 merchants (show available merchants only)

**Tier Progress Indicator**
- Calculate current tier based on pointsBalance: Plata (0-999), Oro (1000-4999), Diamante (5000+)
- Display visual progress bar showing distance to next tier (if not already at max tier)
- Show tier badge with culturally-relevant icon/styling (Bolivian design aesthetic)
- Include points needed to reach next level and encouraging micro-copy
- For Diamante tier users, show achievement celebration instead of progress bar

**Points Velocity Metric**
- Calculate monthly earn rate trend: average points earned per month over selected period
- Display as single stat with sparkline showing trend direction
- Compare current month to average and show acceleration/deceleration indicator
- Use this metric in personalized insights to encourage consistent earning behavior

**Personalized Insights Engine**
- Generate 2-3 contextual insights based on threshold-based rules (no ML required for V1)
- Examples: "You're 250 points away from Oro tier!", "You've visited 3 new merchants this month", "Your redemption rate is healthy at 45%"
- Compute insights server-side to keep frontend lightweight
- Rotate insights based on what's most relevant: tier progress > merchant diversity > velocity changes
- Use positive, aspirational tone aligned with Bolivian cultural values

**Responsive Layout Design**
- Mobile (<640px): Single column, collapsible chart sections, horizontal scroll for merchant table
- Tablet (640-1024px): 2x2 grid for metrics, stacked charts
- Desktop (>1024px): Full 4-column grid for metrics, side-by-side charts
- Minimum 44px touch targets for all interactive elements
- Use shadcn/ui Card, Tabs, Skeleton components for consistency
- Implement skeleton loaders during data fetch to prevent layout shift

**Data Caching and Refresh Strategy**
- Use TanStack Query with 5-minute staleTime for analytics data
- Auto-refetch on window focus for real-time feeling
- Invalidate analytics cache when EARN or REDEEM transaction completes
- Backend caching in Redis: summary stats (1 hour), merchant data (1 hour), monthly aggregates (24 hours)
- Use query key pattern: `['analytics', userId, period]` for cache invalidation control

**Backend API Architecture**
- Create new `analytics` module following DDD structure: domain/application/infrastructure
- New use cases: `GetAnalyticsSummary`, `GetMerchantAnalytics`, `GetMonthlyTrends`
- Repository pattern: Define `IAnalyticsRepository` interface with aggregation methods
- Implementation: `PrismaAnalyticsRepository` using raw SQL for complex aggregations
- All endpoints under `/api/analytics/*` namespace with JWT authentication required

**Performance Requirements**
- API response time: <500ms with caching, <2s without cache (cold start)
- Chart render time: <200ms for datasets up to 12 months
- Lazy load chart library (Recharts) to reduce bundle size impact
- Use database indexes on PointLedger (accountId, createdAt) and Transaction (businessId) for fast aggregations
- Limit raw data fetch to maximum 1000 records per query

## Visual Design

No visual mockups provided. Follow existing wallet component patterns.

**Design Patterns to Follow**
- Card-based layout matching WalletBalance component structure
- Consistent spacing and typography from TransactionHistory
- Color scheme: Green for positive (EARN), Orange/Red for negative (REDEEM), Gray for neutral
- Icons from lucide-react library (TrendingUp, Users, Award, BarChart3)
- Tailwind utility classes for responsive breakpoints
- Dark mode support using Tailwind dark: variants
- Empty states with friendly illustrations or icons
- Loading states with animated skeletons

## Existing Code to Leverage

**WalletBalance Component**
- Card/CardHeader/CardContent layout pattern for consistent UI structure
- Loading skeleton pattern with data-testid attributes for testing
- Error handling with retry button functionality
- useWalletBalance hook pattern for TanStack Query integration

**TransactionHistory Component**
- FilterButton and FilterContainer patterns for date range selection
- Pagination controls with responsive touch targets (44px minimum)
- Empty state handling with filter-aware messaging
- CSV export pattern (can adapt for future analytics export feature)
- Active filter pills with removal functionality

**useWallet Hook**
- Query key factory pattern (walletKeys.all, walletKeys.balance, etc.)
- Optimistic updates with rollback on error
- Query invalidation after mutations (refetch pattern)
- staleTime and refetchOnWindowFocus configuration

**PrismaLedgerRepository**
- Aggregation methods: getTotalPointsIssued, getPointsRedeemedInLast30Days
- Date range filtering with dynamic where clause building
- Transaction JOIN pattern for business name resolution
- Pagination with total count using $transaction for consistency

**LedgerController**
- Query parameter parsing and validation patterns
- User authorization checks (user can only access own data unless admin)
- Date range validation (startDate <= endDate)
- Error handling with appropriate HTTP status codes (400, 401, 404)

## Out of Scope
- Predictive analytics or ML-based recommendations beyond simple threshold rules
- Comparison with other users or platform averages (leaderboards)
- PDF or image export of charts
- Custom date range picker (use preset periods only: 30d, 6m, 12m, all)
- Drill-down into individual transactions from charts (use existing TransactionHistory for details)
- Business-side analytics dashboard (this is user-facing only)
- Real-time streaming updates via WebSockets
- A/B testing of different insight messages
- Gamification achievements or badges system (separate epic)
- Export analytics data to external platforms
