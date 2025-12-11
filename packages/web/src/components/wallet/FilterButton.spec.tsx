/**
 * FilterButton Component Tests
 *
 * Tests for filter button with badge display
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterButton } from './FilterButton';

describe('FilterButton', () => {
  it('renders filter button with label', () => {
    const mockOnClick = vi.fn();
    render(<FilterButton activeFilterCount={0} onClick={mockOnClick} />);

    expect(screen.getByRole('button', { name: /open filters/i })).toBeInTheDocument();
    expect(screen.getByText(/filters/i)).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    render(<FilterButton activeFilterCount={0} onClick={mockOnClick} />);

    const button = screen.getByRole('button', { name: /open filters/i });
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not show badge when no active filters', () => {
    const mockOnClick = vi.fn();
    render(<FilterButton activeFilterCount={0} onClick={mockOnClick} />);

    // Badge with count should not be in the document
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows badge with count when filters are active', () => {
    const mockOnClick = vi.fn();
    render(<FilterButton activeFilterCount={3} onClick={mockOnClick} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('updates aria-label when filters are active', () => {
    const mockOnClick = vi.fn();
    render(<FilterButton activeFilterCount={2} onClick={mockOnClick} />);

    expect(screen.getByRole('button', { name: /filters \(2 active\)/i })).toBeInTheDocument();
  });
});
