/**
 * TransactionTypeFilter Component Tests
 *
 * Tests for transaction type multi-select filtering
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionTypeFilter } from './TransactionTypeFilter';
import { TransactionType } from '@/types/filters';

describe('TransactionTypeFilter', () => {
  it('renders all transaction type options', () => {
    const mockOnChange = vi.fn();
    render(<TransactionTypeFilter value={[]} onChange={mockOnChange} />);

    expect(screen.getByText(/earn/i)).toBeInTheDocument();
    expect(screen.getByText(/redeem/i)).toBeInTheDocument();
    expect(screen.getByText(/adjustment/i)).toBeInTheDocument();
    expect(screen.getByText(/burn/i)).toBeInTheDocument();
  });

  it('shows checked state for selected types', () => {
    const mockOnChange = vi.fn();
    render(
      <TransactionTypeFilter
        value={[TransactionType.EARN, TransactionType.REDEEM]}
        onChange={mockOnChange}
      />
    );

    const earnCheckbox = screen.getByRole('checkbox', { name: /earn/i });
    const redeemCheckbox = screen.getByRole('checkbox', { name: /redeem/i });
    const adjustmentCheckbox = screen.getByRole('checkbox', { name: /adjustment/i });

    expect(earnCheckbox).toBeChecked();
    expect(redeemCheckbox).toBeChecked();
    expect(adjustmentCheckbox).not.toBeChecked();
  });

  it('calls onChange when type is toggled', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<TransactionTypeFilter value={[TransactionType.EARN]} onChange={mockOnChange} />);

    const redeemCheckbox = screen.getByRole('checkbox', { name: /redeem/i });
    await user.click(redeemCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith([TransactionType.EARN, TransactionType.REDEEM]);
  });

  it('removes type from selection when unchecked', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <TransactionTypeFilter
        value={[TransactionType.EARN, TransactionType.REDEEM]}
        onChange={mockOnChange}
      />
    );

    const earnCheckbox = screen.getByRole('checkbox', { name: /earn/i });
    await user.click(earnCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith([TransactionType.REDEEM]);
  });

  it('shows "Select All" when not all types are selected', () => {
    const mockOnChange = vi.fn();
    render(<TransactionTypeFilter value={[TransactionType.EARN]} onChange={mockOnChange} />);

    expect(screen.getByRole('button', { name: /select all/i })).toBeInTheDocument();
  });

  it('shows "Deselect All" when all types are selected', () => {
    const mockOnChange = vi.fn();
    render(
      <TransactionTypeFilter
        value={[
          TransactionType.EARN,
          TransactionType.REDEEM,
          TransactionType.ADJUSTMENT,
          TransactionType.BURN,
        ]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByRole('button', { name: /deselect all/i })).toBeInTheDocument();
  });

  it('shows warning when no types are selected', () => {
    const mockOnChange = vi.fn();
    render(<TransactionTypeFilter value={[]} onChange={mockOnChange} />);

    expect(screen.getByText(/no types selected/i)).toBeInTheDocument();
  });
});
