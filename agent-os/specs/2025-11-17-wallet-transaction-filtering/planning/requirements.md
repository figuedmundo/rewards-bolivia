# Requirements: Wallet Transaction Filtering

## Overview

This feature enhances the existing wallet transaction history display with comprehensive filtering, search, and export capabilities. Users will be able to quickly find specific transactions through multiple filter criteria, search functionality, and export filtered results to CSV for record-keeping or analysis.

**Primary Goals:**
- Enable users to efficiently navigate large transaction histories
- Provide flexible filtering across multiple dimensions (date, type, amount, merchant)
- Allow users to export transaction data for offline analysis
- Maintain sub-1.5 second performance in line with platform standards

**Context:**
Builds on the recently implemented wallet UI components (feature/fe-wallet branch) with SDK integration and TanStack Query. The backend already supports filter parameters via the `GET /api/ledger/entries` endpoint.

## User Stories

1. **As a user**, I want to filter my transaction history by date range, so that I can review transactions from specific time periods (e.g., last month, last quarter).

2. **As a user**, I want to filter transactions by type (earn, redeem, transfer, burn), so that I can quickly see all points I've earned or redeemed.

3. **As a user**, I want to search for transactions by merchant name, so that I can find all interactions with a specific business.

4. **As a user**, I want to export my filtered transaction history to CSV, so that I can keep records for personal budgeting or tax purposes.

5. **As a mobile user**, I want an intuitive filtering interface optimized for small screens, so that I can easily filter transactions on the go.

## Filter Specifications

### Date Range Filter

**UI Component:** Date range picker (shadcn/ui Calendar component)

**Options:**
- Quick presets: Last 7 days, Last 30 days, Last 90 days (default), This year, All time
- Custom range: Start date and end date pickers

**Default Value:** Last 90 days (balances performance with typical user needs)

**Behavior:**
- Selecting a preset immediately applies the date range
- Custom date selection requires both start and end dates
- End date cannot be before start date (validation)
- Date range persists during session unless cleared

### Transaction Type Filter

**Options:**
- EARN: Points earned from purchases/activities
- REDEEM: Points redeemed for rewards
- ADJUSTMENT: Manual point adjustments (admin corrections)
- BURN: Points expired or removed from circulation

**UI Component:** Multi-select checkboxes or button group

**Default Value:** All types selected (no filtering)

**Behavior:**
- Multiple types can be selected simultaneously (AND logic between filters, OR logic within type filter)
- Selecting no types should show all transactions (equivalent to all selected)
- Type filter combines with other filters using AND logic

### Amount Range Filter

**UI Component:** Two numeric input fields (Min and Max)

**Behavior:**
- Min value: Optional numeric input (positive or negative numbers allowed)
- Max value: Optional numeric input (positive or negative numbers allowed)
- Validation: Max must be greater than Min if both are specified
- Empty fields mean "no limit" for that boundary
- Values can be negative (for redemptions) or positive (for earnings)

**Example Use Cases:**
- Find large transactions: Min = 1000, Max = empty
- Find small redemptions: Min = -100, Max = -1
- Find specific range: Min = 50, Max = 200

### Merchant/Business Filter

**UI Component:** Search input with autocomplete/suggestions

**Data Source:**
- Populate from unique business names in user's transaction history
- Query backend for distinct business names associated with user's transactions

**Behavior:**
- Debounced search input (300-500ms delay after typing stops)
- Autocomplete suggestions appear after 2+ characters typed
- Case-insensitive partial matching
- Selecting a suggestion applies the filter immediately
- Clear button to remove merchant filter

**Performance Consideration:**
- Autocomplete limited to top 10 matching merchants
- Results prioritized by transaction frequency or recency

## Search Functionality

**Implementation:**
- Global search input field above or within filter controls
- Searches across merchant/business names and transaction IDs
- Debounced input (300-500ms delay) to reduce API calls
- Instant filtering as user types (after debounce)

**Search Scope:**
- Business/merchant name (primary)
- Transaction ID (for customer support reference)

**Behavior:**
- Search combines with active filters using AND logic
- Clear button to reset search
- Search term persists during filter changes
- Minimum 2 characters to trigger search (optional UX enhancement)

## Export Functionality

### CSV Export

**Trigger:** "Export CSV" button in filter modal or action menu

**Columns (in order):**
1. **Date**: Full timestamp (YYYY-MM-DD HH:mm:ss format)
2. **Business**: Merchant name or transfer description
3. **Type**: Transaction type (EARN, REDEEM, ADJUSTMENT, BURN)
4. **Points**: Point value (positive for earned, negative for redeemed/sent)
5. **Transaction ID**: Unique identifier for customer support reference

**Filename Format:** `historial-rewards-bolivia-YYYY-MM-DD.csv`
- Example: `historial-rewards-bolivia-2025-11-17.csv`
- YYYY-MM-DD represents the export date (not filter date range)

