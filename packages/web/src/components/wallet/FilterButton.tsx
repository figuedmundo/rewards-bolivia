/**
 * FilterButton Component
 *
 * Button to open the filter modal/sheet with a badge showing
 * the number of active filters when greater than 0.
 */

import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FilterButtonProps {
  /**
   * Number of active filters
   */
  activeFilterCount: number;

  /**
   * Callback when button is clicked
   */
  onClick: () => void;

  /**
   * Optional custom class name
   */
  className?: string;
}

/**
 * FilterButton - Button to open filter UI with active filter count badge
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
    >
      <Filter className="h-4 w-4 mr-2" />
      <span>Filters</span>
      {activeFilterCount > 0 && (
        <Badge
          variant="default"
          className="ml-2 h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-xs"
        >
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
}
