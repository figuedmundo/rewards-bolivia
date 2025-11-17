/**
 * FilterContainer Component
 *
 * Responsive wrapper that conditionally renders FilterModal (desktop)
 * or FilterSheet (mobile) based on screen size.
 * Uses Tailwind's sm breakpoint (640px) for the switch.
 *
 * @component
 * @example
 * ```tsx
 * <FilterContainer
 *   isOpen={isFilterOpen}
 *   onClose={() => setFilterOpen(false)}
 *   filters={currentFilters}
 *   onApply={(filters) => handleApplyFilters(filters)}
 *   onClearAll={() => handleClearFilters()}
 *   onExport={() => handleExport()}
 *   isExporting={isExporting}
 * />
 * ```
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
   * @param filters - The updated filter values
   */
  onApply: (filters: TransactionFilters) => void;

  /**
   * Callback when all filters are cleared
   */
  onClearAll: () => void;

  /**
   * Callback when CSV export is requested
   */
  onExport?: () => void;

  /**
   * Whether export is in progress
   * @default false
   */
  isExporting?: boolean;
}

/**
 * FilterContainer - Responsive filter UI wrapper
 *
 * Automatically switches between modal dialog (desktop/tablet) and
 * bottom sheet (mobile) based on screen size. Breakpoint at 640px.
 *
 * Features:
 * - Responsive design with automatic layout switching
 * - Touch-optimized for mobile devices
 * - Keyboard accessible
 * - Screen reader friendly
 */
export function FilterContainer({
  isOpen,
  onClose,
  filters,
  onApply,
  onClearAll,
  onExport,
  isExporting = false,
}: FilterContainerProps) {
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Detect screen size changes and update mobile flag
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
        onExport={onExport}
        isExporting={isExporting}
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
      onExport={onExport}
      isExporting={isExporting}
    />
  );
}
