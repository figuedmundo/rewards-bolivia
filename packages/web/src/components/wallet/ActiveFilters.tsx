/**
 * ActiveFilters Component
 *
 * Displays active filters as removable pills with a "Clear All" link.
 * Wraps to multiple lines on narrow screens.
 * Touch-optimized with adequate button sizes for mobile devices.
 */

import { TransactionFilters, ActiveFilter } from '@/types/filters';
import { FilterPill } from './filters/FilterPill';
import { formatActiveFilters } from '@/lib/filter-utils';
import { Button } from '@/components/ui/button';

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
 * Responsive layout with proper wrapping on mobile devices
 */
export function ActiveFilters({ filters, onRemoveFilter, onClearAll }: ActiveFiltersProps) {
  const activeFilters = formatActiveFilters(filters);

  // Don't render if no active filters
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
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

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="shrink-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 min-h-[44px] sm:min-h-0"
      >
        Clear All
      </Button>
    </div>
  );
}
