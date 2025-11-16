import { Card } from '@/components/ui/card';
import { WalletBalance } from '@/components/wallet/WalletBalance';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';

/**
 * WalletPage Component
 *
 * Main dashboard for viewing points balance, transaction history, and expiration warnings
 * Route: /wallet (protected, requires authentication)
 */
export const WalletPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          My Wallet
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your points and transaction history
        </p>
      </div>

      {/* Balance Card */}
      <div className="mb-6">
        <WalletBalance />
      </div>

      {/* Transaction History */}
      <Card>
        <TransactionHistory />
      </Card>
    </div>
  );
};
