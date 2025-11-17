import type { PointLedger, LedgerEntryType } from '@prisma/client';

export interface QueryOptions {
  limit?: number;
  offset?: number;
}

export interface LedgerQueryFilters {
  accountId?: string;
  transactionId?: string;
  startDate?: Date;
  endDate?: Date;
  types?: LedgerEntryType[];
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  limit: number;
  offset: number;
}

export interface ILedgerRepository {
  getTotalPointsIssued(): Promise<number>;
  getTotalPointsRedeemed(): Promise<number>;
  getTotalPointsBurned(): Promise<number>;

  // 30-day trailing window calculations
  getPointsIssuedInLast30Days(): Promise<number>;
  getPointsRedeemedInLast30Days(): Promise<number>;
  getTransactionCountInLast30Days(): Promise<number>;

  // Granular query methods (legacy - kept for backward compatibility)
  findLedgerEntriesByAccount(
    accountId: string,
    options?: QueryOptions,
  ): Promise<{ entries: PointLedger[]; total: number }>;

  findLedgerEntriesByTransaction(transactionId: string): Promise<PointLedger[]>;

  findLedgerEntriesByDateRange(
    startDate: Date,
    endDate: Date,
    options?: QueryOptions,
  ): Promise<{ entries: PointLedger[]; total: number }>;

  findLedgerEntryById(id: string): Promise<PointLedger | null>;

  // NEW: Unified query method with comprehensive filters
  queryLedgerEntries(
    filters: LedgerQueryFilters,
  ): Promise<{ entries: PointLedger[]; total: number }>;
}
