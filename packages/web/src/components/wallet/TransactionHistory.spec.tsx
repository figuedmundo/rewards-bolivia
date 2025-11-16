import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionHistory } from './TransactionHistory';
import { render } from '@/test-setup/test-utils';
import type { LedgerEntryDto } from '@rewards-bolivia/shared-types';

// Mock the useTransactionHistory hook
vi.mock('@/hooks/useWallet', () => ({
  useTransactionHistory: vi.fn(),
  useWalletBalance: vi.fn(),
  useUserProfile: vi.fn(),
  useRedeemPoints: vi.fn(),
  useEarnPoints: vi.fn(),
  useLedgerEntry: vi.fn(),
}));

describe('TransactionHistory Component', () => {
  const mockEntries: LedgerEntryDto[] = [
    {
      id: 'entry-1',
      type: 'EARN',
      accountId: 'user-1',
      debit: 500,
      credit: 0,
      balanceAfter: 1000,
      hash: 'hash-1',
      createdAt: '2025-01-10T10:00:00Z',
      transactionId: 'tx-1',
    },
    {
      id: 'entry-2',
      type: 'REDEEM',
      accountId: 'user-1',
      debit: 0,
      credit: 300,
      balanceAfter: 700,
      hash: 'hash-2',
      createdAt: '2025-01-15T14:30:00Z',
      transactionId: 'tx-2',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading skeletons while fetching', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<TransactionHistory pageSize={10} />);

    // Should render multiple skeleton rows
    const skeletons = screen.getAllByRole('generic').filter((el) =>
      el.className.includes('skeleton')
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display transaction entries in table', async () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 2,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory />);

    await waitFor(() => {
      expect(screen.getByText('2025-01-10')).toBeInTheDocument(); // First entry date
      expect(screen.getByText('EARN')).toBeInTheDocument();
      expect(screen.getByText('REDEEM')).toBeInTheDocument();
    });
  });

  it('should display amount with correct sign', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 2,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory />);

    // EARN should have + sign (debit > 0)
    expect(screen.getByText('+500')).toBeInTheDocument();
    // REDEEM should have - sign (credit > 0)
    expect(screen.getByText('-300')).toBeInTheDocument();
  });

  it('should display transaction caption showing count', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 2,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory />);

    expect(screen.getByText('Showing 2 of 2 transactions')).toBeInTheDocument();
  });

  it('should show empty state when no transactions', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: {
        entries: [],
        total: 0,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory />);

    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    expect(
      screen.getByText('Your transaction history will appear here')
    ).toBeInTheDocument();
  });

  it('should display error message on fetch failure', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    render(<TransactionHistory />);

    expect(screen.getByText('Failed to load transaction history.')).toBeInTheDocument();
  });

  it('should handle pagination - next page button', async () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 30,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    const { rerender } = render(<TransactionHistory pageSize={10} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).not.toBeDisabled();

    await userEvent.click(nextButton);

    // After click, the component state updates and calls hook with new page
    useTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 30,
        page: 2,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    rerender(<TransactionHistory pageSize={10} />);
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('should disable next button on last page', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries.slice(0, 1),
        total: 1,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory pageSize={10} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('should disable previous button on first page', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 2,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory pageSize={10} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeDisabled();
  });

  it('should show page counter correctly', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 25,
        page: 2,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory pageSize={10} />);

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('should hide pagination when showPagination is false', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 2,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory showPagination={false} />);

    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Page .* of .*/)).not.toBeInTheDocument();
  });

  it('should render table headers correctly', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 2,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Balance After')).toBeInTheDocument();
  });

  it('should use custom pageSize prop', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    useTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 25,
        page: 1,
        pageSize: 5,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory pageSize={5} />);

    // With pageSize 5 and total 25, should show Page 1 of 5
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('should format balance with thousand separators', () => {
    const { useTransactionHistory } = require('@/hooks/useWallet');
    const entriesWithLargeBalance: LedgerEntryDto[] = [
      {
        ...mockEntries[0],
        balanceAfter: 1234567,
      },
    ];

    useTransactionHistory.mockReturnValue({
      data: {
        entries: entriesWithLargeBalance,
        total: 1,
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory />);

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });
});
