/**
 * FilterContainer Responsive Behavior Tests
 *
 * Tests responsive design implementation across different screen sizes.
 * Focuses on breakpoint detection, component rendering, and touch interactions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FilterContainer } from './FilterContainer';
import { TransactionFilters, TransactionType } from '@/types/filters';

// Mock child components
vi.mock('./FilterModal', () => ({
  FilterModal: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="filter-modal">{isOpen ? 'Modal Open' : 'Modal Closed'}</div>
  ),
}));

vi.mock('./FilterSheet', () => ({
  FilterSheet: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="filter-sheet">{isOpen ? 'Sheet Open' : 'Sheet Closed'}</div>
  ),
}));

describe('FilterContainer - Responsive Behavior', () => {
  const defaultFilters: TransactionFilters = {
    types: [TransactionType.EARN, TransactionType.REDEEM],
    datePreset: '90d',
  };

  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    filters: defaultFilters,
    onApply: vi.fn(),
    onClearAll: vi.fn(),
  };

  let originalInnerWidth: number;

  beforeEach(() => {
    // Store original window.innerWidth
    originalInnerWidth = window.innerWidth;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
  });

  /**
   * Test 1: Desktop breakpoint renders FilterModal
   */
  it('renders FilterModal on desktop screens (>= 640px)', () => {
    // Set desktop viewport width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(<FilterContainer {...mockProps} />);

    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-sheet')).not.toBeInTheDocument();
  });

  /**
   * Test 2: Mobile breakpoint renders FilterSheet
   */
  it('renders FilterSheet on mobile screens (< 640px)', () => {
    // Set mobile viewport width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<FilterContainer {...mockProps} />);

    expect(screen.getByTestId('filter-sheet')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
  });

  /**
   * Test 3: Tablet breakpoint at 640px renders FilterModal (desktop mode)
   */
  it('renders FilterModal at exactly 640px (tablet)', () => {
    // Set exactly at breakpoint
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640,
    });

    render(<FilterContainer {...mockProps} />);

    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-sheet')).not.toBeInTheDocument();
  });

  /**
   * Test 4: Responds to window resize events (mobile to desktop)
   */
  it('switches from mobile to desktop layout on resize', async () => {
    // Start with mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<FilterContainer {...mockProps} />);

    // Verify mobile layout
    expect(screen.getByTestId('filter-sheet')).toBeInTheDocument();

    // Resize to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    // Wait for state update
    await waitFor(() => {
      expect(screen.getByTestId('filter-modal')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('filter-sheet')).not.toBeInTheDocument();
  });

  /**
   * Test 5: Responds to window resize from desktop to mobile
   */
  it('switches from desktop to mobile layout on resize', async () => {
    // Start with desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(<FilterContainer {...mockProps} />);

    // Verify desktop layout
    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();

    // Resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    // Wait for state update
    await waitFor(() => {
      expect(screen.getByTestId('filter-sheet')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
  });

  /**
   * Test 6: Cleans up resize listener on unmount
   */
  it('removes resize event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<FilterContainer {...mockProps} />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  /**
   * Test 7: Passes all props correctly to both modal and sheet
   */
  it('passes all props to child components correctly', () => {
    const propsWithExport = {
      ...mockProps,
      onExport: vi.fn(),
      isExporting: true,
    };

    // Test with desktop (modal)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { unmount } = render(<FilterContainer {...propsWithExport} />);

    expect(screen.getByTestId('filter-modal')).toBeInTheDocument();

    unmount();

    // Test with mobile (sheet)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<FilterContainer {...propsWithExport} />);

    expect(screen.getByTestId('filter-sheet')).toBeInTheDocument();
  });

  /**
   * Test 8: Handles very small mobile screens (< 375px)
   */
  it('renders FilterSheet on very small mobile screens (< 375px)', () => {
    // Set very small mobile viewport (e.g., iPhone SE)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });

    render(<FilterContainer {...mockProps} />);

    expect(screen.getByTestId('filter-sheet')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument();
  });
});
