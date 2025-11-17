/**
 * AmountRangeFilter Component Tests
 *
 * Tests for amount range filtering with validation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AmountRangeFilter } from './AmountRangeFilter';

describe('AmountRangeFilter', () => {
  it('renders minimum and maximum inputs', () => {
    const mockOnMinChange = vi.fn();
    const mockOnMaxChange = vi.fn();
    render(<AmountRangeFilter onMinChange={mockOnMinChange} onMaxChange={mockOnMaxChange} />);

    expect(screen.getByLabelText(/minimum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum/i)).toBeInTheDocument();
  });

  it('displays current values in inputs', () => {
    const mockOnMinChange = vi.fn();
    const mockOnMaxChange = vi.fn();
    render(
      <AmountRangeFilter
        minValue={100}
        maxValue={500}
        onMinChange={mockOnMinChange}
        onMaxChange={mockOnMaxChange}
      />
    );

    const minInput = screen.getByLabelText(/minimum/i) as HTMLInputElement;
    const maxInput = screen.getByLabelText(/maximum/i) as HTMLInputElement;

    expect(minInput.value).toBe('100');
    expect(maxInput.value).toBe('500');
  });

  it('calls onMinChange when minimum input changes', async () => {
    const user = userEvent.setup();
    const mockOnMinChange = vi.fn();
    const mockOnMaxChange = vi.fn();
    render(<AmountRangeFilter onMinChange={mockOnMinChange} onMaxChange={mockOnMaxChange} />);

    const minInput = screen.getByLabelText(/minimum/i);
    await user.type(minInput, '50');

    expect(mockOnMinChange).toHaveBeenCalled();
  });

  it('calls onMaxChange when maximum input changes', async () => {
    const user = userEvent.setup();
    const mockOnMinChange = vi.fn();
    const mockOnMaxChange = vi.fn();
    render(<AmountRangeFilter onMinChange={mockOnMinChange} onMaxChange={mockOnMaxChange} />);

    const maxInput = screen.getByLabelText(/maximum/i);
    await user.type(maxInput, '200');

    expect(mockOnMaxChange).toHaveBeenCalled();
  });

  it('shows error when max is less than min', () => {
    const mockOnMinChange = vi.fn();
    const mockOnMaxChange = vi.fn();
    render(
      <AmountRangeFilter
        minValue={500}
        maxValue={100}
        onMinChange={mockOnMinChange}
        onMaxChange={mockOnMaxChange}
      />
    );

    expect(
      screen.getByText(/maximum amount must be greater than or equal to minimum amount/i)
    ).toBeInTheDocument();
  });

  it('does not show error when values are valid', () => {
    const mockOnMinChange = vi.fn();
    const mockOnMaxChange = vi.fn();
    render(
      <AmountRangeFilter
        minValue={100}
        maxValue={500}
        onMinChange={mockOnMinChange}
        onMaxChange={mockOnMaxChange}
      />
    );

    expect(
      screen.queryByText(/maximum amount must be greater than or equal to minimum amount/i)
    ).not.toBeInTheDocument();
  });

  it('shows note about negative values', () => {
    const mockOnMinChange = vi.fn();
    const mockOnMaxChange = vi.fn();
    render(<AmountRangeFilter onMinChange={mockOnMinChange} onMaxChange={mockOnMaxChange} />);

    expect(screen.getByText(/negative values represent redemptions and burns/i)).toBeInTheDocument();
  });
});
