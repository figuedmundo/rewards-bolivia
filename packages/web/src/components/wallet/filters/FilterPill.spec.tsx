/**
 * FilterPill Component Tests
 *
 * Tests for removable filter pill component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPill } from './FilterPill';

describe('FilterPill', () => {
  it('renders filter label', () => {
    const mockOnRemove = vi.fn();
    render(<FilterPill label="Last 30 days" onRemove={mockOnRemove} />);

    expect(screen.getByText(/last 30 days/i)).toBeInTheDocument();
  });

  it('renders remove button', () => {
    const mockOnRemove = vi.fn();
    render(<FilterPill label="Test Filter" onRemove={mockOnRemove} />);

    expect(screen.getByRole('button', { name: /remove test filter filter/i })).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnRemove = vi.fn();
    render(<FilterPill label="Test Filter" onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', { name: /remove test filter filter/i });
    await user.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });
});
