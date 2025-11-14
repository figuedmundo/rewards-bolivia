import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/prisma.service';
import { LedgerHashService } from './ledger-hash.service';
import type { PointLedger, Prisma } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

@Injectable()
export class LedgerCreationHelper {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerHashService: LedgerHashService,
  ) {}

  /**
   * Create a ledger entry with computed hash
   * Uses transaction context if provided
   */
  async createLedgerEntry(
    data: Omit<Prisma.PointLedgerCreateInput, 'hash' | 'id'>,
    tx?: Prisma.TransactionClient,
  ): Promise<PointLedger> {
    const client = tx || this.prisma;

    // Pre-generate ID
    const id = createId();

    // Compute hash with pre-determined ID and timestamp
    const { hash, timestamp } = this.ledgerHashService.computeHashForNewEntry({
      id,
      type: data.type,
      accountId: data.accountId,
      debit: data.debit,
      credit: data.credit,
      balanceAfter: data.balanceAfter,
      transactionId: data.transaction.connect.id,
    });

    // Create entry with hash in single DB call
    return client.pointLedger.create({
      data: {
        ...data,
        id,
        hash,
        createdAt: timestamp,
      },
    });
  }
}
