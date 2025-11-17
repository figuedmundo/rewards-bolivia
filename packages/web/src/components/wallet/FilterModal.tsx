/**
 * FilterModal Component
 *
 * Desktop/tablet modal dialog for transaction filtering using Dialog component.
 * Displays all filter options with apply, clear, and CSV export actions.
 *
 * @component
 * @example
 * ```tsx
 * <FilterModal
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { TransactionFilters, TransactionType, DatePreset } from '@/types/filters';
import {
  DateRangeFilter,
  TransactionTypeFilter,
  AmountRangeFilter,
  SearchInput,
} from './filters';

export interface FilterModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal should close
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
 * FilterModal - Desktop/tablet filter dialog
 *
 * Provides a comprehensive filtering interface for transaction history.
 * Includes date range, transaction type, amount range, and search filters.
 *
 * Features:
 * - Local filter state management before applying
 * - Keyboard accessible with proper focus management
 * - Screen reader friendly with ARIA labels
 * - Responsive layout with scrollable content
 * - CSV export integration
 */
export function FilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onClearAll,
  onExport,
  isExporting = false,
}: FilterModalProps) {
  // Local state for filter values before applying
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  // Update local filters when modal opens or filters prop changes
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        aria-describedby="filter-description"
      >
        <DialogHeader>
          <DialogTitle>Filter Transactions</DialogTitle>
          <DialogDescription id="filter-description">
            Filter your transaction history by date, type, amount, or merchant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4" role="form" aria-label="Transaction filters">
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
            <label className="text-sm font-medium mb-2 block" htmlFor="transaction-search">
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
          <div className="border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onExport}
              disabled={isExporting}
              className="w-full"
              aria-label={isExporting ? 'Generating CSV export' : 'Export filtered transactions to CSV'}
            >
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              {isExporting ? 'Generating CSV...' : 'Export to CSV'}
            </Button>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearAll}
            className="w-full sm:w-auto"
            aria-label="Clear all filters"
          >
            Clear All
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="w-full sm:w-auto"
            aria-label="Apply selected filters"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
