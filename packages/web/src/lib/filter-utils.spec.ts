/**
 * Tests for Filter Utility Functions
 *
 * Focused tests covering critical functionality and edge cases
 * for date range calculations, active filter formatting, and filter state management.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDateRangeForPreset,
  formatActiveFilters,
  getActiveFilterCount,
  isFiltersEmpty,
  removeFilter,
  getDefaultFilters,
} from './filter-utils';
import { TransactionType, type TransactionFilters, type DatePreset } from '../types/filters';

describe('getDateRangeForPreset', () => {
  beforeEach(() => {
    // Mock current date to 2025-11-17 for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-17T12:00:00Z'));
  });

  it('should calculate date range for 7d preset', () => {
    const { startDate, endDate } = getDateRangeForPreset('7d');
    expect(endDate).toBe('2025-11-17');
    expect(startDate).toBe('2025-11-10');
  });

  it('should calculate date range for 90d preset', () => {
    const { startDate, endDate } = getDateRangeForPreset('90d');
    expect(endDate).toBe('2025-11-17');
    expect(startDate).toBe('2025-08-19');
  });

  it('should calculate date range for year preset (start of current year)', () => {
    const { startDate, endDate } = getDateRangeForPreset('year');
    expect(endDate).toBe('2025-11-17');
    expect(startDate).toBe('2025-01-01');
  });
});

describe('formatActiveFilters', () => {
  it('should format date range with preset label', () => {
    const filters: TransactionFilters = {
      startDate: '2025-10-18',
      endDate: '2025-11-17',
      datePreset: '30d',
    };

    const activeFilters = formatActiveFilters(filters);

    expect(activeFilters).toHaveLength(1);
    expect(activeFilters[0].label).toBe('Last 30 days');
    expect(activeFilters[0].filterField).toBe('startDate');
  });

  it('should format transaction type filters', () => {
    const filters: TransactionFilters = {
      types: [TransactionType.EARN, TransactionType.REDEEM],
    };

    const activeFilters = formatActiveFilters(filters);

    expect(activeFilters).toHaveLength(2);
    expect(activeFilters[0].label).toBe('Type: EARN');
    expect(activeFilters[1].label).toBe('Type: REDEEM');
  });

  it('should format amount range with both min and max', () => {
    const filters: TransactionFilters = {
      minAmount: 100,
      maxAmount: 500,
    };

    const activeFilters = formatActiveFilters(filters);

    expect(activeFilters).toHaveLength(1);
    expect(activeFilters[0].label).toBe('Amount: 100 to 500');
  });

  it('should format search filter', () => {
    const filters: TransactionFilters = {
      search: 'coffee shop',
    };

    const activeFilters = formatActiveFilters(filters);

    expect(activeFilters).toHaveLength(1);
    expect(activeFilters[0].label).toBe('Search: "coffee shop"');
    expect(activeFilters[0].filterField).toBe('search');
  });
});

describe('getActiveFilterCount', () => {
  it('should return 0 for empty filters', () => {
    const filters: TransactionFilters = {};
    expect(getActiveFilterCount(filters)).toBe(0);
  });

  it('should count date range as 1 filter', () => {
    const filters: TransactionFilters = {
      startDate: '2025-10-01',
      endDate: '2025-11-17',
    };
    expect(getActiveFilterCount(filters)).toBe(1);
  });

  it('should count each transaction type separately', () => {
    const filters: TransactionFilters = {
      types: [TransactionType.EARN, TransactionType.REDEEM, TransactionType.BURN],
    };
    expect(getActiveFilterCount(filters)).toBe(3);
  });

  it('should count combined filters correctly', () => {
    const filters: TransactionFilters = {
      startDate: '2025-10-01',
      endDate: '2025-11-17',
      types: [TransactionType.EARN],
      minAmount: 100,
      search: 'coffee',
    };
    // 1 (date) + 1 (type) + 1 (amount) + 1 (search) = 4
    expect(getActiveFilterCount(filters)).toBe(4);
  });
});

describe('removeFilter', () => {
  it('should remove date range completely when removing startDate', () => {
    const filters: TransactionFilters = {
      startDate: '2025-10-01',
      endDate: '2025-11-17',
      datePreset: '30d',
    };

    const result = removeFilter(filters, 'startDate');

    expect(result.startDate).toBeUndefined();
    expect(result.endDate).toBeUndefined();
    expect(result.datePreset).toBeUndefined();
  });

  it('should remove specific transaction type when value provided', () => {
    const filters: TransactionFilters = {
      types: [TransactionType.EARN, TransactionType.REDEEM],
    };

    const result = removeFilter(filters, 'types', TransactionType.EARN);

    expect(result.types).toEqual([TransactionType.REDEEM]);
  });

  it('should remove amount range completely when removing minAmount', () => {
    const filters: TransactionFilters = {
      minAmount: 100,
      maxAmount: 500,
    };

    const result = removeFilter(filters, 'minAmount');

    expect(result.minAmount).toBeUndefined();
    expect(result.maxAmount).toBeUndefined();
  });
});

describe('getDefaultFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-17T12:00:00Z'));
  });

  it('should return filters with Last 90 days preset', () => {
    const defaults = getDefaultFilters();

    expect(defaults.datePreset).toBe('90d');
    expect(defaults.startDate).toBe('2025-08-19');
    expect(defaults.endDate).toBe('2025-11-17');
    expect(defaults.types).toBeUndefined(); // No type filtering
  });
});
