/**
 * SearchInput Component Tests
 *
 * Tests for search input with debouncing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders search input with placeholder', () => {
    const mockOnChange = vi.fn();
    render(<SearchInput value="" onChange={mockOnChange} />);

    expect(
      screen.getByPlaceholderText(/search by merchant or transaction id/i)
    ).toBeInTheDocument();
  });

  it('displays custom placeholder', () => {
    const mockOnChange = vi.fn();
    render(
      <SearchInput value="" onChange={mockOnChange} placeholder="Search transactions..." />
    );

    expect(screen.getByPlaceholderText(/search transactions/i)).toBeInTheDocument();
  });

  it('shows current value in input', () => {
    const mockOnChange = vi.fn();
    render(<SearchInput value="Test Search" onChange={mockOnChange} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('Test Search');
  });

  it('accepts user input and updates local value', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<SearchInput value="" onChange={mockOnChange} debounceMs={100} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    // Input should have the typed value
    expect(input).toHaveValue('test');
  });

  it('shows clear button when input has text', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<SearchInput value="test" onChange={mockOnChange} />);

    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('hides clear button when input is empty', () => {
    const mockOnChange = vi.fn();
    render(<SearchInput value="" onChange={mockOnChange} />);

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });

  it('clears input when clear button is clicked', () => {
    const mockOnChange = vi.fn();
    render(<SearchInput value="test" onChange={mockOnChange} />);

    const clearButton = screen.getByRole('button', { name: /clear search/i });
    clearButton.click();

    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('shows warning when input is below minimum characters', () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(<SearchInput value="" onChange={mockOnChange} minChars={3} />);

    // Re-render with value below min characters
    rerender(<SearchInput value="ab" onChange={mockOnChange} minChars={3} />);

    expect(screen.getByText(/enter at least 3 characters to search/i)).toBeInTheDocument();
  });
});
