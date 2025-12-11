/**
 * CSV Export Utility Functions
 *
 * Provides utilities for generating and downloading CSV files
 * from transaction data with proper escaping and formatting.
 */

import type { LedgerEntryDto } from '@rewards-bolivia/shared-types';

/**
 * Escape CSV field value
 *
 * Properly escapes values containing commas, quotes, or newlines
 * according to RFC 4180 CSV specification.
 *
 * @param value - Value to escape
 * @returns Escaped value safe for CSV
 */
function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Format transaction amount for CSV
 *
 * Formats the amount based on debit/credit:
 * - Positive for earned points (credit > 0)
 * - Negative for redeemed/burned points (debit > 0)
 *
 * @param entry - Ledger entry
 * @returns Formatted amount as string
 */
function formatAmount(entry: LedgerEntryDto): string {
  // If credit > 0, it's an earning (positive)
  // If debit > 0, it's a redemption/burn (negative)
  const amount = entry.credit > 0 ? entry.credit : -entry.debit;
  return amount.toString();
}

/**
 * Format date for CSV
 *
 * Converts ISO 8601 date string to readable format (YYYY-MM-DD HH:mm:ss)
 * Preserves the UTC time from the input to maintain consistency
 *
 * @param dateString - ISO 8601 date string
 * @returns Formatted date string
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
}

/**
 * Get business/merchant name from ledger entry
 *
 * Extracts business name from the reason field or returns a default value.
 * The reason field typically contains merchant information.
 *
 * @param entry - Ledger entry
 * @returns Business name or default value
 */
function getBusinessName(entry: LedgerEntryDto): string {
  // The reason field may contain business information
  // For now, return the reason as-is, or a default value
  return entry.reason || 'N/A';
}

/**
 * Generate CSV content from ledger entries
 *
 * Converts an array of ledger entries into a CSV string with proper formatting
 * and escaping. Includes columns: Date, Business, Type, Points, Transaction ID.
 *
 * @param entries - Array of ledger entries to export
 * @returns CSV string with headers and data rows
 *
 * @example
 * const csv = generateCSV(ledgerEntries);
 * downloadCSV(csv, getCSVFilename());
 */
export function generateCSV(entries: LedgerEntryDto[]): string {
  // CSV header row
  const headers = ['Date', 'Business', 'Type', 'Points', 'Transaction ID'];
  const rows: string[] = [headers.join(',')];

  // Add data rows
  entries.forEach((entry) => {
    const row = [
      escapeCSVField(formatDate(entry.createdAt)),
      escapeCSVField(getBusinessName(entry)),
      escapeCSVField(entry.type),
      escapeCSVField(formatAmount(entry)),
      escapeCSVField(entry.transactionId),
    ];
    rows.push(row.join(','));
  });

  // Join rows with newlines
  return rows.join('\n');
}

/**
 * Download CSV file
 *
 * Triggers a browser download of the provided CSV content
 * with UTF-8 encoding support.
 *
 * @param content - CSV content string
 * @param filename - Desired filename for the download
 *
 * @example
 * const csv = generateCSV(entries);
 * downloadCSV(csv, 'transactions.csv');
 */
export function downloadCSV(content: string, filename: string): void {
  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const csvContent = BOM + content;

  // Create blob with UTF-8 encoding
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get CSV filename with current date
 *
 * Generates a filename in the format: historial-rewards-bolivia-YYYY-MM-DD.csv
 * where the date represents the export date (not the filter date range).
 *
 * @returns Formatted filename with current date
 *
 * @example
 * const filename = getCSVFilename();
 * // Returns: 'historial-rewards-bolivia-2025-11-17.csv'
 */
export function getCSVFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `historial-rewards-bolivia-${year}-${month}-${day}.csv`;
}
