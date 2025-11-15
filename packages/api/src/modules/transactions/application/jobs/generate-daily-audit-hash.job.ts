import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditHashService } from '../services/ledger-services/audit-hash.service';

@Injectable()
export class GenerateDailyAuditHashJob {
  private readonly logger = new Logger(GenerateDailyAuditHashJob.name);

  constructor(private readonly auditHashService: AuditHashService) {}

  /**
   * Run daily at 3 AM UTC to generate audit hash for previous day
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron() {
    this.logger.log('Starting daily audit hash generation...');

    try {
      // Generate hash for yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setUTCHours(0, 0, 0, 0);

      const result = await this.auditHashService.generateDailyHash(yesterday);

      this.logger.log(
        `Daily audit hash generated successfully for ${yesterday.toISOString().split('T')[0]}`,
      );
      this.logger.log(
        `Hash: ${result.hash} | Entries: ${result.entryCount} | Types: ${JSON.stringify(result.transactionTypes)}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to generate daily audit hash: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    this.logger.log('Daily audit hash generation complete');
  }
}
