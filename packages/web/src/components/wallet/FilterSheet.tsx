/**
 * FilterSheet Component
 *
 * Mobile bottom sheet for transaction filtering using Sheet component.
 * Displays all filter options with apply and clear actions.
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
import { TransactionFilters } from '@/types/filters';
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
   */
  onApply: (filters: TransactionFilters) => void;

  /**
   * Callback when all filters are cleared
   */
  onClearAll: () => void;
}

/**
 * FilterSheet - Mobile bottom sheet for filters
 */
export function FilterSheet({
  isOpen,
  onClose,
  filters,
  onApply,
  onClearAll,
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh]">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Filter your transaction history by date, type, amount, or merchant.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
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

        <SheetFooter className="flex flex-col gap-2 pt-4 border-t">
          <Button type="button" onClick={handleApply} className="w-full">
            Apply Filters
          </Button>
          <Button type="button" variant="outline" onClick={handleClearAll} className="w-full">
            Clear All
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
