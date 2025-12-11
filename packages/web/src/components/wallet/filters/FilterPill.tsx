/**
 * FilterPill Component
 *
 * Displays an active filter as a removable pill/tag.
 * Used to show currently applied filters with individual removal.
 * Follows accessibility standards with minimum 44x44px touch targets.
 */

import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface FilterPillProps {
  /**
   * Display label for the filter
   */
  label: string;

  /**
   * Callback when remove button is clicked
   */
  onRemove: () => void;
}

/**
 * FilterPill - Removable filter badge component
 * Touch target meets minimum 44x44px for mobile accessibility
 */
export function FilterPill({ label, onRemove }: FilterPillProps) {
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 pl-3 pr-1 py-1.5 text-sm animate-in fade-in slide-in-from-top-1"
    >
      <span>{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-11 w-11 sm:h-8 sm:w-8 p-0 hover:bg-transparent touch-manipulation"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-4 w-4" />
      </Button>
    </Badge>
  );
}
