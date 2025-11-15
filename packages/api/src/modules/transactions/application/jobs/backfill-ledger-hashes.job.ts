import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { LedgerHashService } from '../services/ledger-services/ledger-hash.service';

/**
 * Backfill job to compute SHA256 hashes for existing ledger entries
 *
 * Purpose:
 * This job is a one-time utility to backfill hashes for ledger entries created
 * before Epic 6 implementation (per-transaction hashing). Run this manually after
 * deploying the Epic 6 changes.
 *
 * Usage:
 * ```bash
 * pnpm --filter api exec ts-node src/modules/transactions/application/jobs/backfill-ledger-hashes.job.ts
 * ```
 *
 * This job will:
 * 1. Find all ledger entries without hashes (where hash IS NULL)
 * 2. Compute SHA256 hash for each entry using LedgerHashService
 * 3. Store the hash back in the database
 * 4. Report progress and completion
 *
 * Performance:
 * - Processes entries in batches of 100 to avoid memory issues
 * - Uses Prisma transactions for atomic updates
 * - Estimated performance: ~1000 entries per second on standard hardware
 */
@Injectable()
export class BackfillLedgerHashesJob {
  private readonly logger = new Logger(BackfillLedgerHashesJob.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerHashService: LedgerHashService,
  ) {}

  /**
   * Execute the backfill job
   * Finds all entries without hashes and computes them
   */
  async execute(): Promise<void> {
    this.logger.log('========================================');
    this.logger.log('Starting ledger hash backfill job...');
    this.logger.log(
      'This will compute hashes for all entries created before Epic 6',
    );
    this.logger.log('========================================');

    // Find all entries without hashes, ordered by creation date
    const entriesWithoutHash = await this.prisma.pointLedger.findMany({
      where: { hash: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        type: true,
        accountId: true,
        debit: true,
        credit: true,
        balanceAfter: true,
        transactionId: true,
        createdAt: true,
      },
    });

    this.logger.log(
      `Found ${entriesWithoutHash.length} entries without hashes`,
    );

    if (entriesWithoutHash.length === 0) {
      this.logger.log('No entries need backfill. All entries have hashes!');
      return;
    }

    let processed = 0;
    let errors = 0;
    const batchSize = 100;
    const startTime = Date.now();

    // Process in batches to avoid memory issues
    for (let i = 0; i < entriesWithoutHash.length; i += batchSize) {
      const batch = entriesWithoutHash.slice(i, i + batchSize);

      try {
        await this.prisma.$transaction(async (tx) => {
          for (const entry of batch) {
            try {
              // Compute hash for the entry
              const hash = this.ledgerHashService.computeEntryHash(entry);

              // Update the entry with the computed hash
              await tx.pointLedger.update({
                where: { id: entry.id },
                data: { hash },
              });

              processed++;
            } catch (err) {
              errors++;
              this.logger.error(`Failed to hash entry ${entry.id}:`, err);
            }
          }
        });

        // Log progress every batch
        const percentComplete = Math.round(
          (processed / entriesWithoutHash.length) * 100,
        );
        this.logger.log(
          `Progress: ${processed}/${entriesWithoutHash.length} (${percentComplete}%)`,
        );
      } catch (err) {
        this.logger.error(`Error processing batch at offset ${i}:`, err);
        errors += batch.length;
      }
    }

    const duration = Date.now() - startTime;
    const durationSeconds = (duration / 1000).toFixed(2);
    const entriesPerSecond = (processed / (duration / 1000)).toFixed(0);

    this.logger.log('========================================');
    this.logger.log('Backfill complete!');
    this.logger.log(`Successfully processed: ${processed} entries`);
    this.logger.log(`Failed: ${errors} entries`);
    this.logger.log(`Duration: ${durationSeconds}s`);
    this.logger.log(`Rate: ${entriesPerSecond} entries/sec`);
    this.logger.log('========================================');

    if (errors > 0) {
      throw new Error(
        `Backfill completed with ${errors} errors. Please check logs.`,
      );
    }
  }
}
