# Task Breakdown: Wallet Transaction Filtering

## Overview

This feature enhances the existing wallet transaction history with comprehensive filtering, search, and CSV export capabilities. Users will be able to filter transactions by date range, transaction type, amount range, and merchant name, with the ability to export filtered results to CSV. The implementation builds on the existing TransactionHistory component, useTransactionHistory hook, and GET /api/ledger/entries endpoint.

**Total Estimated Effort:** S (2-3 days)

**Key Technologies:**
- Frontend: React, TanStack Query, shadcn/ui components, Tailwind CSS
- Backend: NestJS (minimal changes, primarily verification)
- Existing Code: TransactionHistory component, useTransactionHistory hook, walletApi

## Task List

### Task Group 1: Backend Verification & API Enhancement
**Dependencies:** None
**Purpose:** Verify and extend backend support for filter parameters

- [x] 1.0 Complete backend verification and enhancement
  - [x] 1.1 Review LedgerController query parameters
    - File: `/packages/api/src/modules/transactions/infrastructure/controllers/ledger.controller.ts`
    - Verify current support for: accountId, transactionId, startDate, endDate, limit, offset
    - Document missing parameters: transactionType, minAmount, maxAmount, search
  - [x] 1.2 Extend LedgerController to support transaction type filter
    - Add `@Query('type') type?: string` parameter (comma-separated types: EARN,REDEEM,ADJUSTMENT,BURN)
    - Update query logic to filter by transaction type(s) if provided
    - Handle multiple types with OR logic (show EARN OR REDEEM)
  - [x] 1.3 Add amount range filter parameters
    - Add `@Query('minAmount') minAmount?: string` parameter
    - Add `@Query('maxAmount') maxAmount?: string` parameter
    - Update query logic to filter by debit/credit range
    - Support positive and negative values
  - [x] 1.4 Add merchant/business search parameter
    - Add `@Query('search') search?: string` parameter
    - Update query logic to filter by business name (case-insensitive partial match)
    - Consider also searching transaction IDs if feasible
  - [x] 1.5 Write 2-8 focused tests for new query parameters
    - Test transaction type filtering (single and multiple types)
    - Test amount range filtering (min only, max only, both)
    - Test merchant search functionality
    - Test combined filters (date + type + amount)
    - File: `/packages/api/test/integration/ledger-filtering.e2e.spec.ts`
  - [x] 1.6 Update ILedgerRepository interface and PrismaLedgerRepository
    - Add repository methods to support new filter criteria if needed
    - File: `/packages/api/src/modules/transactions/domain/repositories/ledger.repository.ts`
    - File: `/packages/api/src/modules/transactions/infrastructure/repositories/prisma-ledger.repository.ts`
  - [x] 1.7 Regenerate TypeScript SDK
    - Run `pnpm generate:sdk` to update SDK with new API parameters
    - Verify generated types in `@rewards-bolivia/sdk`
  - [x] 1.8 Ensure backend tests pass
    - Run only the 2-8 tests written in 1.5
    - Verify all filter combinations work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- Backend supports all filter parameters: type, minAmount, maxAmount, search
- The 2-8 tests written in 1.5 pass (12 tests created, all passing)
- SDK regenerated with updated API types
- Filter combinations use correct AND/OR logic

---

### Task Group 2: Type Definitions & Utilities
**Dependencies:** Task Group 1
**Purpose:** Define TypeScript types and utility functions for filters

