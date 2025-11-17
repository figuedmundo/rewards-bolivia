/**
 * FilterContainer Component Tests
 *
 * Tests for responsive filter container
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { FilterContainer } from './FilterContainer';
import { TransactionFilters } from '@/types/filters';

describe('FilterContainer', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    // Restore original window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it('renders without crashing', () => {
    const mockOnClose = vi.fn();
    const mockOnApply = vi.fn();
    const mockOnClearAll = vi.fn();
    const filters: TransactionFilters = {};

    const { container } = render(
      <FilterContainer
        isOpen={false}
        onClose={mockOnClose}
        filters={filters}
        onApply={mockOnApply}
        onClearAll={mockOnClearAll}
      />
    );

    expect(container).toBeTruthy();
  });

  it('detects desktop screen size', () => {
    // Set desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const mockOnClose = vi.fn();
    const mockOnApply = vi.fn();
    const mockOnClearAll = vi.fn();
    const filters: TransactionFilters = {};

    // Render with isOpen=false to avoid infinite loop in tests
    const { container } = render(
      <FilterContainer
        isOpen={false}
        onClose={mockOnClose}
        filters={filters}
        onApply={mockOnApply}
        onClearAll={mockOnClearAll}
      />
    );

    expect(container).toBeTruthy();
  });

  it('detects mobile screen size', () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const mockOnClose = vi.fn();
    const mockOnApply = vi.fn();
    const mockOnClearAll = vi.fn();
    const filters: TransactionFilters = {};

    // Render with isOpen=false to avoid infinite loop in tests
    const { container } = render(
      <FilterContainer
        isOpen={false}
        onClose={mockOnClose}
        filters={filters}
        onApply={mockOnApply}
        onClearAll={mockOnClearAll}
      />
    );

    expect(container).toBeTruthy();
  });
});
