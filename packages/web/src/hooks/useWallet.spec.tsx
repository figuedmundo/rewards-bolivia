import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useWalletBalance,
  useUserProfile,
  useTransactionHistory,
  useLedgerEntry,
  useRedeemPoints,
  useEarnPoints,
} from './useWallet';
import * as walletApiModule from '@/lib/wallet-api';
import type { UserDto } from '@rewards-bolivia/sdk';
import type { LedgerEntryDto } from '@rewards-bolivia/shared-types';

// Import useAuth for mocking
import { useAuth } from './useAuth';

// Mock the auth hook
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}));

// Cast to mock for easier usage
const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// Mock the wallet API
vi.mock('@/lib/wallet-api', () => ({
  walletApi: {
    getBalance: vi.fn(),
    getUser: vi.fn(),
    getLedgerEntries: vi.fn(),
    getLedgerEntry: vi.fn(),
    verifyLedgerEntry: vi.fn(),
    redeemPoints: vi.fn(),
    earnPoints: vi.fn(),
  },
}));

describe('useWallet Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    // Set default mock return value for useAuth
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id', email: 'test@example.com', role: 'client' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useWalletBalance', () => {
    it('should fetch and return wallet balance', async () => {
      (walletApiModule.walletApi.getBalance as any).mockResolvedValue(1500);

      const { result } = renderHook(() => useWalletBalance(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBe(1500);
    });

    it('should handle balance fetch errors', async () => {
      const error = new Error('Failed to fetch balance');
      (walletApiModule.walletApi.getBalance as any).mockRejectedValue(error);

      const { result } = renderHook(() => useWalletBalance(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should disable query when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      const { result } = renderHook(() => useWalletBalance(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useUserProfile', () => {
    it('should fetch full user profile', async () => {
      const mockUser: UserDto = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'client',
        pointsBalance: 1000,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      };

      (walletApiModule.walletApi.getUser as any).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUserProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockUser);
      expect(result.current.data?.email).toBe('test@example.com');
    });
  });

  describe('useTransactionHistory', () => {
    it('should fetch paginated transaction history', async () => {
      const mockEntries: LedgerEntryDto[] = [
        {
          id: 'entry-1',
          type: 'EARN',
          accountId: 'test-user-id',
          debit: 500,
          credit: 0,
          balanceAfter: 1000,
          hash: 'hash-1',
          createdAt: '2025-01-10T10:00:00Z',
          transactionId: 'tx-1',
        },
      ];

      (walletApiModule.walletApi.getLedgerEntries as any).mockResolvedValue({
        entries: mockEntries,
        total: 1,
        page: 1,
        pageSize: 10,
      });

      const { result } = renderHook(
        () => useTransactionHistory({ page: 1, pageSize: 10 }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.entries).toHaveLength(1);
      expect(result.current.data?.entries[0].type).toBe('EARN');
    });

    it('should handle pagination parameters', async () => {
      (walletApiModule.walletApi.getLedgerEntries as any).mockResolvedValue({
        entries: [],
        total: 100,
        page: 2,
        pageSize: 20,
      });

      renderHook(
        () => useTransactionHistory({ page: 2, pageSize: 20, accountId: 'user-1' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(walletApiModule.walletApi.getLedgerEntries).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
            pageSize: 20,
            accountId: 'user-1',
          })
        );
      });
    });
  });

  describe('useLedgerEntry', () => {
    it('should fetch single ledger entry by ID', async () => {
      const mockEntry: LedgerEntryDto = {
        id: 'entry-1',
        type: 'REDEEM',
        accountId: 'test-user-id',
        debit: 0,
        credit: 300,
        balanceAfter: 700,
        hash: 'hash-1',
        createdAt: '2025-01-15T14:30:00Z',
        transactionId: 'tx-1',
      };

      (walletApiModule.walletApi.getLedgerEntry as any).mockResolvedValue(mockEntry);

      const { result } = renderHook(() => useLedgerEntry('entry-1'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockEntry);
    });

    it('should disable query when entry ID is not provided', () => {
      const { result } = renderHook(() => useLedgerEntry(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useRedeemPoints', () => {
    it('should mutate to redeem points', async () => {
      (walletApiModule.walletApi.redeemPoints as any).mockResolvedValue({
        id: 'tx-redeem-1',
        type: 'REDEEM',
        amount: 300,
      });

      const { result } = renderHook(() => useRedeemPoints(), { wrapper });

      act(() => {
        result.current.mutate({
          points: 300,
          businessId: 'biz-123',
          purchaseAmount: 1000,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.type).toBe('REDEEM');
    });

    it('should handle redemption errors', async () => {
      const error = new Error('Insufficient balance');
      (walletApiModule.walletApi.redeemPoints as any).mockRejectedValue(error);

      const { result } = renderHook(() => useRedeemPoints(), { wrapper });

      act(() => {
        result.current.mutate({
          points: 5000,
          businessId: 'biz-123',
          purchaseAmount: 1000,
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('should invalidate balance query on successful redemption', async () => {
      (walletApiModule.walletApi.redeemPoints as any).mockResolvedValue({
        id: 'tx-redeem-1',
        type: 'REDEEM',
      });

      const { result } = renderHook(() => useRedeemPoints(), { wrapper });

      // Spy on queryClient invalidateQueries
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      act(() => {
        result.current.mutate({
          points: 300,
          businessId: 'biz-123',
          purchaseAmount: 1000,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  describe('useEarnPoints', () => {
    it('should mutate to earn points', async () => {
      (walletApiModule.walletApi.earnPoints as any).mockResolvedValue({
        id: 'tx-earn-1',
        type: 'EARN',
        amount: 150,
      });

      const { result } = renderHook(() => useEarnPoints(), { wrapper });

      act(() => {
        result.current.mutate({
          customerId: 'user-1',
          purchaseAmount: 1500,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.type).toBe('EARN');
    });

    it('should handle earn points errors', async () => {
      const error = new Error('Transaction failed');
      (walletApiModule.walletApi.earnPoints as any).mockRejectedValue(error);

      const { result } = renderHook(() => useEarnPoints(), { wrapper });

      act(() => {
        result.current.mutate({
          customerId: 'user-1',
          purchaseAmount: 1500,
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