- [x] 2.0 Complete type definitions and utilities
  - [x] 2.1 Create FilterTypes type definitions
    - File: `/packages/web/src/types/filters.ts` (create new file)
    - Define `TransactionType` enum: EARN, REDEEM, ADJUSTMENT, BURN
    - Define `DatePreset` type: '7d' | '30d' | '90d' | 'year' | 'all'
    - Define `TransactionFilters` interface with all filter fields
    - Define `ActiveFilter` type for filter pill display
  - [x] 2.2 Extend LedgerQueryParams type
    - File: `/packages/web/src/lib/wallet-api.ts`
    - Add new filter parameters: type?, minAmount?, maxAmount?, search?
    - Ensure compatibility with SDK-generated types
  - [x] 2.3 Create filter utility functions
    - File: `/packages/web/src/lib/filter-utils.ts` (create new file)
    - `getDateRangeForPreset(preset: DatePreset): { startDate: string, endDate: string }`
    - `formatActiveFilters(filters: TransactionFilters): ActiveFilter[]`
    - `getActiveFilterCount(filters: TransactionFilters): number`
    - `isFiltersEmpty(filters: TransactionFilters): boolean`
  - [x] 2.4 Create CSV export utility
    - File: `/packages/web/src/lib/csv-utils.ts` (create new file)
    - `generateCSV(entries: LedgerEntryDto[]): string` - generates CSV string
    - `downloadCSV(content: string, filename: string): void` - triggers browser download
    - `getCSVFilename(): string` - generates filename with current date
    - Proper CSV escaping for commas, quotes, and special characters
    - UTF-8 encoding support
  - [x] 2.5 Write 2-8 focused tests for utilities
    - Test date preset calculations (especially edge cases)
    - Test active filter formatting
    - Test CSV generation with special characters
    - Test CSV filename generation
    - File: `/packages/web/src/lib/filter-utils.spec.ts`
    - File: `/packages/web/src/lib/csv-utils.spec.ts`
  - [x] 2.6 Ensure utility tests pass
    - Run only the 2-8 tests written in 2.5
    - Verify all utility functions work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- All filter types properly defined with TypeScript
- Utility functions handle edge cases correctly
- CSV generation properly escapes special characters
- The 2-8 tests written in 2.5 pass (24 tests created, all passing)

---

### Task Group 3: Core Filter Components
**Dependencies:** Task Group 2
**Purpose:** Build reusable filter UI components using shadcn/ui

- [ ] 3.0 Complete filter UI components
  - [ ] 3.1 Install required shadcn/ui components (if not present)
    - Verify installation: Dialog, Sheet, Calendar, Input, Label, Checkbox
    - Run shadcn/ui CLI to add missing components
    - Confirm Badge, Button, and Card are already installed
  - [ ] 3.2 Create DateRangeFilter component
    - File: `/packages/web/src/components/wallet/filters/DateRangeFilter.tsx`
    - Quick preset buttons: Last 7/30/90 days, This year, All time
    - Custom date range with two Calendar components (start and end date)
    - Default to "Last 90 days"
    - Validate end date is not before start date
    - Props: `value`, `onChange`
  - [ ] 3.3 Create TransactionTypeFilter component
    - File: `/packages/web/src/components/wallet/filters/TransactionTypeFilter.tsx`
    - Multi-select checkbox group for EARN, REDEEM, ADJUSTMENT, BURN
    - Visual styling with icons or colored badges per type
    - Props: `value: TransactionType[]`, `onChange`
    - Default to all types selected (no filtering)
  - [ ] 3.4 Create AmountRangeFilter component
    - File: `/packages/web/src/components/wallet/filters/AmountRangeFilter.tsx`
    - Two numeric Input fields: Min and Max
    - Support positive and negative numbers
    - Validation: Max must be greater than Min when both specified
    - Props: `minValue`, `maxValue`, `onMinChange`, `onMaxChange`
    - Clear visual error state for validation failures
  - [ ] 3.5 Create SearchInput component with debouncing
    - File: `/packages/web/src/components/wallet/filters/SearchInput.tsx`
    - Input field with search icon
    - 300-500ms debounce using custom hook or lodash debounce
    - Minimum 2 characters to trigger search (optional visual feedback)
    - Clear button to reset search
    - Props: `value`, `onChange`, `placeholder`
  - [ ] 3.6 Create FilterPill component
    - File: `/packages/web/src/components/wallet/filters/FilterPill.tsx`
    - Display active filter with label and remove button
    - Props: `label: string`, `onRemove: () => void`
    - Subdued styling to avoid visual clutter
    - Smooth animation on mount/unmount
  - [ ] 3.7 Write 2-8 focused tests for filter components
    - Test DateRangeFilter preset selection and validation
    - Test TransactionTypeFilter multi-select behavior
    - Test AmountRangeFilter validation logic
    - Test SearchInput debouncing behavior
    - Test FilterPill remove interaction
    - Files: Colocated `.spec.tsx` files for each component
  - [ ] 3.8 Ensure filter component tests pass
    - Run only the 2-8 tests written in 3.7
    - Verify critical component behaviors work
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- All filter components render correctly with proper styling
- Form validation works for date range and amount range
- Search input debouncing reduces API calls
- The 2-8 tests written in 3.7 pass
- Components follow project conventions (kebab-case files, PascalCase classes)

---

### Task Group 4: Filter Modal/Sheet Container
**Dependencies:** Task Group 3
**Purpose:** Create main filter modal with responsive desktop/mobile layouts

