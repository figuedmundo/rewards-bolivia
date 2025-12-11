/**
 * ActiveFilters Component Tests
 *
 * Tests for active filters display with removal
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActiveFilters } from './ActiveFilters';
import { TransactionFilters, TransactionType } from '@/types/filters';

describe('ActiveFilters', () => {
  it('does not render when no filters are active', () => {
    const mockOnRemoveFilter = vi.fn();
    const mockOnClearAll = vi.fn();
    const filters: TransactionFilters = {};

    const { container } = render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders active filters label when filters exist', () => {
    const mockOnRemoveFilter = vi.fn();
    const mockOnClearAll = vi.fn();
    const filters: TransactionFilters = {
      types: [TransactionType.EARN],
    };

    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );

    expect(screen.getByText(/active filters:/i)).toBeInTheDocument();
  });

  it('renders Clear All button', () => {
    const mockOnRemoveFilter = vi.fn();
    const mockOnClearAll = vi.fn();
    const filters: TransactionFilters = {
      types: [TransactionType.EARN],
    };

    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );

    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('calls onClearAll when Clear All button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnRemoveFilter = vi.fn();
    const mockOnClearAll = vi.fn();
    const filters: TransactionFilters = {
      types: [TransactionType.EARN],
    };

    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );

    const clearAllButton = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearAllButton);

    expect(mockOnClearAll).toHaveBeenCalledTimes(1);
  });

  it('displays filter pills for active filters', () => {
    const mockOnRemoveFilter = vi.fn();
    const mockOnClearAll = vi.fn();
    const filters: TransactionFilters = {
      types: [TransactionType.EARN],
      search: 'test',
    };

    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );

    // Check that filter pills are rendered (formatActiveFilters creates labels)
    expect(screen.getByText(/Type:/i)).toBeInTheDocument();
    expect(screen.getByText(/Search:/i)).toBeInTheDocument();
  });
});
