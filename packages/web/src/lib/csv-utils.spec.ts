/**
 * Tests for CSV Export Utility Functions
 *
 * Focused tests covering CSV generation, escaping, formatting,
 * and filename generation functionality.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { generateCSV, downloadCSV, getCSVFilename } from './csv-utils';
import type { LedgerEntryDto } from '@rewards-bolivia/shared-types';

describe('generateCSV', () => {
  it('should generate CSV with headers and data rows', () => {
    const entries: LedgerEntryDto[] = [
      {
        id: '1',
        type: 'EARN',
        accountId: 'acc-1',
        debit: 0,
        credit: 100,
        balanceAfter: 100,
        reason: 'Purchase at Coffee Shop',
        hash: 'hash1',
        createdAt: '2025-11-17T10:00:00Z',
        transactionId: 'txn-1',
      },
    ];

    const csv = generateCSV(entries);

    expect(csv).toContain('Date,Business,Type,Points,Transaction ID');
    expect(csv).toContain('2025-11-17 10:00:00');
    expect(csv).toContain('Coffee Shop');
    expect(csv).toContain('EARN');
    expect(csv).toContain('100');
    expect(csv).toContain('txn-1');
  });

  it('should properly escape commas in business names', () => {
    const entries: LedgerEntryDto[] = [
      {
        id: '1',
        type: 'EARN',
        accountId: 'acc-1',
        debit: 0,
        credit: 50,
        balanceAfter: 50,
        reason: 'Smith, Jones & Associates',
        hash: 'hash1',
        createdAt: '2025-11-17T10:00:00Z',
        transactionId: 'txn-1',
      },
    ];

    const csv = generateCSV(entries);

    // Business name with comma should be wrapped in quotes
    expect(csv).toContain('"Smith, Jones & Associates"');
  });

  it('should properly escape quotes in business names', () => {
    const entries: LedgerEntryDto[] = [
      {
        id: '1',
        type: 'EARN',
        accountId: 'acc-1',
        debit: 0,
        credit: 50,
        balanceAfter: 50,
        reason: 'Joe\'s "Best" Coffee',
        hash: 'hash1',
        createdAt: '2025-11-17T10:00:00Z',
        transactionId: 'txn-1',
      },
    ];

    const csv = generateCSV(entries);

    // Quotes should be escaped as double quotes
    expect(csv).toContain('Joe\'s ""Best"" Coffee');
  });

  it('should format positive amounts for earned points', () => {
    const entries: LedgerEntryDto[] = [
      {
        id: '1',
        type: 'EARN',
        accountId: 'acc-1',
        debit: 0,
        credit: 250,
        balanceAfter: 250,
        reason: 'Purchase',
        hash: 'hash1',
        createdAt: '2025-11-17T10:00:00Z',
        transactionId: 'txn-1',
      },
    ];

    const csv = generateCSV(entries);
    const lines = csv.split('\n');

    // Amount should be positive (250)
    expect(lines[1]).toContain(',250,');
  });

  it('should format negative amounts for redeemed points', () => {
    const entries: LedgerEntryDto[] = [
      {
        id: '1',
        type: 'REDEEM',
        accountId: 'acc-1',
        debit: 100,
        credit: 0,
        balanceAfter: 150,
        reason: 'Redemption',
        hash: 'hash1',
        createdAt: '2025-11-17T10:00:00Z',
        transactionId: 'txn-1',
      },
    ];

    const csv = generateCSV(entries);
    const lines = csv.split('\n');

    // Amount should be negative (-100)
    expect(lines[1]).toContain(',-100,');
  });

  it('should handle empty entries array', () => {
    const csv = generateCSV([]);

    // Should only contain headers
    expect(csv).toBe('Date,Business,Type,Points,Transaction ID');
  });
});

describe('downloadCSV', () => {
  beforeEach(() => {
    // Mock DOM methods
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a download link and trigger download', () => {
    const content = 'Date,Business,Type,Points,Transaction ID\n2025-11-17,Test,EARN,100,txn-1';
    const filename = 'test.csv';

    // Mock createElement and URL methods
    const mockLink = {
      setAttribute: vi.fn(),
      click: vi.fn(),
      style: {},
    } as any;
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    downloadCSV(content, filename);

    // Verify link was created and configured
    expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:test');
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', filename);
    expect(mockLink.click).toHaveBeenCalled();

    // Verify cleanup
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test');
  });
});

describe('getCSVFilename', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-11-17T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should generate filename with current date', () => {
    const filename = getCSVFilename();
    expect(filename).toBe('historial-rewards-bolivia-2025-11-17.csv');
  });

  it('should pad single-digit months and days with zeros', () => {
    vi.setSystemTime(new Date('2025-03-05T12:00:00Z'));
    const filename = getCSVFilename();
    expect(filename).toBe('historial-rewards-bolivia-2025-03-05.csv');
  });
});
