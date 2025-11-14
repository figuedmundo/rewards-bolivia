import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import type { PointLedger } from '@prisma/client';

@Injectable()
export class LedgerHashService {
  /**
   * Compute SHA256 hash for a single ledger entry
   * Format: SHA256(id|type|accountId|debit|credit|balanceAfter|transactionId|createdAt)
   */
  computeEntryHash(entry: PointLedger | LedgerEntryData): string {
    const data = `${entry.id}|${entry.type}|${entry.accountId}|${entry.debit}|${entry.credit}|${entry.balanceAfter}|${entry.transactionId}|${entry.createdAt.toISOString()}`;
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify a ledger entry's hash by recomputing
   */
  verifyEntryHash(entry: PointLedger): boolean {
    if (!entry.hash) return false;
    const computed = this.computeEntryHash(entry);
    return entry.hash === computed;
  }

  /**
   * Compute hash for pre-creation data (before entry has createdAt)
   * Uses current timestamp
   */
  computeHashForNewEntry(data: NewLedgerEntryData): {
    hash: string;
    timestamp: Date;
  } {
    const timestamp = new Date();
    const entryWithTimestamp = { ...data, createdAt: timestamp };
    const hash = this.computeEntryHash(entryWithTimestamp);
    return { hash, timestamp };
  }
}

interface LedgerEntryData {
  id: string;
  type: string;
  accountId: string;
  debit: number;
  credit: number;
  balanceAfter: number;
  transactionId: string;
  createdAt: Date;
}

interface NewLedgerEntryData {
  id: string;
  type: string;
  accountId: string;
  debit: number;
  credit: number;
  balanceAfter: number;
  transactionId: string;
}
