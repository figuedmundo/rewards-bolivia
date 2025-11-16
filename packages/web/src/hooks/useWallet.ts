/**
 * Custom React Hooks for Wallet Operations
 *
 * Uses TanStack Query for server state management
 * Provides hooks for balance queries, transaction history, and redemptions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi, type LedgerQueryParams } from '../lib/wallet-api';
import { useAuth } from './useAuth';

// Query keys (centralized for cache management)
export const walletKeys = {
  all: ['wallet'] as const,
  balance: (userId: string) => [...walletKeys.all, 'balance', userId] as const,
  user: (userId: string) => [...walletKeys.all, 'user', userId] as const,
  ledger: (params: LedgerQueryParams) => [...walletKeys.all, 'ledger', params] as const,
  entry: (id: string) => [...walletKeys.all, 'entry', id] as const,
};

/**
 * Hook: Get wallet balance
 *
 * @returns {UseQueryResult} Query result with balance data
 * @example
 * const { data: balance, isLoading, error } = useWalletBalance();
 */
export const useWalletBalance = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: walletKeys.balance(user?.id || ''),
    queryFn: () => walletApi.getBalance(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });
};

/**
 * Hook: Get user profile (includes balance + other data)
 *
 * @returns {UseQueryResult} Query result with user profile
 * @example
 * const { data: profile, isLoading } = useUserProfile();
 */
export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: walletKeys.user(user?.id || ''),
    queryFn: () => walletApi.getUser(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook: Get transaction history (paginated)
 *
 * @param {LedgerQueryParams} params - Query parameters (accountId, page, pageSize, etc.)
 * @returns {UseQueryResult} Query result with paginated ledger entries
 * @example
 * const { data, isLoading, error } = useTransactionHistory({ page: 1, pageSize: 10 });
 */
export const useTransactionHistory = (params: LedgerQueryParams = {}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: walletKeys.ledger({ accountId: user?.id, ...params }),
    queryFn: () => walletApi.getLedgerEntries({ accountId: user?.id, ...params }),
    enabled: !!user,
    placeholderData: (previousData) => previousData, // For smooth pagination in v5
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook: Get single ledger entry
 *
 * @param {string} id - Ledger entry ID
 * @returns {UseQueryResult} Query result with ledger entry data
 * @example
 * const { data: entry, isLoading } = useLedgerEntry(entryId);
 */
export const useLedgerEntry = (id: string) => {
  return useQuery({
    queryKey: walletKeys.entry(id),
    queryFn: () => walletApi.getLedgerEntry(id),
    enabled: !!id,
  });
};

/**
 * Hook: Redeem points mutation
 *
 * Includes optimistic updates: balance changes instantly, reverts if API fails
 *
 * @returns {UseMutationResult} Mutation result with redeem state
 * @example
 * const { mutate: redeemPoints, isPending } = useRedeemPoints();
 * redeemPoints({ points: 300, businessId: 'biz-123', purchaseAmount: 1000 },
 *   {
 *     onSuccess: () => toast.success('Points redeemed!'),
 *     onError: (err) => toast.error(err.message)
 *   }
 * );
 */
export const useRedeemPoints = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (payload: { points: number; businessId: string; purchaseAmount: number }) =>
      walletApi.redeemPoints(payload),

    // Optimistic update
    onMutate: async (variables: any) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: walletKeys.balance(user!.id) });

      // Snapshot current balance
      const previousBalance = queryClient.getQueryData<number>(walletKeys.balance(user!.id));

      // Optimistically update balance
      if (previousBalance !== undefined) {
        queryClient.setQueryData<number>(
          walletKeys.balance(user!.id),
          previousBalance - variables.points
        );
      }

      return { previousBalance };
    },

    // On success: invalidate queries to refetch fresh data
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.balance(user!.id) });
      queryClient.invalidateQueries({ queryKey: walletKeys.user(user!.id) });
      queryClient.invalidateQueries({ queryKey: walletKeys.ledger({ accountId: user?.id }) });
    },

    // On error: rollback optimistic update
    onError: (error: any, _variables, context) => {
      // Restore previous balance
      if (context?.previousBalance !== undefined) {
        queryClient.setQueryData(walletKeys.balance(user!.id), context.previousBalance);
      }

      console.error('Redemption failed:', error);
    },
  });
};

/**
 * Hook: Earn points mutation (for business flow)
 *
 * @returns {UseMutationResult} Mutation result with earn state
 * @example
 * const { mutate: earnPoints, isPending } = useEarnPoints();
 */
export const useEarnPoints = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (payload: { customerId: string; purchaseAmount: number }) =>
      walletApi.earnPoints(payload),

    // On success: invalidate related queries
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.balance(user!.id) });
      queryClient.invalidateQueries({ queryKey: walletKeys.user(user!.id) });
      queryClient.invalidateQueries({ queryKey: walletKeys.ledger({ accountId: user?.id }) });
    },

    onError: (error: any) => {
      console.error('Failed to earn points:', error);
    },
  });
};
