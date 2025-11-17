import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactionHistory } from '@/hooks/useWallet';
import { TransactionItem } from './TransactionItem';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { FilterButton } from './FilterButton';
import { FilterContainer } from './FilterContainer';
import { ActiveFilters } from './ActiveFilters';
import { TransactionFilters, TransactionType, ActiveFilter } from '@/types/filters';
import { getActiveFilterCount, getDateRangeForPreset } from '@/lib/filter-utils';

interface TransactionHistoryProps {
  pageSize?: number;
  showPagination?: boolean;
}

/**
 * Get default filters (Last 90 days, all types)
 */
const getDefaultFilters = (): TransactionFilters => {
  const { startDate, endDate } = getDateRangeForPreset('90d');
  return {
    startDate,
    endDate,
    datePreset: '90d',
    types: [TransactionType.EARN, TransactionType.REDEEM, TransactionType.ADJUSTMENT, TransactionType.BURN],
  };
};

/**
 * TransactionHistory Component
 *
 * Displays paginated list of ledger entries (transaction history) with filtering
 */
export const TransactionHistory = ({
  pageSize = 10,
  showPagination = true,
}: TransactionHistoryProps) => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TransactionFilters>(getDefaultFilters());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Convert filters to API query params
  const queryParams = {
    page,
    pageSize,
    startDate: filters.startDate,
    endDate: filters.endDate,
    type: filters.types && filters.types.length > 0 ? filters.types.join(',') : undefined,
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
    search: filters.search,
  };

  const { data, isLoading, error } = useTransactionHistory(queryParams);

  /**
   * Handle applying filters
   */
  const handleApplyFilters = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  /**
   * Handle clearing all filters
   */
  const handleClearAllFilters = () => {
    setFilters(getDefaultFilters());
    setPage(1);
  };

  /**
   * Handle removing individual filter
   */
  const handleRemoveFilter = (filter: ActiveFilter) => {
    const newFilters = { ...filters };

    // Remove specific filter based on field
    switch (filter.filterField) {
      case 'startDate':
      case 'endDate':
      case 'datePreset':
        newFilters.startDate = undefined;
        newFilters.endDate = undefined;
        newFilters.datePreset = undefined;
        break;
      case 'types':
        if (filter.value) {
          newFilters.types = newFilters.types?.filter((t) => t !== filter.value);
        } else {
          newFilters.types = undefined;
        }
        break;
      case 'minAmount':
        newFilters.minAmount = undefined;
        break;
      case 'maxAmount':
        newFilters.maxAmount = undefined;
        break;
      case 'search':
        newFilters.search = undefined;
        break;
    }

    setFilters(newFilters);
    setPage(1);
  };

  // Calculate active filter count
  const activeFilterCount = getActiveFilterCount(filters);

  // Check if filters are applied (beyond defaults)
  const hasActiveFilters = activeFilterCount > 0;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: pageSize }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" data-testid="transaction-skeleton" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Failed to load transaction history.
      </div>
    );
  }

  // Empty state with filter awareness
  if (!data?.entries || data.entries.length === 0) {
    if (hasActiveFilters) {
      return (
        <div className="space-y-4">
          {/* Filter Button */}
          <div className="flex items-center justify-between px-4 py-2">
            <FilterButton
              activeFilterCount={activeFilterCount}
              onClick={() => setIsFilterOpen(true)}
            />
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          )}

          {/* Empty State */}
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No transactions match your criteria</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleClearAllFilters}
            >
              Clear Filters
            </Button>
          </div>

          {/* Filter Modal/Sheet */}
          <FilterContainer
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            onApply={handleApplyFilters}
            onClearAll={handleClearAllFilters}
          />
        </div>
      );
    }

    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg">No transactions yet</p>
        <p className="text-sm mt-2">
          Your transaction history will appear here
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil((data.total || 0) / pageSize);
  const showLargeDatasetWarning = data.total > 1000;

  return (
    <div className="space-y-4">
      {/* Filter Button */}
      <div className="flex items-center justify-between px-4 py-2">
        <FilterButton
          activeFilterCount={activeFilterCount}
          onClick={() => setIsFilterOpen(true)}
        />
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <ActiveFilters
          filters={filters}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />
      )}

      {/* Large Dataset Warning */}
      {showLargeDatasetWarning && (
        <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mx-4">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              Large result set ({data.total} transactions)
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Consider narrowing your date range or adding filters for better performance.
            </p>
          </div>
        </div>
      )}

      <Table>
        <TableCaption>
          Showing {data.entries.length} of {data.total} transactions
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Balance After</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.entries.map((entry) => (
            <TransactionItem key={entry.id} entry={entry} />
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-gray-600" data-testid="page-counter">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              data-testid="previous-button"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              data-testid="next-button"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Filter Modal/Sheet */}
      <FilterContainer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onClearAll={handleClearAllFilters}
      />
    </div>
  );
};
