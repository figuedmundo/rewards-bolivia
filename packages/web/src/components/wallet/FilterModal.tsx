/**
 * FilterModal Component
 *
 * Desktop/tablet modal for transaction filtering using Dialog component.
 * Displays all filter options with apply and clear actions.
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
import { TransactionFilters } from '@/types/filters';
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
   */
  onApply: (filters: TransactionFilters) => void;

  /**
   * Callback when all filters are cleared
   */
  onClearAll: () => void;
}

/**
 * FilterModal - Desktop/tablet filter dialog
 */
export function FilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onClearAll,
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
      datePreset: preset as any,
    });
  };

  /**
   * Handle transaction type change
   */
  const handleTypeChange = (types: any[]) => {
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Transactions</DialogTitle>
          <DialogDescription>
            Filter your transaction history by date, type, amount, or merchant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
            <label className="text-sm font-medium mb-2 block">Search</label>
            <SearchInput
              value={localFilters.search || ''}
              onChange={handleSearchChange}
              placeholder="Search by merchant or transaction ID..."
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={handleClearAll} className="w-full sm:w-auto">
            Clear All
          </Button>
          <Button type="button" onClick={handleApply} className="w-full sm:w-auto">
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
