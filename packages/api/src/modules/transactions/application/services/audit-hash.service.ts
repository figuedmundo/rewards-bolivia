import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import type { DailyAuditHash, PointLedger } from '@prisma/client';

export interface HashVerificationResult {
  valid: boolean;
  stored: string;
  computed: string;
  entryCount: number;
  date: Date;
}

@Injectable()
export class AuditHashService {
  private readonly logger = new Logger(AuditHashService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate daily audit hash for all ledger entries on a given date
   */
  async generateDailyHash(date: Date): Promise<DailyAuditHash> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    this.logger.log(
      `Generating daily audit hash for ${startOfDay.toISOString().split('T')[0]}`,
    );

    // Check if hash already exists for this date
    const existing = await this.prisma.dailyAuditHash.findUnique({
      where: { date: startOfDay },
    });

    if (existing) {
      this.logger.warn(
        `Hash already exists for ${startOfDay.toISOString().split('T')[0]}, returning existing`,
      );
      return existing;
    }

    // Fetch all ledger entries for the day
    const entries = await this.prisma.pointLedger.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    this.logger.debug(`Found ${entries.length} ledger entries for the day`);

    // Generate hash
    const hash = this.computeHash(entries);

    // Extract unique transaction types
    const transactionTypes = [...new Set(entries.map((e) => e.type))];

    // Store in database
    const result = await this.prisma.dailyAuditHash.create({
      data: {
        date: startOfDay,
        hash,
        entryCount: entries.length,
        transactionTypes,
      },
    });

    this.logger.log(
      `Created daily audit hash: ${hash} (${entries.length} entries, types: ${JSON.stringify(transactionTypes)})`,
    );

    return result;
  }

  /**
   * Compute SHA256 hash of ledger entries (deterministic)
   */
  private computeHash(entries: PointLedger[]): string {
    const hash = createHash('sha256');

    for (const entry of entries) {
      // Create deterministic string representation
      // Format: id|type|accountId|debit|credit|balanceAfter|transactionId|createdAt
      const data = `${entry.id}|${entry.type}|${entry.accountId}|${entry.debit}|${entry.credit}|${entry.balanceAfter}|${entry.transactionId}|${entry.createdAt.toISOString()}`;
      hash.update(data);
    }

    return hash.digest('hex');
  }

  /**
   * Verify a daily hash by recomputing it from ledger data
   */
  async verifyDailyHash(date: Date): Promise<HashVerificationResult> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Get stored hash
    const stored = await this.prisma.dailyAuditHash.findUnique({
      where: { date: startOfDay },
    });

    if (!stored) {
      throw new Error(
        `No audit hash found for date: ${startOfDay.toISOString().split('T')[0]}`,
      );
    }

    // Recompute hash from ledger
    const entries = await this.prisma.pointLedger.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    const computed = this.computeHash(entries);

    const valid = stored.hash === computed;

    if (!valid) {
      this.logger.error(
        `Hash verification FAILED for ${startOfDay.toISOString().split('T')[0]}! Stored: ${stored.hash}, Computed: ${computed}`,
      );
    } else {
      this.logger.log(
        `Hash verification PASSED for ${startOfDay.toISOString().split('T')[0]}`,
      );
    }

    return {
      valid,
      stored: stored.hash,
      computed,
      entryCount: entries.length,
      date: startOfDay,
    };
  }

  /**
   * Get daily hash for a specific date
   */
  async getDailyHash(date: Date): Promise<DailyAuditHash | null> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    return this.prisma.dailyAuditHash.findUnique({
      where: { date: startOfDay },
    });
  }

  /**
   * Get all daily hashes (with optional limit)
   */
  async getAllDailyHashes(limit?: number): Promise<DailyAuditHash[]> {
    return this.prisma.dailyAuditHash.findMany({
      orderBy: { date: 'desc' },
      take: limit,
    });
  }
}
