import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWalletBalance } from '@/hooks/useWallet';
import { Coins } from 'lucide-react';

/**
 * WalletBalance Component
 *
 * Displays the current points balance with error handling and loading states
 */
export const WalletBalance = () => {
  const { data: balance, isLoading, error, refetch } = useWalletBalance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-48" data-testid="balance-skeleton" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">
            Failed to load balance.{' '}
            <button
              onClick={() => refetch()}
              className="underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Points Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div
              className="text-4xl font-bold text-green-600 dark:text-green-400"
              data-testid="wallet-balance"
            >
              {balance?.toLocaleString()}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              points available
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
