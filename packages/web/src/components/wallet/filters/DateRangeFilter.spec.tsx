/**
 * DateRangeFilter Component Tests
 *
 * Tests for date range filtering with presets and custom dates
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangeFilter } from './DateRangeFilter';

describe('DateRangeFilter', () => {
  it('renders preset buttons', () => {
    const mockOnChange = vi.fn();
    render(<DateRangeFilter onChange={mockOnChange} />);

    expect(screen.getByRole('button', { name: /last 7 days/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /last 30 days/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /last 90 days/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /this year/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all time/i })).toBeInTheDocument();
  });

  it('calls onChange when preset is selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<DateRangeFilter onChange={mockOnChange} />);

    const last7DaysButton = screen.getByRole('button', { name: /last 7 days/i });
    await user.click(last7DaysButton);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      '7d'
    );
  });

  it('highlights selected preset', () => {
    const mockOnChange = vi.fn();
    render(<DateRangeFilter onChange={mockOnChange} selectedPreset="30d" />);

    const last30DaysButton = screen.getByRole('button', { name: /last 30 days/i });
    // Check if button has primary variant class (selected state)
    expect(last30DaysButton.className).toContain('bg-primary');
  });

  it('renders custom date pickers', () => {
    const mockOnChange = vi.fn();
    render(<DateRangeFilter onChange={mockOnChange} />);

    expect(screen.getByText(/start date/i)).toBeInTheDocument();
    expect(screen.getByText(/end date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start date/i })).toBeInTheDocument();
  });
});