**Behavior:**
- Export includes only transactions matching current filters
- Export respects any active date range, type, amount, or merchant filters
- Browser initiates file download when export completes
- Loading indicator shown during CSV generation
- Success/error feedback displayed after export attempt

**Implementation Notes:**
- CSV generation happens client-side for small datasets (<1000 rows)
- For large datasets, consider server-side generation or chunked downloads
- Proper CSV escaping for business names containing commas or quotes
- UTF-8 encoding to support international characters

**Justification:**
Provides all UI-visible information plus Transaction ID for support purposes. Excludes internal fields (hashes, complex metadata) to keep export clean and focused for end-user consumption.

## UI/UX Requirements

### Desktop/Tablet Layout

**Filter Button:**
- Primary button labeled "Filter" or "Filter Transactions" with filter icon
- Positioned above transaction list, aligned right or in header
- Badge indicator showing count of active filters (e.g., "Filter (3)")

**Filter Modal/Sheet:**
- Opens as a modal dialog (desktop) or side sheet (tablet)
- Width: 400-600px for optimal layout of filter controls
- Contains all filter controls in scrollable container
- Actions: "Apply Filters" (primary), "Clear All" (secondary), "Close/Cancel"
- Apply button applies filters and closes modal
- Clear All resets all filters to defaults

### Mobile Layout

**Filter Button:**
- Floating action button (FAB) or toolbar button
- Badge showing active filter count

**Filter Modal:**
- Full-screen bottom sheet or modal for optimal mobile UX
- Slide-up animation from bottom
- Header with "Filters" title and close button
- Scrollable content area for filter controls
- Fixed footer with "Apply" and "Clear All" buttons
- Apply button applies filters and closes sheet

### Active Filter Display

**Filter Pills/Tags:**
- Display above transaction list, below filter button
- Each active filter shown as a removable pill/tag
- Examples: "Last 30 days ×", "Type: EARN ×", "Amount: 100-500 ×"
- Click "×" on pill to remove that specific filter
- "Clear All" link to remove all filters at once

**Visual Design:**
- Pills use subdued colors (not primary brand color) to avoid visual clutter
- Wrap to multiple lines on narrow screens
- Animate in/out when filters added/removed

### Filter Modal Layout (Internal Organization)

**Suggested Order:**
1. **Search Input** (top, most frequently used)
2. **Date Range Filter** (second, common use case)
3. **Transaction Type Filter** (checkboxes or button group)
4. **Amount Range Filter** (min/max inputs side by side)
5. **Merchant Filter** (autocomplete search)
6. **Export Button** (at bottom, after filters applied)

**Spacing:**
- Clear visual separation between filter sections
- Labels for each filter section
- Consistent padding and spacing using Tailwind utilities

## Performance Requirements

### Default Date Range
- **Last 90 days**: Balances data completeness with query performance
- Reduces initial load time compared to "All time"
- Covers typical user needs for recent transaction review

### Pagination Strategy
- **Preferred Approach**: Infinite scroll with "Load More" button
- Initial load: 20-50 transactions
- Load More: Additional 20-50 transactions per click/scroll
- TanStack Query infinite queries for seamless pagination

**Rationale:**
- Balances performance (smaller initial payload) with UX (easy browsing)
- "Load More" button gives users control over data loading
- Avoids overwhelming UI with thousands of rows

### Result Limit Warnings
- **Threshold**: Display warning if filtered results exceed 1000 transactions
- **Warning Message**: "Showing first 1000 results. Use filters to narrow down your search."
- **Placement**: Above transaction list, below filter pills
- **Purpose**: Set user expectations and encourage filter refinement

### Debouncing
- **Search Input**: 300-500ms debounce after user stops typing
- **Merchant Autocomplete**: 300-500ms debounce for API queries
- **Implementation**: Use lodash debounce or custom React hook

**Rationale:**
- Reduces unnecessary API calls during typing
- Improves perceived performance
- Reduces backend load

## Filter Combination Logic

### AND Logic Between Filters
All active filters are combined with AND logic, meaning results must match ALL filter criteria.

**Example Scenarios:**

1. **Date Range + Type Filter:**
   - Date: Last 30 days
   - Type: EARN
   - **Result**: Only EARN transactions from the last 30 days

2. **Type + Amount Range:**
   - Type: REDEEM
   - Amount: -500 to -100
   - **Result**: Only REDEEM transactions with point values between -500 and -100

3. **Date + Type + Merchant:**
   - Date: Last 90 days
   - Type: EARN
   - Merchant: "Starbucks"
   - **Result**: Only points earned at Starbucks in the last 90 days

4. **Search + All Filters:**
   - Search: "coffee"
   - Date: This year
   - Type: EARN, REDEEM
   - Amount: 50 to 500
   - **Result**: EARN or REDEEM transactions this year with amounts 50-500 at merchants matching "coffee"

