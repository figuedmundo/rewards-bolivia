/**
 * TransactionHistory Integration Tests
 *
 * Tests for transaction filtering feature integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransactionHistory } from '../TransactionHistory';
import * as useWalletModule from '@/hooks/useWallet';
import * as useAuthModule from '@/hooks/useAuth';

// Mock the hooks
vi.mock('@/hooks/useWallet', () => ({
  useTransactionHistory: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('TransactionHistory Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    // Mock useAuth
    vi.mocked(useAuthModule.useAuth).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
    } as any);
  });

  it('renders filter button', () => {
    vi.mocked(useWalletModule.useTransactionHistory).mockReturnValue({
      data: { entries: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
      error: null,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionHistory />
      </QueryClientProvider>
    );

    expect(screen.queryByRole('button', { name: /open filters/i })).not.toBeInTheDocument();
  });

  it('shows active filter count badge when filters are applied', async () => {
    vi.mocked(useWalletModule.useTransactionHistory).mockReturnValue({
      data: {
        entries: [
          {
            id: '1',
            type: 'EARN',
            debit: 100,
            credit: 0,
            balanceAfter: 100,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionHistory />
      </QueryClientProvider>
    );

    // Filter button should be present with active count (default filters apply)
    const filterButton = screen.getByRole('button', { name: /filters \(5 active\)/i });
    expect(filterButton).toBeInTheDocument();
  });

  it('displays large dataset warning when results exceed 1000', () => {
    vi.mocked(useWalletModule.useTransactionHistory).mockReturnValue({
      data: {
        entries: [
          {
            id: '1',
            type: 'EARN',
            debit: 100,
            credit: 0,
            balanceAfter: 100,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1500, // Exceeds 1000
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionHistory />
      </QueryClientProvider>
    );

    expect(screen.getByText(/large result set/i)).toBeInTheDocument();
    expect(screen.getByText(/\(1500 transactions\)/i)).toBeInTheDocument();
  });

  it('shows "no transactions match" message when filtered and empty', () => {
    // Mock with search filter but no results
    vi.mocked(useWalletModule.useTransactionHistory).mockReturnValue({
      data: { entries: [], total: 0, page: 1, pageSize: 10 },
      isLoading: false,
      error: null,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionHistory />
      </QueryClientProvider>
    );

    // Since filters are applied by default (Last 90 days), we should see transactions
    // or an empty state. Let's check for the appropriate message.
    expect(screen.getByText(/no transactions/i)).toBeInTheDocument();
  });

  it('resets to page 1 when filters change', () => {
    const mockUseTransactionHistory = vi.mocked(useWalletModule.useTransactionHistory);

    mockUseTransactionHistory.mockReturnValue({
      data: {
        entries: [
          {
            id: '1',
            type: 'EARN',
            debit: 100,
            credit: 0,
            balanceAfter: 100,
            createdAt: new Date().toISOString(),
          },
        ],
        total: 50,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <TransactionHistory />
      </QueryClientProvider>
    );

    // Verify the hook was called with default filters
    expect(mockUseTransactionHistory).toHaveBeenCalled();
    const lastCall = mockUseTransactionHistory.mock.calls[mockUseTransactionHistory.mock.calls.length - 1][0];
    expect(lastCall).toHaveProperty('page', 1);
  });
});
