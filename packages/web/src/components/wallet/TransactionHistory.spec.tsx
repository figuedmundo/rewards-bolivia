import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionHistory } from './TransactionHistory';
import { render } from '@/test-setup/test-utils';
import type { LedgerEntryDto } from '@rewards-bolivia/shared-types';
import { useTransactionHistory } from '@/hooks/useWallet';

// Mock the useTransactionHistory hook
vi.mock('@/hooks/useWallet', () => ({
  useTransactionHistory: vi.fn(),
  useWalletBalance: vi.fn(),
  useUserProfile: vi.fn(),
  useRedeemPoints: vi.fn(),
  useEarnPoints: vi.fn(),
  useLedgerEntry: vi.fn(),
}));

const mockUseTransactionHistory = useTransactionHistory as ReturnType<typeof vi.fn>;

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
    mockUseTransactionHistory.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<TransactionHistory pageSize={10} />);

    // Should render multiple skeleton rows
    const skeletons = screen.getAllByTestId('transaction-skeleton');
    expect(skeletons.length).toBe(10);
  });

  it('should display transaction entries in table', async () => {
    mockUseTransactionHistory.mockReturnValue({
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
      expect(screen.getByText('Jan 10, 2025')).toBeInTheDocument(); // First entry date (en-US locale format)
      expect(screen.getByText('EARN')).toBeInTheDocument();
      expect(screen.getByText('REDEEM')).toBeInTheDocument();
    });
  });

  it('should display amount with correct sign', () => {
    mockUseTransactionHistory.mockReturnValue({
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
    mockUseTransactionHistory.mockReturnValue({
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
    mockUseTransactionHistory.mockReturnValue({
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
    mockUseTransactionHistory.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    render(<TransactionHistory />);

    expect(screen.getByText('Failed to load transaction history.')).toBeInTheDocument();
  });

  it('should handle pagination - next page button', async () => {
    mockUseTransactionHistory.mockReturnValue({
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

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).not.toBeDisabled();

    await userEvent.click(nextButton);

    // After click, the component state updates and calls hook with new page
    mockUseTransactionHistory.mockReturnValue({
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
    expect(screen.getByTestId('page-counter')).toHaveTextContent('Page 2 of 3');
  });

  it('should disable next button on last page', () => {
    mockUseTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 20, // Ensure pagination shows (total > pageSize)
        page: 2, // Set to last page (20 / 10 = 2 pages, so page 2 is last)
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory pageSize={10} />);

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();
  });

  it('should disable previous button on first page', () => {
    mockUseTransactionHistory.mockReturnValue({
      data: {
        entries: mockEntries,
        total: 20, // Need more than 10 to show pagination
        page: 1,
        pageSize: 10,
      },
      isLoading: false,
      error: null,
    });

    render(<TransactionHistory pageSize={10} />);

    const prevButton = screen.getByTestId('previous-button');
    expect(prevButton).toBeDisabled();
  });

  it('should show page counter correctly', async () => {
    mockUseTransactionHistory.mockReturnValue({
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

    // Click next to go to page 2
    const nextButton = screen.getByTestId('next-button');
    await userEvent.click(nextButton);

    // Update mock to return page 2 data
    mockUseTransactionHistory.mockReturnValue({
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
    expect(screen.getByTestId('page-counter')).toHaveTextContent('Page 2 of 3');
  });

  it('should hide pagination when showPagination is false', () => {
    mockUseTransactionHistory.mockReturnValue({
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
    mockUseTransactionHistory.mockReturnValue({
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
    mockUseTransactionHistory.mockReturnValue({
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
    const entriesWithLargeBalance: LedgerEntryDto[] = [
      {
        ...mockEntries[0],
        balanceAfter: 1234567,
      },
    ];

    mockUseTransactionHistory.mockReturnValue({
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
