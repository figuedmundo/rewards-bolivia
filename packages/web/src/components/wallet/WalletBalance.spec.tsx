import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletBalance } from './WalletBalance';
import { render } from '@/test-setup/test-utils';
import { useWalletBalance } from '@/hooks/useWallet';

// Mock the useWalletBalance hook
vi.mock('@/hooks/useWallet', () => ({
  useWalletBalance: vi.fn(),
  useTransactionHistory: vi.fn(),
  useRedeemPoints: vi.fn(),
  useEarnPoints: vi.fn(),
  useUserProfile: vi.fn(),
  useLedgerEntry: vi.fn(),
}));

const mockUseWalletBalance = useWalletBalance as ReturnType<typeof vi.fn>;

describe('WalletBalance Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render balance card with loading skeleton', () => {
    mockUseWalletBalance.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<WalletBalance />);

    // Check for loading skeleton
    const skeleton = screen.getByTestId('balance-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should display balance when data loads successfully', async () => {
    mockUseWalletBalance.mockReturnValue({
      data: 1500,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<WalletBalance />);

    await waitFor(() => {
      const balanceElement = screen.getByTestId('wallet-balance');
      expect(balanceElement).toBeInTheDocument();
      expect(balanceElement).toHaveTextContent('1,500');
    });
  });

  it('should format large numbers with thousand separators', () => {
    mockUseWalletBalance.mockReturnValue({
      data: 1234567,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<WalletBalance />);

    const balanceElement = screen.getByTestId('wallet-balance');
    expect(balanceElement).toHaveTextContent('1,234,567');
  });

  it('should show "points available" label', () => {
    mockUseWalletBalance.mockReturnValue({
      data: 1000,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<WalletBalance />);

    expect(screen.getByText('points available')).toBeInTheDocument();
  });

  it('should display error message when fetch fails', () => {
    const error = new Error('Failed to load balance');
    mockUseWalletBalance.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
      refetch: vi.fn(),
    });

    render(<WalletBalance />);

    expect(screen.getByText('Failed to load balance.')).toBeInTheDocument();
  });

  it('should show retry button on error', async () => {
    const mockRefetch = vi.fn();
    mockUseWalletBalance.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load balance'),
      refetch: mockRefetch,
    });

    render(<WalletBalance />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    await userEvent.click(retryButton);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('should display card header with title and coins icon', () => {
    mockUseWalletBalance.mockReturnValue({
      data: 1000,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<WalletBalance />);

    expect(screen.getByText('Points Balance')).toBeInTheDocument();
    // Coins icon should be rendered as SVG
    const svgElement = screen.getByText('Points Balance').closest('div')?.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('should handle zero balance correctly', () => {
    mockUseWalletBalance.mockReturnValue({
      data: 0,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<WalletBalance />);

    const balanceElement = screen.getByTestId('wallet-balance');
    expect(balanceElement).toHaveTextContent('0');
  });

  it('should maintain loading state while refetching', async () => {
    mockUseWalletBalance.mockReturnValue({
      data: 1000,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isFetching: true,
    });

    render(<WalletBalance />);

    // Should show balance even during refetch
    const balanceElement = screen.getByTestId('wallet-balance');
    expect(balanceElement).toHaveTextContent('1,000');
  });

  it('should apply correct styling classes', () => {
    mockUseWalletBalance.mockReturnValue({
      data: 1000,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(<WalletBalance />);

    // Card component should have proper styling
    const card = container.querySelector('[class*="card"]');
    expect(card).toBeInTheDocument();
  });
});