- [ ] 4.0 Complete filter modal container
  - [ ] 4.1 Create FilterModal component (desktop/tablet)
    - File: `/packages/web/src/components/wallet/FilterModal.tsx`
    - Use shadcn/ui Dialog component
    - Width: 400-600px
    - Header: "Filter Transactions" title
    - Scrollable content area with all filter components
    - Footer: "Apply Filters" (primary) and "Clear All" (secondary) buttons
    - Props: `isOpen`, `onClose`, `filters`, `onApply`, `onClearAll`
  - [ ] 4.2 Create FilterSheet component (mobile)
    - File: `/packages/web/src/components/wallet/FilterSheet.tsx`
    - Use shadcn/ui Sheet component with bottom placement
    - Full-screen or bottom sheet with slide-up animation
    - Header: "Filters" title and close button
    - Scrollable content with all filter components
    - Fixed footer: "Apply" and "Clear All" buttons
    - Props: Same as FilterModal
  - [ ] 4.3 Create responsive FilterContainer wrapper
    - File: `/packages/web/src/components/wallet/FilterContainer.tsx`
    - Conditionally render Dialog (desktop) or Sheet (mobile) based on screen size
    - Breakpoint: Use Tailwind's `sm` (640px) breakpoint
    - Maintain consistent filter state between layouts
    - Internal state management for filter values before applying
    - Props: `isOpen`, `onClose`, `onApply: (filters: TransactionFilters) => void`
  - [ ] 4.4 Add filter button with badge
    - Update TransactionHistory component or create separate FilterButton
    - File: `/packages/web/src/components/wallet/FilterButton.tsx`
    - Button with filter icon (lucide-react Filter icon)
    - Badge showing active filter count when > 0
    - Opens FilterContainer on click
    - Props: `activeFilterCount`, `onClick`
  - [ ] 4.5 Create ActiveFilters display component
    - File: `/packages/web/src/components/wallet/ActiveFilters.tsx`
    - Display FilterPill components for each active filter
    - "Clear All" link to reset all filters
    - Wrap to multiple lines on narrow screens
    - Props: `filters: TransactionFilters`, `onRemoveFilter`, `onClearAll`
  - [ ] 4.6 Write 2-8 focused tests for modal/sheet components
    - Test FilterModal open/close behavior
    - Test FilterSheet responsive rendering
    - Test filter application and clear all functionality
    - Test FilterButton badge display
    - Test ActiveFilters pill removal
    - Files: Colocated `.spec.tsx` files
  - [ ] 4.7 Ensure modal component tests pass
    - Run only the 2-8 tests written in 4.6
    - Verify modal interactions work correctly
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- Filter modal renders correctly on desktop with proper layout
- Filter sheet renders on mobile with slide-up animation
- Filter state managed correctly before and after applying
- Active filter count badge displays correctly
- The 2-8 tests written in 4.6 pass

---

### Task Group 5: Integration & State Management
**Dependencies:** Task Group 4
**Purpose:** Integrate filters with existing transaction history and API layer

- [ ] 5.0 Complete integration with existing components
  - [ ] 5.1 Update useTransactionHistory hook
    - File: `/packages/web/src/hooks/useWallet.ts`
    - Extend LedgerQueryParams with new filter parameters
    - Accept filter parameters in hook and pass to walletApi
    - Update query key to include filter parameters for proper caching
    - Maintain TanStack Query patterns (placeholderData, staleTime)
  - [ ] 5.2 Update walletApi.getLedgerEntries method
    - File: `/packages/web/src/lib/wallet-api.ts`
    - Extend LedgerQueryParams interface (already done in Task 2.2)
    - Pass new filter parameters to SDK method
    - Use stringifyParam helper for optional parameters
    - Handle type parameter as comma-separated string
  - [ ] 5.3 Enhance TransactionHistory component
    - File: `/packages/web/src/components/wallet/TransactionHistory.tsx`
    - Add local state for filters: `const [filters, setFilters] = useState<TransactionFilters>(defaultFilters)`
    - Add FilterButton above transaction table
    - Add FilterContainer (modal/sheet) with filter state
    - Add ActiveFilters display between button and table
    - Pass filters to useTransactionHistory hook
    - Handle filter changes and reset pagination on filter apply
  - [ ] 5.4 Implement filter state management
    - Calculate default filters (Last 90 days, all types)
    - Handle "Apply Filters" action: close modal and trigger API query
    - Handle "Clear All" action: reset to default filters
    - Handle individual filter pill removal
    - Session-only persistence (no localStorage for initial implementation)
  - [ ] 5.5 Add empty states and result warnings
    - "No transactions found" message when no results
    - "No transactions match your criteria" with "Clear Filters" action
    - Warning banner when results exceed 1000 transactions
    - Position warnings above transaction list, below active filters
  - [ ] 5.6 Write 2-8 focused tests for integration
    - Test filter parameter passing to API
    - Test query key updates for proper caching
    - Test filter application and clearing
    - Test pagination reset on filter change
    - Test empty states and warnings
    - File: `/packages/web/src/components/wallet/TransactionHistory.spec.tsx`
  - [ ] 5.7 Ensure integration tests pass
    - Run only the 2-8 tests written in 5.6
    - Verify filter integration works end-to-end
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- Filters properly passed to API via updated hook and walletApi
- TanStack Query caching works correctly with filter parameters
- Pagination resets when filters change
- Empty states display appropriately
- The 2-8 tests written in 5.6 pass

