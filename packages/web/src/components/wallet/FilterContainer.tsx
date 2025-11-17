/**
 * FilterContainer Component
 *
 * Responsive wrapper that conditionally renders FilterModal (desktop)
 * or FilterSheet (mobile) based on screen size.
 * Uses Tailwind's sm breakpoint (640px) for the switch.
 */

import { useState, useEffect } from 'react';
import { TransactionFilters } from '@/types/filters';
import { FilterModal } from './FilterModal';
import { FilterSheet } from './FilterSheet';

export interface FilterContainerProps {
  /**
   * Whether the filter UI is open
   */
  isOpen: boolean;

  /**
   * Callback when filter UI should close
   */
  onClose: () => void;

  /**
   * Current filter values
   */
  filters: TransactionFilters;

  /**
   * Callback when filters are applied
   */
  onApply: (filters: TransactionFilters) => void;

  /**
   * Callback when all filters are cleared
   */
  onClearAll: () => void;
}

/**
 * FilterContainer - Responsive filter UI wrapper
 */
export function FilterContainer({
  isOpen,
  onClose,
  filters,
  onApply,
  onClearAll,
}: FilterContainerProps) {
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Detect screen size changes
   */
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    // Check initial size
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Render appropriate component based on screen size
  if (isMobile) {
    return (
      <FilterSheet
        isOpen={isOpen}
        onClose={onClose}
        filters={filters}
        onApply={onApply}
        onClearAll={onClearAll}
      />
    );
  }

  return (
    <FilterModal
      isOpen={isOpen}
      onClose={onClose}
      filters={filters}
      onApply={onApply}
      onClearAll={onClearAll}
    />
  );
}
