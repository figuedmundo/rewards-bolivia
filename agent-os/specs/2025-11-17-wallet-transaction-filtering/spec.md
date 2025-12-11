# Specification: Wallet Transaction Filtering

## Goal
Enable users to efficiently filter, search, and export transaction history through a comprehensive filtering interface that supports date ranges, transaction types, amount ranges, merchant search, and CSV export while maintaining sub-1.5 second performance.

## User Stories
- As a user, I want to filter my transaction history by date range, type, amount, and merchant so that I can quickly find specific transactions
- As a user, I want to export my filtered transaction history to CSV so that I can keep records for personal budgeting or tax purposes

## Specific Requirements

**Date Range Filtering**
- Support preset options: Last 7 days, Last 30 days, Last 90 days (default), This year, All time
- Allow custom date range selection with start and end date pickers using shadcn/ui Calendar component
- Default to Last 90 days on initial load for optimal performance
- Validate that end date is not before start date
- Immediately apply filter when preset is selected
- Persist date range selection during user session

**Transaction Type Filtering**
- Support filtering by EARN, REDEEM, ADJUSTMENT, and BURN transaction types
- Implement multi-select using checkboxes or button group UI pattern
- Default to all types selected (no filtering) on initial load
- Apply OR logic within selected types (show EARN OR REDEEM if both selected)
- Combine with other filters using AND logic (date AND type AND amount)
- Visual indication of which types are currently selected

**Amount Range Filtering**
- Support minimum and maximum amount input fields (numeric)
- Allow positive values for earnings and negative values for redemptions
- Validate that max value is greater than min value when both specified
- Empty fields indicate "no limit" for that boundary
- Support use cases: large transactions (min only), small redemptions (both negative), specific range (both specified)

**Merchant/Business Search and Global Search**
- Implement debounced search input (300-500ms delay) to reduce API calls
- Search across merchant/business names and transaction IDs
- Apply case-insensitive partial matching on backend
- Display search term as removable filter pill
- Combine search with other active filters using AND logic
- Clear button to reset search term

**CSV Export Functionality**
- Export button in filter modal/sheet that exports current filtered results
- CSV columns in order: Date (YYYY-MM-DD HH:mm:ss), Business, Type, Points (signed), Transaction ID
- Filename format: historial-rewards-bolivia-YYYY-MM-DD.csv (date is export date, not filter date)
- Client-side CSV generation using proper escaping for commas, quotes, and newlines
- UTF-8 BOM for Excel compatibility
- Loading indicator during export generation
- Confirmation dialog if exporting more than 1000 transactions
- Success/error feedback after export attempt

**Filter UI/UX - Desktop/Tablet**
- Filter button with badge showing count of active filters (e.g., "Filter (3)")
- Modal dialog (desktop) or side sheet (tablet) with 400-600px width
- Scrollable content area containing all filter controls
- Action buttons: "Apply Filters" (primary), "Clear All" (secondary), "Close/Cancel"
- Apply button applies filters, closes modal, and resets pagination to page 1
- Clear All resets all filters to defaults (Last 90 days, all types)

**Filter UI/UX - Mobile**
- Full-screen bottom sheet with slide-up animation
- Header with "Filters" title and close button
- Scrollable content area for filter controls
- Fixed footer with "Apply" and "Clear All" buttons positioned for thumb access
- Touch-optimized controls with minimum 44px tap targets

**Active Filter Display**
- Display filter pills/tags above transaction list, below filter button
- Each active filter shown as removable pill with × icon
- Examples: "Last 30 days ×", "Type: EARN ×", "Amount: 100-500 ×", "Search: \"coffee\" ×"
- Click × on individual pill to remove that specific filter
- "Clear All" link to remove all filters at once
- Pills wrap to multiple lines on narrow screens with smooth animations

**Pagination and Performance**
- Initial load: 10-20 transactions per page
- Pagination controls with Previous/Next buttons (touch-optimized 44px height on mobile)
- Reset to page 1 whenever filters change
- Display warning banner if total results exceed 1000 transactions with suggestion to refine filters
- Maintain target of sub-1.5 second filter operations using TanStack Query caching