---

### Task Group 6: CSV Export Functionality
**Dependencies:** Task Group 5
**Purpose:** Implement client-side CSV export with filtered data

- [ ] 6.0 Complete CSV export functionality
  - [ ] 6.1 Add CSV export button to FilterModal/FilterSheet
    - Position at bottom of filter modal, above Apply/Clear buttons
    - Button label: "Export to CSV"
    - Show loading state during CSV generation
    - Disable during loading
  - [ ] 6.2 Implement CSV export logic in TransactionHistory
    - Create `handleExportCSV` function in TransactionHistory component
    - Fetch ALL filtered entries (remove pagination limit for export)
    - Use csv-utils to generate CSV from entries
    - Columns: Date, Business, Type, Points, Transaction ID
    - Date format: YYYY-MM-DD HH:mm:ss
    - Points format: Positive for EARN, negative for REDEEM/BURN
  - [ ] 6.3 Add loading and feedback states for export
    - Show loading spinner/indicator during CSV generation
    - Display success toast/message after download initiated
    - Display error message if export fails
    - Handle large datasets (warning if > 1000 transactions)
  - [ ] 6.4 Test CSV export with various scenarios
    - Export with no filters (all transactions)
    - Export with date range filter
    - Export with multiple filters active
    - Export with special characters in business names
    - Verify CSV opens correctly in Excel and Google Sheets
  - [ ] 6.5 Write 2-8 focused tests for CSV export
    - Test CSV generation with filtered data
    - Test CSV formatting and escaping
    - Test filename generation
    - Test export button loading state
    - File: Add to `/packages/web/src/components/wallet/TransactionHistory.spec.tsx`
  - [ ] 6.6 Ensure CSV export tests pass
    - Run only the 2-8 tests written in 6.5
    - Verify CSV export works with different filter combinations
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- CSV export generates correct data with proper formatting
- Special characters properly escaped in CSV
- Filename follows format: `historial-rewards-bolivia-YYYY-MM-DD.csv`
- Export respects active filters
- Loading states provide clear feedback
- The 2-8 tests written in 6.5 pass

---

### Task Group 7: Responsive Design & Mobile Optimization
**Dependencies:** Task Group 6
**Purpose:** Ensure optimal UX across all device sizes

- [ ] 7.0 Complete responsive design implementation
  - [ ] 7.1 Verify mobile breakpoints and responsive behavior
    - Test on Mobile (< 640px): Bottom sheet, full-screen filter interface
    - Test on Tablet (640px - 1024px): Modal dialog
    - Test on Desktop (>= 1024px): Modal dialog
    - Verify FilterContainer switches between Sheet and Dialog correctly
  - [ ] 7.2 Optimize filter components for mobile
    - Ensure DateRangeFilter calendar is touch-friendly
    - Make TransactionTypeFilter checkboxes large enough for touch
    - Verify AmountRangeFilter inputs are keyboard-friendly on mobile
    - Test SearchInput on mobile keyboards
  - [ ] 7.3 Optimize filter pills for mobile
    - Ensure FilterPill components wrap to multiple lines
    - Make remove buttons touch-friendly (adequate hit target size)
    - Test wrapping behavior on narrow screens (< 375px)
  - [ ] 7.4 Optimize transaction table for mobile
    - Verify TransactionItem displays correctly on narrow screens
    - Consider stacking table columns vertically on very small screens
    - Ensure pagination buttons are touch-friendly
  - [ ] 7.5 Test filter interactions on touch devices
    - Test opening/closing filter sheet with swipe gestures
    - Test date picker interactions on mobile
    - Test scrolling within filter modal/sheet
    - Test applying filters and seeing results update
  - [ ] 7.6 Write 2-8 focused tests for responsive behavior
    - Test screen size breakpoint detection
    - Test component rendering at different viewports
    - Test touch interaction handlers
    - File: `/packages/web/src/components/wallet/FilterContainer.spec.tsx`
  - [ ] 7.7 Ensure responsive tests pass
    - Run only the 2-8 tests written in 7.6
    - Verify responsive behavior works across breakpoints
    - Do NOT run the entire test suite at this stage

