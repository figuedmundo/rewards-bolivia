/**
 * FilterPill Component
 *
 * Displays an active filter as a removable pill/tag.
 * Used to show currently applied filters with individual removal.
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
 */
export function FilterPill({ label, onRemove }: FilterPillProps) {
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 pr-1 py-1 text-sm animate-in fade-in slide-in-from-top-1"
    >
      <span>{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-4 w-4 p-0 hover:bg-transparent"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
}
