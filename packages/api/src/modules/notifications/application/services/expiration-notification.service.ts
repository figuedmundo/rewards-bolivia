import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { LoggerService } from '@rewards-bolivia/logger';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import type { INotificationRepository } from '../../domain/repositories/notification.repository';
import { ExpiringPointsDto } from '../../domain/dtos/expiring-points.dto';
import {
  NotificationStatus,
  NotificationType,
} from '../../domain/entities/notification-log.entity';
import { SendExpirationNotificationUseCase } from '../use-cases/send-expiration-notification.use-case';

/**
 * ExpirationNotificationService handles the business logic for detecting expiring points
 * and processing notifications. It manages:
 * - Querying PointLedger for expiring points within notification windows
 * - Batch processing notifications with deduplication and user preference checking
 * - Logging notification attempts and aggregating statistics
 */
@Injectable()
export class ExpirationNotificationService {
  private readonly logger = new LoggerService('ExpirationNotificationService');
  private readonly BATCH_SIZE = 100;

  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    private readonly prisma: PrismaService,
    private readonly sendExpirationNotificationUseCase: SendExpirationNotificationUseCase,
  ) {}

  /**
   * Finds all points expiring within the specified notification window
   * Groups results by userId and expirationDate
   *
   * @param notificationWindow Date range for notification window
   * @returns Array of ExpiringPointsDto with aggregated points per user/date
   */
  async findExpiringPoints(notificationWindow: {
    start: Date;
    end: Date;
  }): Promise<ExpiringPointsDto[]> {
    try {
      // Query PointLedger for entries with expiresAt in the window
      // Only include entries where credit > 0 (points added, not removed)
      const expiringEntries = await this.prisma.pointLedger.findMany({
        where: {
          expiresAt: {
            gte: notificationWindow.start,
            lte: notificationWindow.end,
          },
          credit: { gt: 0 },
        },
        select: {
          accountId: true,
          credit: true,
          expiresAt: true,
        },
      });

      // Group by userId and expirationDate
      const groupedMap = new Map<string, ExpiringPointsDto>();
      for (const entry of expiringEntries) {
        const key = `${entry.accountId}|${entry.expiresAt?.toISOString()}`;
        if (groupedMap.has(key)) {
          const existing = groupedMap.get(key)!;
          existing.pointsExpiring += entry.credit;
        } else {
          groupedMap.set(key, {
            userId: entry.accountId,
            pointsExpiring: entry.credit,
            expirationDate: entry.expiresAt!,
            daysRemaining: Math.ceil(
              (entry.expiresAt!.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            ),
          });
        }
      }

      return Array.from(groupedMap.values());
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error finding expiring points', {
        error: errorMessage,
        window: notificationWindow,
      });
      throw new InternalServerErrorException(
        'Failed to query expiring points',
      );
    }
  }

  /**
   * Processes notifications for expiring points with batch processing
   * Respects user preferences and prevents duplicate notifications
   *
   * @param expiringPoints Array of expiring points to process
   * @param notificationType Type of notification (30-day, 7-day, 1-day)
   * @returns Summary statistics of notification processing
   */
  async processNotifications(
    expiringPoints: ExpiringPointsDto[],
    notificationType: NotificationType,
  ): Promise<{ sent: number; failed: number; skipped: number }> {
    const stats = { sent: 0, failed: 0, skipped: 0 };

    // Process in batches
    for (let i = 0; i < expiringPoints.length; i += this.BATCH_SIZE) {
      const batch = expiringPoints.slice(
        i,
        Math.min(i + this.BATCH_SIZE, expiringPoints.length),
      );

      await Promise.all(
        batch.map(async (expiringPoints) => {
          try {
            // Check user preferences
            const user = await this.prisma.user.findUnique({
              where: { id: expiringPoints.userId },
              select: { emailNotifications: true },
            });

            if (!user) {
              this.logger.warn('User not found for notification', {
                userId: expiringPoints.userId,
              });
              stats.skipped++;
              return;
            }

            if (!user.emailNotifications) {
              // Log as skipped
              await this.notificationRepository.createLog({
                userId: expiringPoints.userId,
                notificationType: notificationType as any,
                status: NotificationStatus.SKIPPED,
                expirationDate: expiringPoints.expirationDate,
                pointsExpiring: expiringPoints.pointsExpiring,
              });
              stats.skipped++;
              return;
            }

            // Send notification
            await this.sendExpirationNotificationUseCase.execute(
              expiringPoints.userId,
              expiringPoints,
              notificationType as any,
            );
            stats.sent++;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Error processing notification', {
              userId: expiringPoints.userId,
              error: errorMessage,
            });
            stats.failed++;
          }
        }),
      );
    }

    return stats;
  }
}