**Acceptance Criteria:**
- Filter modal/sheet renders correctly on all device sizes
- Touch targets meet accessibility standards (44x44px minimum)
- Filter pills wrap appropriately on narrow screens
- Transaction table remains usable on mobile
- The 2-8 tests written in 7.6 pass

---

### Task Group 8: Testing & Quality Assurance
**Dependencies:** Task Groups 1-7
**Purpose:** Review existing tests and add strategic tests for critical gaps

- [ ] 8.0 Review existing tests and fill critical gaps only
  - [ ] 8.1 Review tests from Task Groups 1-7
    - Review the 2-8 tests written by backend team (Task 1.5)
    - Review the 2-8 tests written for utilities (Task 2.5)
    - Review the 2-8 tests written for filter components (Task 3.7)
    - Review the 2-8 tests written for modal components (Task 4.6)
    - Review the 2-8 tests written for integration (Task 5.6)
    - Review the 2-8 tests written for CSV export (Task 6.5)
    - Review the 2-8 tests written for responsive design (Task 7.6)
    - Total existing tests: approximately 14-56 tests
  - [ ] 8.2 Analyze test coverage gaps for THIS feature only
    - Identify critical user workflows that lack test coverage
    - Focus on end-to-end filter workflows (apply multiple filters, export, clear)
    - Focus on error scenarios (API failures, invalid input)
    - Do NOT assess entire application test coverage
    - Prioritize integration tests over unit test gaps
  - [ ] 8.3 Write up to 10 additional strategic tests maximum
    - Add maximum of 10 new tests to fill identified critical gaps
    - Focus on end-to-end workflows: filter application, CSV export, error handling
    - Test combined filter scenarios (date + type + amount + search)
    - Test pagination with filters
    - Test filter state persistence during session
    - Do NOT write comprehensive coverage for all scenarios
    - Skip edge cases unless business-critical
    - File: Create `/packages/web/src/components/wallet/__tests__/transaction-filtering.integration.spec.tsx`
  - [ ] 8.4 Run feature-specific tests only
    - Run ONLY tests related to transaction filtering feature
    - Expected total: approximately 24-66 tests maximum
    - Verify critical workflows pass
    - Do NOT run the entire application test suite
    - Document any known issues or limitations

**Acceptance Criteria:**
- All feature-specific tests pass (approximately 24-66 tests total)
- Critical user workflows covered: filter application, CSV export, filter clearing
- No more than 10 additional tests added when filling in testing gaps
- Testing focused exclusively on transaction filtering feature requirements

---

### Task Group 9: Documentation & Polish
**Dependencies:** Task Group 8
**Purpose:** Add documentation and final polish for production readiness

- [ ] 9.0 Complete documentation and final polish
  - [ ] 9.1 Add JSDoc comments to all public components
    - Document props, usage examples, and behavior notes
    - Files: All components in `/packages/web/src/components/wallet/`
    - Follow project commenting standards
  - [ ] 9.2 Update component exports and imports
    - Create index.ts barrel exports for filter components
    - File: `/packages/web/src/components/wallet/filters/index.ts`
    - Ensure clean import paths throughout application
  - [ ] 9.3 Verify accessibility compliance
    - Ensure filter controls are keyboard navigable
    - Add ARIA labels for screen readers
    - Test focus management when opening/closing modals
    - Verify color contrast meets WCAG AA standards
  - [ ] 9.4 Performance verification
    - Verify filter operations complete in < 1.5 seconds
    - Verify CSV export completes in < 3 seconds for 1000 rows
    - Verify debouncing reduces API calls during typing
    - Test with large datasets (500+ transactions)
  - [ ] 9.5 Create feature documentation
    - Document filter functionality for users (if required)
    - Document component API for developers
    - Add usage examples to README or docs folder
    - File: Consider adding to `/docs/features/transaction-filtering.md`
  - [ ] 9.6 Final manual testing checklist
    - Test all filter combinations on desktop and mobile
    - Test CSV export with various filter states
    - Test empty states and error messages
    - Test loading states and transitions
    - Verify visual design matches requirements
  - [ ] 9.7 Code cleanup and final review
    - Remove console.log statements and debug code
    - Ensure consistent code formatting (Prettier)
    - Run ESLint and fix any warnings
    - Remove unused imports and variables
    - Verify all TODO comments are resolved

