import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { LedgerEntryDto } from '@rewards-bolivia/shared-types';

interface TransactionItemProps {
  entry: LedgerEntryDto;
}

/**
 * TransactionItem Component
 *
 * Single row in transaction history table
 */
export const TransactionItem = ({ entry }: TransactionItemProps) => {
  const isDebit = entry.debit > 0;
  const amount = isDebit ? entry.debit : entry.credit;
  const sign = isDebit ? '+' : '-';

  // Determine transaction type color
  const colorMap: Record<string, string> = {
    EARN: 'bg-green-100 text-green-800',
    REDEEM: 'bg-blue-100 text-blue-800',
    BURN: 'bg-orange-100 text-orange-800',
    ADJUSTMENT: 'bg-purple-100 text-purple-800',
    EXPIRE: 'bg-red-100 text-red-800',
  };
  const typeColor = colorMap[entry.type] || 'bg-gray-100 text-gray-800';

  // Format date string to readable format
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <TableRow>
      {/* Date */}
      <TableCell className="font-medium">
        {formatDate(entry.createdAt)}
      </TableCell>

      {/* Type Badge */}
      <TableCell>
        <Badge className={typeColor} variant="secondary">
          {entry.type}
        </Badge>
      </TableCell>

      {/* Amount */}
      <TableCell className="text-right">
        <span className={isDebit ? 'text-green-600' : 'text-red-600'}>
          {sign}{amount.toLocaleString()}
        </span>
      </TableCell>

      {/* Balance After */}
      <TableCell className="text-right font-medium">
        {entry.balanceAfter.toLocaleString()}
      </TableCell>
    </TableRow>
  );
};
