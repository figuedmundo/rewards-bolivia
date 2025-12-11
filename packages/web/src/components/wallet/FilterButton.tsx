/**
 * FilterButton Component
 *
 * Button to open the filter modal/sheet with a badge showing
 * the number of active filters when greater than 0.
 *
 * @component
 * @example
 * ```tsx
 * <FilterButton
 *   activeFilterCount={3}
 *   onClick={() => setFilterOpen(true)}
 * />
 * ```
 */

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FilterButtonProps {
  /**
   * Number of active filters to display in badge
   */
  activeFilterCount: number;

  /**
   * Callback when button is clicked
   */
  onClick: () => void;

  /**
   * Optional custom class name for styling
   */
  className?: string;
}

/**
 * FilterButton - Opens filter UI with active filter count badge
 *
 * Provides visual feedback about currently applied filters through
 * a badge counter. Accessible with proper ARIA labels for screen readers.
 */
export function FilterButton({ activeFilterCount, onClick, className }: FilterButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={`relative ${className || ''}`}
      aria-label={
        activeFilterCount > 0
          ? `Filters (${activeFilterCount} active)`
          : 'Open filters'
      }
      aria-expanded={false}
    >
      <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
      <span>Filters</span>
      {activeFilterCount > 0 && (
        <Badge
          variant="default"
          className="ml-2 h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-xs"
          aria-label={`${activeFilterCount} active filters`}
        >
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
}
