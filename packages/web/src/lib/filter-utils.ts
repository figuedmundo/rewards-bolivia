/**
 * Filter Utility Functions
 *
 * Provides utility functions for handling transaction filters,
 * including date range calculations, active filter formatting,
 * and filter state management.
 */

import type { DatePreset, TransactionFilters, ActiveFilter, TransactionType } from '../types/filters';

/**
 * Get date range for a given preset
 *
 * Calculates start and end dates based on common date presets.
 * Dates are returned in ISO 8601 format (YYYY-MM-DD).
 *
 * @param preset - Date preset (7d, 30d, 90d, year, all)
 * @returns Object with startDate and endDate in ISO format
 *
 * @example
 * const { startDate, endDate } = getDateRangeForPreset('30d');
 * // Returns dates for last 30 days
 */
export function getDateRangeForPreset(preset: DatePreset): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0]; // Today in YYYY-MM-DD format
  let startDate: string;

  switch (preset) {
    case '7d':
      // Last 7 days
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      break;

    case '30d':
      // Last 30 days
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      break;

    case '90d':
      // Last 90 days
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      break;

    case 'year':
      // Start of current year (January 1st)
      // Use local year to match user's timezone
      const year = now.getFullYear();
      startDate = `${year}-01-01`;
      break;

    case 'all':
      // Return a very old date (e.g., 10 years ago) to capture all transactions
      const oldYear = now.getFullYear() - 10;
      startDate = `${oldYear}-01-01`;
      break;

    default:
      // Default to last 90 days
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
  }

  return { startDate, endDate };
}

/**
 * Format active filters for display as pills/tags
 *
 * Converts TransactionFilters state into an array of ActiveFilter objects
 * suitable for rendering as removable filter pills above the transaction list.
 *
 * @param filters - Current transaction filters state
 * @returns Array of active filters with labels and removal metadata
 *
 * @example
 * const activeFilters = formatActiveFilters({
 *   startDate: '2025-10-01',
 *   endDate: '2025-11-17',
 *   types: [TransactionType.EARN],
 *   minAmount: 100,
 *   search: 'coffee'
 * });
 * // Returns array of filter objects for rendering pills
 */
export function formatActiveFilters(filters: TransactionFilters): ActiveFilter[] {
  const activeFilters: ActiveFilter[] = [];

  // Date range filter
  if (filters.startDate && filters.endDate) {
    // Check if it matches a preset
    let label = `${filters.startDate} to ${filters.endDate}`;

    if (filters.datePreset) {
      const presetLabels: Record<DatePreset, string> = {
        '7d': 'Last 7 days',
        '30d': 'Last 30 days',
        '90d': 'Last 90 days',
        year: 'This year',
        all: 'All time',
      };
      label = presetLabels[filters.datePreset];
    }

    activeFilters.push({
      key: 'dateRange',
      label,
      filterField: 'startDate', // Removing either startDate or endDate clears the range
    });
  }

  // Transaction type filters
  if (filters.types && filters.types.length > 0) {
    filters.types.forEach((type) => {
      activeFilters.push({
        key: `type-${type}`,
        label: `Type: ${type}`,
        filterField: 'types',
        value: type,
      });
    });
  }

  // Amount range filter
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    let label = 'Amount: ';
    if (filters.minAmount !== undefined && filters.maxAmount !== undefined) {
      label += `${filters.minAmount} to ${filters.maxAmount}`;
    } else if (filters.minAmount !== undefined) {
      label += `>= ${filters.minAmount}`;
    } else {
      label += `<= ${filters.maxAmount}`;
    }

    activeFilters.push({
      key: 'amountRange',
      label,
      filterField: 'minAmount', // Removing this clears both min and max
    });
  }

  // Search filter
  if (filters.search && filters.search.trim().length > 0) {
    activeFilters.push({
      key: 'search',
      label: `Search: "${filters.search}"`,
      filterField: 'search',
    });
  }

  return activeFilters;
}

/**
 * Get the count of active filters
 *
 * Calculates how many filters are currently active for display
 * in the filter button badge.
 *
 * @param filters - Current transaction filters state
 * @returns Number of active filters
 *
 * @example
 * const count = getActiveFilterCount(filters);
 * // Returns 3 if date range, type, and search are active
 */
export function getActiveFilterCount(filters: TransactionFilters): number {
  let count = 0;

  // Date range counts as 1 filter
  if (filters.startDate && filters.endDate) {
    count += 1;
  }

  // Each transaction type counts as 1 filter
  if (filters.types && filters.types.length > 0) {
    count += filters.types.length;
  }

  // Amount range counts as 1 filter (even if only min or max is set)
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    count += 1;
  }

  // Search counts as 1 filter
  if (filters.search && filters.search.trim().length > 0) {
    count += 1;
  }

  return count;
}

/**
 * Check if filters are empty (no filters applied)
 *
 * Determines if the current filter state represents "no filtering"
 * which would show all transactions without restrictions.
 *
 * @param filters - Current transaction filters state
 * @returns True if no filters are active
 *
 * @example
 * if (isFiltersEmpty(filters)) {
 *   console.log('Showing all transactions');
 * }
 */
export function isFiltersEmpty(filters: TransactionFilters): boolean {
  return getActiveFilterCount(filters) === 0;
}

/**
 * Remove a specific filter from the filters state
 *
 * Creates a new filters object with the specified filter removed.
 * Handles removal of individual type filters and complete removal of other filters.
 *
 * @param filters - Current transaction filters state
 * @param filterField - Field to remove
 * @param value - Optional value for array-based filters (like types)
 * @returns New filters object with the specified filter removed
 *
 * @example
 * const newFilters = removeFilter(filters, 'types', TransactionType.EARN);
 * // Removes only the EARN type, keeping other types
 */
export function removeFilter(
  filters: TransactionFilters,
  filterField: keyof TransactionFilters,
  value?: any
): TransactionFilters {
  const newFilters = { ...filters };

  switch (filterField) {
    case 'startDate':
    case 'endDate':
      // Remove both date fields when removing date range
      delete newFilters.startDate;
      delete newFilters.endDate;
      delete newFilters.datePreset;
      break;

    case 'types':
      // Remove specific type if value provided, otherwise clear all types
      if (value !== undefined && newFilters.types) {
        newFilters.types = newFilters.types.filter((t) => t !== value);
        if (newFilters.types.length === 0) {
          delete newFilters.types;
        }
      } else {
        delete newFilters.types;
      }
      break;

    case 'minAmount':
    case 'maxAmount':
      // Remove both amount fields when removing amount range
      delete newFilters.minAmount;
      delete newFilters.maxAmount;
      break;

    case 'search':
      delete newFilters.search;
      break;

    default:
      // Generic removal for other fields
      delete newFilters[filterField];
  }

  return newFilters;
}

/**
 * Get default filters (Last 90 days, all types)
 *
 * Returns the default filter state matching the requirements:
 * - Last 90 days date range
 * - All transaction types (no type filtering)
 * - No amount or search filters
 *
 * @returns Default transaction filters
 *
 * @example
 * const [filters, setFilters] = useState(getDefaultFilters());
 */
export function getDefaultFilters(): TransactionFilters {
  const { startDate, endDate } = getDateRangeForPreset('90d');

  return {
    startDate,
    endDate,
    datePreset: '90d',
    // No types means all types (no filtering)
    // No minAmount, maxAmount, or search
  };
}
