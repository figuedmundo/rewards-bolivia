/**
 * Filter type definitions for transaction filtering
 *
 * Defines types and interfaces for filtering ledger transactions
 * by date range, transaction type, amount range, and search criteria.
 */

/**
 * Transaction types matching backend LedgerEntryType enum
 */
export enum TransactionType {
  EARN = 'EARN',
  REDEEM = 'REDEEM',
  ADJUSTMENT = 'ADJUSTMENT',
  BURN = 'BURN',
}

/**
 * Date range presets for quick filtering
 */
export type DatePreset = '7d' | '30d' | '90d' | 'year' | 'all';

/**
 * Complete filter state for transaction filtering
 *
 * All fields are optional to allow flexible filtering combinations.
 * Filters use AND logic between different types, OR logic within type array.
 */
export interface TransactionFilters {
  /**
   * Date range start (ISO 8601 format: YYYY-MM-DD)
   */
  startDate?: string;

  /**
   * Date range end (ISO 8601 format: YYYY-MM-DD)
   */
  endDate?: string;

  /**
   * Selected date preset (for UI state management)
   */
  datePreset?: DatePreset;

  /**
   * Transaction types to include (OR logic within array)
   * Empty array or undefined means all types
   */
  types?: TransactionType[];

  /**
   * Minimum transaction amount (inclusive)
   * Supports negative values for redemptions
   */
  minAmount?: number;

  /**
   * Maximum transaction amount (inclusive)
   * Supports negative values for redemptions
   */
  maxAmount?: number;

  /**
   * Search term for merchant/business name or transaction ID
   * Case-insensitive partial matching
   */
  search?: string;
}

/**
 * Active filter representation for display as pills/tags
 *
 * Used to show active filters above the transaction list
 * with individual remove functionality.
 */
export interface ActiveFilter {
  /**
   * Unique key for React rendering
   */
  key: string;

  /**
   * Human-readable label for the filter
   * Examples: "Last 30 days", "Type: EARN", "Amount: 100-500"
   */
  label: string;

  /**
   * Field name in TransactionFilters that this filter represents
   * Used to remove the specific filter
   */
  filterField: keyof TransactionFilters;

  /**
   * Optional value to remove (for array-based filters like types)
   */
  value?: any;
}
