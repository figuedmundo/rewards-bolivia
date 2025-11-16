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
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionHistoryProps {
  pageSize?: number;
  showPagination?: boolean;
}

/**
 * TransactionHistory Component
 *
 * Displays paginated list of ledger entries (transaction history)
 */
export const TransactionHistory = ({
  pageSize = 10,
  showPagination = true,
}: TransactionHistoryProps) => {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useTransactionHistory({
    page,
    pageSize,
  });

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

  if (!data?.entries || data.entries.length === 0) {
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

  return (
    <div>
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
    </div>
  );
};