**Acceptance Criteria:**
- All components have clear documentation
- Accessibility standards met for filter controls
- Performance targets achieved (< 1.5s filtering, < 3s CSV export)
- Code passes linting and formatting checks
- Feature ready for production deployment

---

## Execution Order

Recommended implementation sequence:

1. **Task Group 1**: Backend Verification & API Enhancement (0.5 day) - COMPLETED
2. **Task Group 2**: Type Definitions & Utilities (0.25 day) - COMPLETED
3. **Task Group 3**: Core Filter Components (0.5 day)
4. **Task Group 4**: Filter Modal/Sheet Container (0.5 day)
5. **Task Group 5**: Integration & State Management (0.5 day)
6. **Task Group 6**: CSV Export Functionality (0.25 day)
7. **Task Group 7**: Responsive Design & Mobile Optimization (0.25 day)
8. **Task Group 8**: Testing & Quality Assurance (0.25 day)
9. **Task Group 9**: Documentation & Polish (0.25 day)

**Total Estimated Time**: 3.25 days (within S estimate of 2-3 days with some buffer)

## Implementation Notes

### Key Dependencies
- shadcn/ui components must be installed before Task Group 3
- SDK regeneration (Task 1.7) must complete before frontend integration - COMPLETED
- Filter utilities (Task Group 2) are used throughout Task Groups 3-6 - COMPLETED

### Performance Considerations
- Default to Last 90 days to limit initial query scope
- Implement debouncing for search input (300-500ms)
- Consider pagination strategy (20-50 transactions per page)
- Display warning when results exceed 1000 transactions

### Testing Strategy
- Each task group writes 2-8 focused tests maximum during development
- Tests run ONLY for the specific task group, not entire suite
- Task Group 8 adds maximum 10 strategic tests for critical gaps
- Focus on integration tests over exhaustive unit test coverage

### Responsive Design
- Desktop (>= 640px): Modal dialog for filters
- Mobile (< 640px): Bottom sheet with slide-up animation
- Filter pills wrap to multiple lines on narrow screens
- Touch targets meet 44x44px minimum for accessibility

### Out of Scope (per spec.md)
- Saved filter presets
- Filter history tracking
- URL state persistence
- LocalStorage persistence
- Advanced export formats (PDF, Excel)
- Bulk transaction actions
- Transaction categorization
- Charts/visualizations
- Email/scheduled exports

## Open Questions (to resolve during implementation)

1. **Backend API Confirmation**: Verify exact query parameter names supported by GET /api/ledger/entries after implementation - COMPLETED
2. **Merchant Autocomplete**: Determine if merchant list needs separate endpoint or can be extracted from transaction results
3. **Large Dataset Handling**: Confirm behavior when exporting > 1000 transactions (warning vs. hard limit)
4. **Filter Persistence**: Confirm session-only persistence is acceptable (no localStorage for initial implementation)

## Success Metrics

This feature will be considered successful when:

1. **Performance**: Transaction filtering completes in < 1.5 seconds (90th percentile)
2. **Performance**: CSV export completes in < 3 seconds for datasets up to 1000 rows
3. **Functional**: All filter types work correctly in isolation and combination - BACKEND COMPLETED
4. **Functional**: CSV export includes correct data with proper formatting
5. **UX**: Filter modal/sheet is accessible and intuitive on desktop and mobile
6. **UX**: Active filters clearly displayed with individual removal options
7. **Code Quality**: Components follow project conventions and structure
8. **Code Quality**: TypeScript types properly defined for all filter state - COMPLETED
9. **Testing**: Feature-specific tests pass (approximately 24-66 tests) - 12 BACKEND TESTS + 24 UTILITY TESTS = 36 TESTS PASSING
10. **Accessibility**: Filter controls are keyboard navigable with screen reader support
