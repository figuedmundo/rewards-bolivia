# Specification: Wallet Transaction Filtering

## Goal

Enable users to efficiently filter and search their transaction history using date range, transaction type, amount range, and merchant filters, with CSV export capabilities. This feature enhances the existing wallet UI to support large transaction histories while maintaining sub-1.5 second performance targets.

## User Stories

- As a user, I want to filter my transaction history by date range, so that I can review transactions from specific time periods (e.g., last month, last quarter)
- As a user, I want to filter transactions by type (earn, redeem, burn, adjustment), so that I can quickly see all points I've earned or redeemed
- As a user, I want to export my filtered transaction history to CSV, so that I can keep records for personal budgeting or analysis
- As a mobile user, I want an intuitive filtering interface optimized for small screens, so that I can easily filter transactions on the go

## Specific Requirements

**Date Range Filtering**
- Implement quick presets: Last 7 days, Last 30 days, Last 90 days (default), This year, All time
- Support custom date range with start and end date pickers using shadcn Calendar component
- Default to Last 90 days to balance performance with user needs
- Validate end date is not before start date
- Date range persists during session unless cleared

**Transaction Type Multi-Select**
- Support filtering by EARN, REDEEM, ADJUSTMENT, BURN transaction types
- Use checkbox group or button group for multiple selection
- Multiple types combine with OR logic (show EARN OR REDEEM)
- Default to all types selected (no filtering)

**Amount Range Filtering**
- Provide Min and Max numeric input fields
- Support positive values (for earnings) and negative values (for redemptions/debits)
- Validate Max is greater than Min when both specified
- Empty fields mean no limit for that boundary

**Search with Debouncing**
- Implement global search across merchant/business names and transaction IDs
- Apply 300-500ms debounce to reduce API calls
- Support minimum 2 characters to trigger search
- Case-insensitive partial matching

**CSV Export Functionality**
- Generate client-side CSV with columns: Date, Business, Type, Points, Transaction ID
- Use filename format: historial-rewards-bolivia-YYYY-MM-DD.csv
- Export only transactions matching current filters
- Show loading indicator during generation
- Proper CSV escaping for special characters, UTF-8 encoding

**Filter UI Components**
- Filter button with badge showing active filter count
- Desktop: Modal dialog (400-600px width)
- Mobile: Bottom sheet with slide-up animation
- Active filter pills displayed above transaction list with individual removal
- Clear All option to reset filters

**Performance Requirements**
- Default to 90-day date range to limit initial query scope
- Implement pagination with 20-50 transactions per page
- Display warning when results exceed 1000 transactions
- All filter combinations use AND logic between different filter types

**Integration with Existing API**
- Extend existing GET /api/ledger/entries endpoint usage
- Current query parameters: accountId, transactionId, startDate, endDate, limit, offset
- Need to verify support for: type filter, amount range (minAmount/maxAmount), search parameter
- Maintain TanStack Query integration for caching and pagination

**Responsive Design**
- Mobile (< 640px): Bottom sheet, full-screen filter interface
- Tablet/Desktop (>= 640px): Modal dialog
- Filter pills wrap to multiple lines on narrow screens
- Transaction list optimized for small screens

**Empty States**
- No transactions found: Friendly message with filter adjustment suggestion
- No results after filtering: "No transactions match your criteria" with Clear Filters action

## Visual Design

No visual mockups provided in planning/visuals folder.

## Existing Code to Leverage

**TransactionHistory Component**
- Located at /packages/web/src/components/wallet/TransactionHistory.tsx
- Already implements pagination with Previous/Next buttons
- Uses TanStack Query via useTransactionHistory hook
- Displays loading skeletons and error states
- Can be extended to accept filter parameters and pass to useTransactionHistory hook

**useTransactionHistory Hook**
- Located at /packages/web/src/hooks/useWallet.ts
- Already calls walletApi.getLedgerEntries with LedgerQueryParams
- Supports accountId, page, pageSize, startDate, endDate, transactionId parameters
- Uses TanStack Query with caching (5-minute stale time)
- Can be extended to support additional filter parameters (type, amount range, search)

**walletApi.getLedgerEntries Method**
- Located at /packages/web/src/lib/wallet-api.ts
- Calls LedgerApi.ledgerControllerQueryEntries from generated SDK
- Currently supports: accountId, transactionId, startDate, endDate, pageSize, page
- Returns PaginatedLedgerResponse with entries array and total count
- May need extension for type filter, amount range, and search parameters

**Backend GET /api/ledger/entries Endpoint**
- Located at /packages/api/src/modules/transactions/infrastructure/controllers/ledger.controller.ts
- Supports accountId, transactionId, startDate, endDate, limit, offset query parameters
- Implements user authorization (users can only query their own entries)
- Returns paginated results with total count metadata
- May require extension to support transaction type filter, amount range, and merchant search

**shadcn/ui Components Available**
- Badge: For active filter pills and transaction type badges
- Button: For filter actions and pagination
- Table: Already used in TransactionHistory component
- Card: Can be used for filter modal layout
- Skeleton: Already used for loading states
- Note: Need to install Dialog, Sheet, Calendar, Input components if not present

**TransactionItem Component**
- Located at /packages/web/src/components/wallet/TransactionItem.tsx
- Uses Badge component with color mapping for transaction types
- Formats dates using toLocaleDateString
- Displays debit/credit with color coding (green for earnings, red for redemptions)
- Can be reference for transaction type display and formatting logic

## Out of Scope

- Saved filter presets: Ability to save and name custom filter combinations for quick access
- Filter history: Tracking or suggesting previously used filter combinations
- Automatic recurring transaction detection: Identifying and grouping recurring transactions
- Advanced export formats: PDF, Excel (.xlsx), or other formats beyond CSV
- Bulk transaction actions: Selecting multiple transactions for bulk operations
- Transaction categorization: User-defined categories or tags for transactions
- Charts/Visualizations: Graphs or charts of filtered transaction data
- Email/Schedule exports: Automated or scheduled report generation
- URL state persistence: Storing filter state in URL query parameters for shareable views
- LocalStorage persistence: Filter state persistence across user sessions
- Server-side CSV generation: Only client-side generation for this iteration