**Filter Modal Layout and Order**
- Search Input at top (most frequently used)
- Date Range Filter second (common use case)
- Transaction Type Filter third (checkboxes or button group)
- Amount Range Filter fourth (min/max inputs side by side)
- Export CSV button at bottom (after filters applied)
- Clear visual separation between sections with consistent Tailwind spacing

## Visual Design
No visual mockups provided in planning/visuals folder.

## Existing Code to Leverage

**TransactionHistory Component**
- Core transaction list component already implements filtering, pagination, CSV export
- Located at packages/web/src/components/wallet/TransactionHistory.tsx
- Uses useState for filter state, TanStack Query for data fetching
- Handles filter application, clearing, and individual filter removal
- Implements CSV export with large dataset confirmation
- Reuse this as the main component, it already meets all requirements

**Filter Components in packages/web/src/components/wallet/filters/**
- DateRangeFilter: Date preset buttons and custom range picker using shadcn/ui Calendar
- TransactionTypeFilter: Multi-select checkboxes for transaction types with visual state
- AmountRangeFilter: Min/max numeric inputs with validation
- SearchInput: Debounced search with clear button
- FilterPill: Reusable pill component with remove functionality
- All components already built and tested, ready to use

**FilterContainer, FilterModal, FilterSheet Components**
- FilterContainer: Responsive wrapper that renders modal (desktop) or sheet (mobile)
- FilterModal: Dialog-based desktop filter interface with scrollable content
- FilterSheet: Bottom sheet mobile filter interface with slide-up animation
- Located at packages/web/src/components/wallet/
- Already implements responsive behavior, apply/clear actions, and export button placement

**Filter Utility Functions (packages/web/src/lib/filter-utils.ts)**
- getDateRangeForPreset: Calculates start/end dates for presets (7d, 30d, 90d, year, all)
- formatActiveFilters: Converts filter state to array of ActiveFilter objects for pill rendering
- getActiveFilterCount: Counts active filters for badge display
- removeFilter: Removes specific filter while preserving others
- getDefaultFilters: Returns default filter state (Last 90 days, all types)
- Comprehensive utility coverage, reuse for all filter state management

**CSV Export Utilities (packages/web/src/lib/csv-utils.ts)**
- generateCSV: Converts ledger entries to CSV string with proper escaping (RFC 4180)
- downloadCSV: Triggers browser download with UTF-8 BOM for Excel compatibility
- getCSVFilename: Generates filename with current date (historial-rewards-bolivia-YYYY-MM-DD.csv)
- Handles special characters (commas, quotes, newlines), proper date/amount formatting
- Already implements all CSV requirements, use as-is

**Backend API Endpoint (packages/api/src/modules/transactions/infrastructure/controllers/ledger.controller.ts)**
- GET /api/ledger/entries supports all required query parameters
- Parameters: accountId, transactionId, startDate, endDate, type (comma-separated), minAmount, maxAmount, search, limit, offset
- Pagination uses limit/offset (convert to page/pageSize in frontend: offset = (page-1) * pageSize)
- Returns paginated response with entries array, total count, limit, offset
- Authorization ensures users can only query their own transactions
- Validation for date ranges, amount ranges, transaction types already implemented

**TanStack Query Integration (packages/web/src/hooks/useWallet.ts)**
- useTransactionHistory hook wraps walletApi.getLedgerEntries with TanStack Query
- Caching with 5-minute staleTime for performance
- Placeholder data during pagination for smooth transitions
- Query key includes all filter parameters for proper cache invalidation
- Reuse this hook for all transaction fetching with filter params

## Out of Scope
- Saved filter presets with user-defined names for quick access
- Filter history tracking or suggestions based on previously used filters
- Automatic recurring transaction detection and grouping
- Advanced export formats beyond CSV (PDF, Excel .xlsx)
- Bulk transaction selection for bulk operations
- User-defined transaction categorization or tagging
- Charts or visualizations of filtered transaction data
- Email/scheduled report generation or automated exports
- URL state management for shareable filter states (may be added as enhancement)
- Merchant autocomplete suggestions (search is full-text, not autocomplete)
