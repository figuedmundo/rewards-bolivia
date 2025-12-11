import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ExpirationNotificationService } from '../services/expiration-notification.service';
import {
  NotificationType,
} from '../../domain/entities/notification-log.entity';

/**
 * CheckExpiringPointsJob handles the scheduled job for detecting and notifying users
 * about expiring loyalty points. Runs daily at 9 AM UTC (configurable).
 *
 * Processes three notification windows:
 * - 30-day window: 28-32 days before expiration
 * - 7-day window: 6-8 days before expiration
 * - 1-day window: 0-2 days before expiration
 */
@Injectable()
export class CheckExpiringPointsJob {
  private readonly logger = new Logger(CheckExpiringPointsJob.name);

  constructor(
    private readonly expirationNotificationService: ExpirationNotificationService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Main job handler that runs on the configured schedule
   * Processes all three notification windows and logs summary statistics
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleCron() {
    const jobStartTime = Date.now();
    const startTimestamp = new Date().toISOString();
    this.logger.log(
      `Starting expiring points check job at ${startTimestamp}`,
    );

    try {
      const allStats = {
        '30-day': { sent: 0, failed: 0, skipped: 0, checked: 0 },
        '7-day': { sent: 0, failed: 0, skipped: 0, checked: 0 },
        '1-day': { sent: 0, failed: 0, skipped: 0, checked: 0 },
      };

      // Process 30-day window (28-32 days from now)
      await this.processNotificationWindow(
        'EXPIRATION_30_DAYS',
        { minDays: 28, maxDays: 32 },
        allStats['30-day'],
        '30-day window (28-32 days)',
      );

      // Process 7-day window (6-8 days from now)
      await this.processNotificationWindow(
        'EXPIRATION_7_DAYS',
        { minDays: 6, maxDays: 8 },
        allStats['7-day'],
        '7-day window (6-8 days)',
      );

      // Process 1-day window (0-2 days from now)
      await this.processNotificationWindow(
        'EXPIRATION_1_DAY',
        { minDays: 0, maxDays: 2 },
        allStats['1-day'],
        '1-day window (0-2 days)',
      );

      // Log job completion with summary
      const executionTimeMs = Date.now() - jobStartTime;
      const executionTimeSecs = (executionTimeMs / 1000).toFixed(2);

      this.logger.log(
        `Expiring points check job completed in ${executionTimeSecs}s`,
      );

      // Log overall summary
      this.logger.log(
        `Job Summary - 30-day: sent=${allStats['30-day'].sent}, failed=${allStats['30-day'].failed}, skipped=${allStats['30-day'].skipped} | ` +
        `7-day: sent=${allStats['7-day'].sent}, failed=${allStats['7-day'].failed}, skipped=${allStats['7-day'].skipped} | ` +
        `1-day: sent=${allStats['1-day'].sent}, failed=${allStats['1-day'].failed}, skipped=${allStats['1-day'].skipped}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to process expiring points check job: ${errorMessage}`,
        stack,
      );
    }
  }

  /**
   * Processes a single notification window
   *
   * @param notificationType The type of notification to send
   * @param windowDays Day range for the notification window
   * @param stats Statistics object to accumulate results
   * @param windowLabel Human-readable window description for logging
   */
  private async processNotificationWindow(
    notificationType: string,
    windowDays: { minDays: number; maxDays: number },
    stats: { sent: number; failed: number; skipped: number; checked: number },
    windowLabel: string,
  ): Promise<void> {
    try {
      // Calculate notification window
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + windowDays.minDays);
      startDate.setUTCHours(0, 0, 0, 0);

      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + windowDays.maxDays);
      endDate.setUTCHours(23, 59, 59, 999);

      this.logger.log(
        `Processing ${windowLabel} - window: ${startDate.toISOString()} to ${endDate.toISOString()}`,
      );

      // Find expiring points in the window
      const expiringPoints =
        await this.expirationNotificationService.findExpiringPoints({
          start: startDate,
          end: endDate,
        });

      stats.checked = expiringPoints.length;

      if (expiringPoints.length === 0) {
        this.logger.log(
          `No expiring points found in ${windowLabel}`,
        );
        return;
      }

      // Process notifications
      const result =
        await this.expirationNotificationService.processNotifications(
          expiringPoints,
          notificationType as NotificationType,
        );

      stats.sent = result.sent;
      stats.failed = result.failed;
      stats.skipped = result.skipped;

      this.logger.log(
        `${windowLabel} - users checked: ${stats.checked}, sent: ${stats.sent}, failed: ${stats.failed}, skipped: ${stats.skipped}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error processing ${windowLabel}: ${errorMessage}`,
      );
      stats.failed++;
    }
  }
}
