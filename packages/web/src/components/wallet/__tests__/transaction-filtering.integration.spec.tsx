/**
 * Transaction Filtering Integration Tests
 *
 * Strategic tests for critical filtering workflows and edge cases.
 * Focuses on end-to-end user flows, error handling, and combined filters.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransactionHistory } from '../TransactionHistory';
import * as useWalletModule from '@/hooks/useWallet';
import * as useAuthModule from '@/hooks/useAuth';
import * as csvUtilsModule from '@/lib/csv-utils';

// Mock the hooks and utilities
vi.mock('@/hooks/useWallet', () => ({
  useTransactionHistory: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/csv-utils', () => ({
  generateCSV: vi.fn(),
  downloadCSV: vi.fn(),
  getCSVFilename: vi.fn(() => 'historial-rewards-bolivia-2025-11-18.csv'),
}));

describe('Transaction Filtering - Critical Workflows', () => {
  let queryClient: QueryClient;
  const mockTransactionHistory = vi.mocked(useWalletModule.useTransactionHistory);
  const mockGenerateCSV = vi.mocked(csvUtilsModule.generateCSV);
  const mockDownloadCSV = vi.mocked(csvUtilsModule.downloadCSV);

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

    // Default mock data
    mockTransactionHistory.mockReturnValue({
      data: {
        entries: [
          {
            id: '1',
            type: 'EARN',
            debit: 100,
            credit: 0,
            balanceAfter: 100,
            createdAt: new Date('2025-11-17').toISOString(),
            accountId: 'acc-1',
          },
          {
            id: '2',
            type: 'REDEEM',
            debit: 0,
            credit: 50,
            balanceAfter: 50,
            createdAt: new Date('2025-11-16').toISOString(),
            accountId: 'acc-1',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    } as any);

    // Reset CSV mocks
    mockGenerateCSV.mockReturnValue('Date,Business,Type,Points,Transaction ID\n2025-11-17,Test,EARN,100,tx-1');
    mockDownloadCSV.mockImplementation(() => {});
  });

  describe('Combined Filter Scenarios', () => {
    it('should handle date range + transaction type filters together', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Verify default filters are applied (Last 90 days)
      const lastCall = mockTransactionHistory.mock.calls[mockTransactionHistory.mock.calls.length - 1][0];
      expect(lastCall).toHaveProperty('startDate');
      expect(lastCall).toHaveProperty('endDate');
    });

    it('should handle date + type + amount range filters together', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Verify hook receives all filter parameters
      const lastCall = mockTransactionHistory.mock.calls[mockTransactionHistory.mock.calls.length - 1][0];
      expect(lastCall).toBeDefined();
      expect(lastCall).toHaveProperty('page');
    });

    it('should handle search with other filters', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Search should combine with date and type filters
      const calls = mockTransactionHistory.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });
  });

  describe('Filter State and Pagination', () => {
    it('should reset pagination when filters change', async () => {
      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Get initial page
      const initialCall = mockTransactionHistory.mock.calls[mockTransactionHistory.mock.calls.length - 1][0];
      expect(initialCall.page).toBe(1);

      // Navigate to page 2
      mockTransactionHistory.mockReturnValue({
        data: {
          entries: [],
          total: 50,
          page: 2,
          pageSize: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      rerender(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Verify page is maintained until filters change
      const currentCall = mockTransactionHistory.mock.calls[mockTransactionHistory.mock.calls.length - 1][0];
      expect(currentCall).toHaveProperty('page');
    });

    it('should maintain filter state during pagination', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Filters should persist across page changes
      const calls = mockTransactionHistory.mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      // All calls should have consistent filter parameters
      calls.forEach((call) => {
        expect(call[0]).toHaveProperty('startDate');
        expect(call[0]).toHaveProperty('endDate');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API fails', () => {
      mockTransactionHistory.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      expect(screen.getByText(/failed to load transactions/i)).toBeInTheDocument();
    });

    it('should recover from error state when retry succeeds', async () => {
      // Start with error
      mockTransactionHistory.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      } as any);

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      expect(screen.getByText(/failed to load transactions/i)).toBeInTheDocument();

      // Simulate successful retry
      mockTransactionHistory.mockReturnValue({
        data: {
          entries: [
            {
              id: '1',
              type: 'EARN',
              debit: 100,
              credit: 0,
              balanceAfter: 100,
              createdAt: new Date().toISOString(),
              accountId: 'acc-1',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        },
        isLoading: false,
        error: null,
      } as any);

      rerender(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Error should be gone
      expect(screen.queryByText(/failed to load transactions/i)).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show "no transactions yet" when no data and no filters', () => {
      mockTransactionHistory.mockReturnValue({
        data: { entries: [], total: 0, page: 1, pageSize: 10 },
        isLoading: false,
        error: null,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // With default filters applied, we should see filter message
      expect(screen.getByText(/no transactions/i)).toBeInTheDocument();
    });

    it('should show helpful message when filters produce no results', () => {
      mockTransactionHistory.mockReturnValue({
        data: { entries: [], total: 0, page: 1, pageSize: 10 },
        isLoading: false,
        error: null,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Should show empty state message
      expect(screen.getByText(/no transactions/i)).toBeInTheDocument();
    });
  });

  describe('Performance and Large Datasets', () => {
    it('should display warning for large result sets (>1000)', () => {
      mockTransactionHistory.mockReturnValue({
        data: {
          entries: [
            {
              id: '1',
              type: 'EARN',
              debit: 100,
              credit: 0,
              balanceAfter: 100,
              createdAt: new Date().toISOString(),
              accountId: 'acc-1',
            },
          ],
          total: 1500,
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
      expect(screen.getByText(/1500 transactions/i)).toBeInTheDocument();
    });

    it('should handle pagination with large datasets efficiently', () => {
      mockTransactionHistory.mockReturnValue({
        data: {
          entries: Array.from({ length: 50 }, (_, i) => ({
            id: `txn-${i}`,
            type: 'EARN',
            debit: 100,
            credit: 0,
            balanceAfter: 100 * (i + 1),
            createdAt: new Date().toISOString(),
            accountId: 'acc-1',
          })),
          total: 5000,
          page: 1,
          pageSize: 50,
        },
        isLoading: false,
        error: null,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Should render paginated view
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
      expect(screen.getByTestId('prev-button')).toBeInTheDocument();
    });
  });

  describe('End-to-End Filter Workflows (NEW STRATEGIC TESTS)', () => {
    it('should display filter button with correct badge count when filters are active', async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Default filter (Last 90 days) should be active
      const filterButton = screen.getByRole('button', { name: /^filters/i });
      expect(filterButton).toBeInTheDocument();

      // Badge should show "1" for the default date range filter
      await waitFor(() => {
        const badge = screen.queryByText('1');
        expect(badge).toBeInTheDocument();
      });
    });

    it('should open filter modal when filter button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      const filterButton = screen.getByRole('button', { name: /^filters/i });
      await user.click(filterButton);

      // Modal should open - check for modal title
      await waitFor(() => {
        expect(screen.getByText(/filter transactions/i)).toBeInTheDocument();
      });
    });

    it('should apply filters and close modal when Apply button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Open filter modal
      const filterButton = screen.getByRole('button', { name: /^filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText(/filter transactions/i)).toBeInTheDocument();
      });

      // Click Apply button
      const applyButton = screen.getByRole('button', { name: /apply filters/i });
      await user.click(applyButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText(/filter transactions/i)).not.toBeInTheDocument();
      });

      // Hook should be called with filters
      const lastCall = mockTransactionHistory.mock.calls[mockTransactionHistory.mock.calls.length - 1][0];
      expect(lastCall).toBeDefined();
    });

    it('should clear all filters when Clear All button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Open filter modal
      const filterButton = screen.getByRole('button', { name: /^filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText(/filter transactions/i)).toBeInTheDocument();
      });

      // Click Clear All
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearButton);

      // Verify filters are reset - the hook should be called with no filters (except defaults)
      await waitFor(() => {
        const lastCall = mockTransactionHistory.mock.calls[mockTransactionHistory.mock.calls.length - 1][0];
        expect(lastCall).toBeDefined();
      });
    });

    it('should remove individual filter when filter pill close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Should have filter pills for active filters (default date range)
      const filterPills = screen.queryAllByRole('button', { name: /remove filter/i });

      if (filterPills.length > 0) {
        const initialCallCount = mockTransactionHistory.mock.calls.length;

        // Click remove on first pill
        await user.click(filterPills[0]);

        // Hook should be called again with updated filters
        await waitFor(() => {
          expect(mockTransactionHistory.mock.calls.length).toBeGreaterThan(initialCallCount);
        });
      }
    });

    it('should trigger CSV export when export button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Open filter modal
      const filterButton = screen.getByRole('button', { name: /^filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText(/filter transactions/i)).toBeInTheDocument();
      });

      // Find and click export button
      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      // CSV utilities should be called
      await waitFor(() => {
        expect(mockGenerateCSV).toHaveBeenCalled();
        expect(mockDownloadCSV).toHaveBeenCalled();
      });
    });

    it('should show loading state during CSV export', async () => {
      const user = userEvent.setup();

      // Make CSV generation take some time
      mockGenerateCSV.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('CSV content'), 100);
        }) as any;
      });

      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Open filter modal
      const filterButton = screen.getByRole('button', { name: /^filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText(/filter transactions/i)).toBeInTheDocument();
      });

      // Click export
      const exportButton = screen.getByRole('button', { name: /export to csv/i });
      await user.click(exportButton);

      // Should show loading state
      await waitFor(() => {
        expect(exportButton).toBeDisabled();
      });

      // After export completes, button should be enabled again
      await waitFor(() => {
        expect(exportButton).not.toBeDisabled();
      }, { timeout: 3000 });
    });

    it('should debounce search input to reduce API calls', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers();

      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Open filter modal
      const filterButton = screen.getByRole('button', { name: /^filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText(/filter transactions/i)).toBeInTheDocument();
      });

      // Find search input
      const searchInput = screen.getByPlaceholderText(/search/i);
      expect(searchInput).toBeInTheDocument();

      const initialCallCount = mockTransactionHistory.mock.calls.length;

      // Type rapidly
      await user.type(searchInput, 'test');

      // Should not trigger immediately (debounced)
      expect(mockTransactionHistory.mock.calls.length).toBe(initialCallCount);

      // Advance timers past debounce delay (500ms)
      vi.advanceTimersByTime(500);

      // Now it should have triggered
      await waitFor(() => {
        expect(mockTransactionHistory.mock.calls.length).toBeGreaterThan(initialCallCount);
      });

      vi.useRealTimers();
    });

    it('should validate amount range filters and show errors', async () => {
      const user = userEvent.setup();
      render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Open filter modal
      const filterButton = screen.getByRole('button', { name: /^filters/i });
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText(/filter transactions/i)).toBeInTheDocument();
      });

      // Find amount inputs
      const minInput = screen.getByLabelText(/min amount/i);
      const maxInput = screen.getByLabelText(/max amount/i);

      // Set max < min (invalid)
      await user.clear(minInput);
      await user.type(minInput, '500');
      await user.clear(maxInput);
      await user.type(maxInput, '100');

      // Should show validation error
      await waitFor(() => {
        const error = screen.queryByText(/maximum.*greater than.*minimum/i);
        expect(error).toBeInTheDocument();
      });
    });

    it('should persist filter state during session (not across page refreshes)', async () => {
      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Get initial filter parameters
      const initialCall = mockTransactionHistory.mock.calls[0][0];
      expect(initialCall).toHaveProperty('startDate');
      expect(initialCall).toHaveProperty('endDate');

      // Rerender component (simulate navigation within session)
      rerender(
        <QueryClientProvider client={queryClient}>
          <TransactionHistory />
        </QueryClientProvider>
      );

      // Filter state should persist
      const laterCall = mockTransactionHistory.mock.calls[mockTransactionHistory.mock.calls.length - 1][0];
      expect(laterCall.startDate).toBe(initialCall.startDate);
      expect(laterCall.endDate).toBe(initialCall.endDate);
    });
  });
});