### OR Logic Within Type Filter
When multiple transaction types are selected, they use OR logic (show EARN OR REDEEM).

## Technical Considerations

### Backend Integration
- **Existing API**: `GET /api/ledger/entries` already supports filter parameters
- Query parameters expected: `accountId`, `transactionType`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `search`
- Backend returns paginated results with total count metadata
- No backend changes required (confirm parameter support during implementation)

### Frontend Implementation
- **Data Fetching**: TanStack Query for data fetching, caching, and pagination
- **State Management**: React state for filter modal UI, TanStack Query for server state
- **URL State Management** (optional enhancement): Store filter state in URL query parameters for shareable filter states
  - Enables users to bookmark/share filtered views
  - Preserves filters on page refresh
  - Implementation: Use URLSearchParams or routing library (React Router)

### Debounce Implementation
- Use lodash `debounce` utility or custom React hook (`useDebouncedValue`)
- Apply to search input and merchant autocomplete
- Configure 300-500ms delay based on testing and user feedback

### Component Reusability
- Leverage existing shadcn/ui components: Button, Input, Calendar, Sheet, Dialog, Badge
- Create reusable filter components that could be adapted for other list views (future business transaction views)
- Follow project conventions: components in `packages/web/src/components/`

### CSV Export Implementation
- Client-side generation using libraries like `papaparse` or custom CSV builder
- Handle special characters (commas, quotes) with proper escaping
- UTF-8 BOM for Excel compatibility (optional)
- Trigger browser download using blob URLs or anchor element download attribute

## Out of Scope

The following features are explicitly excluded from this implementation to maintain the S (2-3 days) effort estimate:

1. **Saved Filter Presets**: Ability to save and name custom filter combinations for quick access
2. **Filter History**: Tracking or suggesting previously used filter combinations
3. **Automatic Recurring Transaction Detection**: Identifying and grouping recurring transactions
4. **Advanced Export Formats**: PDF, Excel (.xlsx), or other formats beyond CSV
5. **Bulk Transaction Actions**: Selecting multiple transactions for bulk operations
6. **Transaction Categorization**: User-defined categories or tags for transactions
7. **Charts/Visualizations**: Graphs or charts of filtered transaction data
8. **Email/Schedule Exports**: Automated or scheduled report generation

These features may be considered for future enhancements based on user feedback and demand.

## Success Criteria

This feature will be considered successful when:

1. **Performance Metrics:**
   - Transaction list filtering completes in <1.5 seconds (90th percentile)
   - CSV export generates in <3 seconds for datasets up to 1000 rows
   - Search/filter interactions feel instant (perceived performance)

2. **Functional Completeness:**
   - All four filter types (date, type, amount, merchant) work correctly in isolation
   - Multiple filters combine correctly using AND logic
   - Search functionality works across merchant names and transaction IDs
   - CSV export includes correct data with proper formatting

3. **User Experience:**
   - Filter modal/sheet is accessible and intuitive on both desktop and mobile
   - Active filters are clearly displayed with removal options
   - Filter state persists during user session
   - Loading states and error messages provide clear feedback

4. **Code Quality:**
   - Components follow project naming conventions and structure
   - TypeScript types properly defined for filter state and API parameters
   - Unit tests cover filter logic and CSV generation (70% coverage minimum)
   - Integration tests verify API parameter passing and response handling

5. **Accessibility:**
   - Filter controls are keyboard navigable
   - Screen reader announcements for filter changes and result counts
   - Focus management when opening/closing filter modal

## Open Questions

The following items should be clarified during implementation:

1. **Backend API Confirmation:**
   - Verify exact query parameter names supported by `GET /api/ledger/entries`
   - Confirm if merchant/business search requires separate endpoint or can be done via main query
   - Check if backend supports combined filters or if client-side filtering is needed for some criteria

2. **Merchant Autocomplete Data:**
   - Should merchant list be fetched separately or extracted from transaction results?
   - Is there a dedicated endpoint for fetching unique merchant names for a user?

3. **URL State Implementation:**
   - Should filter state be stored in URL for shareability? (Nice-to-have, may increase scope)
   - If yes, what encoding format for filter parameters?

4. **CSV Large Dataset Handling:**
   - At what transaction count should we switch from client-side to server-side CSV generation?
   - Should we impose a hard limit on export size (e.g., max 5000 transactions)?

5. **Mobile UX Decision:**
   - Bottom sheet vs. full-screen modal for mobile filter interface?
   - Recommend: Bottom sheet for better mobile UX patterns (test with users if possible)

6. **Filter Persistence:**
   - Should filters persist across user sessions (localStorage) or only during current session?
   - Recommend: Session-only for initial implementation, add persistence as enhancement

These questions should be resolved through code inspection, API testing, and UX design review during the implementation phase.
