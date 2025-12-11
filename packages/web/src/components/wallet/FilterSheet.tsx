/**
 * FilterSheet Component
 *
 * Mobile bottom sheet for transaction filtering using Sheet component.
 * Displays all filter options with apply, clear, and CSV export actions.
 * Optimized for touch interactions and small screens.
 *
 * @component
 * @example
 * ```tsx
 * <FilterSheet
 *   isOpen={isOpen}
 *   onClose={() => setOpen(false)}
 *   filters={filters}
 *   onApply={(filters) => handleApply(filters)}
 *   onClearAll={() => handleClear()}
 *   onExport={() => handleExport()}
 *   isExporting={false}
 * />
 * ```
 */

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { TransactionFilters, TransactionType, DatePreset } from '@/types/filters';
import {
  DateRangeFilter,
  TransactionTypeFilter,
  AmountRangeFilter,
  SearchInput,
} from './filters';

export interface FilterSheetProps {
  /**
   * Whether the sheet is open
   */
  isOpen: boolean;

  /**
   * Callback when sheet should close
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
 * FilterSheet - Mobile bottom sheet for filters
 *
 * Provides a mobile-optimized filtering interface with slide-up animation.
 * Includes all filter options in a scrollable, touch-friendly layout.
 *
 * Features:
 * - Full-height mobile sheet (90vh)
 * - Touch-optimized controls with adequate spacing
 * - Scrollable content area for all filters
 * - Fixed footer with action buttons
 * - Keyboard accessible
 * - Screen reader friendly
 */
export function FilterSheet({
  isOpen,
  onClose,
  filters,
  onApply,
  onClearAll,
  onExport,
  isExporting = false,
}: FilterSheetProps) {
  // Local state for filter values before applying
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  // Update local filters when sheet opens or filters prop changes
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  /**
   * Handle apply button click
   */
  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  /**
   * Handle clear all button click
   */
  const handleClearAll = () => {
    onClearAll();
    onClose();
  };

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (
    startDate: string | undefined,
    endDate: string | undefined,
    preset?: string
  ) => {
    setLocalFilters({
      ...localFilters,
      startDate,
      endDate,
      datePreset: preset as DatePreset | undefined,
    });
  };

  /**
   * Handle transaction type change
   */
  const handleTypeChange = (types: TransactionType[]) => {
    setLocalFilters({
      ...localFilters,
      types,
    });
  };

  /**
   * Handle amount range change
   */
  const handleMinAmountChange = (minAmount: number | undefined) => {
    setLocalFilters({
      ...localFilters,
      minAmount,
    });
  };

  const handleMaxAmountChange = (maxAmount: number | undefined) => {
    setLocalFilters({
      ...localFilters,
      maxAmount,
    });
  };

  /**
   * Handle search change
   */
  const handleSearchChange = (search: string) => {
    setLocalFilters({
      ...localFilters,
      search: search || undefined,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Filter your transaction history by date, type, amount, or merchant.
          </SheetDescription>
        </SheetHeader>

        <div
          className="space-y-6 py-4 overflow-y-auto max-h-[calc(90vh-240px)]"
          role="form"
          aria-label="Transaction filters"
        >
          <DateRangeFilter
            startDate={localFilters.startDate}
            endDate={localFilters.endDate}
            selectedPreset={localFilters.datePreset}
            onChange={handleDateRangeChange}
          />

          <TransactionTypeFilter
            value={localFilters.types || []}
            onChange={handleTypeChange}
          />

          <AmountRangeFilter
            minValue={localFilters.minAmount}
            maxValue={localFilters.maxAmount}
            onMinChange={handleMinAmountChange}
            onMaxChange={handleMaxAmountChange}
          />

          <div>
            <label className="text-sm font-medium mb-2 block" htmlFor="transaction-search-mobile">
              Search
            </label>
            <SearchInput
              value={localFilters.search || ''}
              onChange={handleSearchChange}
              placeholder="Search by merchant or transaction ID..."
            />
          </div>
        </div>

        {/* CSV Export Button */}
        {onExport && (
          <div className="px-4 pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={onExport}
              disabled={isExporting}
              className="w-full min-h-[44px]"
              aria-label={isExporting ? 'Generating CSV export' : 'Export filtered transactions to CSV'}
            >
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              {isExporting ? 'Generating CSV...' : 'Export to CSV'}
            </Button>
          </div>
        )}

        <SheetFooter className="flex flex-col gap-2 pt-4 border-t">
          <Button
            type="button"
            onClick={handleApply}
            className="w-full min-h-[44px]"
            aria-label="Apply selected filters"
          >
            Apply Filters
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClearAll}
            className="w-full min-h-[44px]"
            aria-label="Clear all filters"
          >
            Clear All
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
