/**
 * ActiveFilters Component
 *
 * Displays active filters as removable pills with a "Clear All" link.
 * Wraps to multiple lines on narrow screens.
 */

import { TransactionFilters, ActiveFilter } from '@/types/filters';
import { FilterPill } from './filters/FilterPill';
import { formatActiveFilters } from '@/lib/filter-utils';

export interface ActiveFiltersProps {
  /**
   * Current filter values
   */
  filters: TransactionFilters;

  /**
   * Callback when a filter is removed
   */
  onRemoveFilter: (filter: ActiveFilter) => void;

  /**
   * Callback when all filters are cleared
   */
  onClearAll: () => void;
}

/**
 * ActiveFilters - Display active filters as removable pills
 */
export function ActiveFilters({ filters, onRemoveFilter, onClearAll }: ActiveFiltersProps) {
  const activeFilters = formatActiveFilters(filters);

  // Don't render if no active filters
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Active filters:
      </span>

      <div className="flex flex-wrap gap-2 flex-1">
        {activeFilters.map((filter) => (
          <FilterPill
            key={filter.key}
            label={filter.label}
            onRemove={() => onRemoveFilter(filter)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onClearAll}
        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
      >
        Clear All
      </button>
    </div>
  );
}
