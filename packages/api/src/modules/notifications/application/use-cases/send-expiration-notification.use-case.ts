import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoggerService } from '@rewards-bolivia/logger';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { EmailService } from '../services/email.service';
import { NotificationBuilderService } from '../services/notification-builder.service';
import type { INotificationRepository } from '../../domain/repositories/notification.repository';
import { ExpiringPointsDto } from '../../domain/dtos/expiring-points.dto';
import { NotificationSentEvent } from '../../domain/events/notification-sent.event';
import {
  NotificationStatus,
  NotificationType,
} from '../../domain/entities/notification-log.entity';

/**
 * SendExpirationNotificationUseCase orchestrates the complete workflow of sending
 * an expiration notification to a user. It handles:
 * - Validating user email
 * - Rendering email template
 * - Sending email via AWS SES
 * - Logging notification attempt
 * - Publishing domain event for analytics
 */
@Injectable()
export class SendExpirationNotificationUseCase {
  private readonly logger = new LoggerService(
    'SendExpirationNotificationUseCase',
  );

  constructor(
    private readonly emailService: EmailService,
    private readonly notificationBuilderService: NotificationBuilderService,
    @Inject('INotificationRepository')
    private readonly notificationRepository: INotificationRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Executes the notification sending workflow
   *
   * @param userId The user ID to send notification to
   * @param expiringPoints Data about the expiring points
   * @param notificationType Type of notification (30/7/1 day)
   * @throws BadRequestException if user email is invalid
   * @throws InternalServerErrorException if notification creation fails
   */
  async execute(
    userId: string,
    expiringPoints: ExpiringPointsDto,
    notificationType: string,
  ): Promise<void> {
    try {
      // 1. Fetch user and validate email
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.email) {
        this.logger.error('User not found or has no email', { userId });

        await this.notificationRepository.createLog({
          userId,
          notificationType: notificationType as NotificationType,
          status: NotificationStatus.FAILED,
          failureReason: 'missing email',
          expirationDate: expiringPoints.expirationDate,
          pointsExpiring: expiringPoints.pointsExpiring,
        });

        throw new BadRequestException('User email not found');
      }

      // 2. Get wallet URL from config
      const walletUrl =
        process.env.FRONTEND_WALLET_URL || 'http://localhost:5173/wallet';

      // 3. Render email template
      const templateName = this.getTemplateName(notificationType);
      const emailContent =
        await this.notificationBuilderService.renderEmailContent(
          templateName,
          {
            userName: user.name || user.email.split('@')[0],
            pointsExpiring: expiringPoints.pointsExpiring.toLocaleString(),
            expirationDate: this.formatDate(
              expiringPoints.expirationDate,
            ),
            currentBalance: user.pointsBalance.toLocaleString(),
            daysRemaining: expiringPoints.daysRemaining,
            walletUrl,
          },
        );

      // 4. Send email via AWS SES
      const subject = 'Your Rewards Bolivia Points Are Expiring Soon';

      await this.emailService.sendTransactionalEmail(
        user.email,
        subject,
        emailContent.html,
        emailContent.text,
      );

      // 5. Create notification log entry
      await this.notificationRepository.createLog({
        userId,
        notificationType: notificationType as NotificationType,
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        expirationDate: expiringPoints.expirationDate,
        pointsExpiring: expiringPoints.pointsExpiring,
      });

      // 6. Publish domain event
      const event: NotificationSentEvent = {
        userId,
        notificationType: notificationType as NotificationType,
        status: NotificationStatus.SENT,
        timestamp: new Date(),
        pointsExpiring: expiringPoints.pointsExpiring,
        expirationDate: expiringPoints.expirationDate,
      };

      this.eventEmitter.emit('notification.sent', event);

      this.logger.log('Notification sent successfully', {
        userId,
        notificationType,
        email: user.email,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const userId_local = userId;

      this.logger.error('Failed to send notification', {
        userId: userId_local,
        notificationType,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Try to log failure in notification log if we haven't already
      try {
        const existing =
          await this.notificationRepository.findExistingNotification(
            userId_local,
            notificationType as NotificationType,
            expiringPoints.expirationDate,
          );

        if (!existing) {
          await this.notificationRepository.createLog({
            userId: userId_local,
            notificationType: notificationType as NotificationType,
            status: NotificationStatus.FAILED,
            failureReason: errorMessage,
            expirationDate: expiringPoints.expirationDate,
            pointsExpiring: expiringPoints.pointsExpiring,
          });

          // Publish failure event
          const event: NotificationSentEvent = {
            userId: userId_local,
            notificationType: notificationType as NotificationType,
            status: NotificationStatus.FAILED,
            timestamp: new Date(),
            pointsExpiring: expiringPoints.pointsExpiring,
            expirationDate: expiringPoints.expirationDate,
          };
          this.eventEmitter.emit('notification.sent', event);
        }
      } catch (logError) {
        this.logger.error('Failed to log notification failure', {
          userId: userId_local,
          error:
            logError instanceof Error ? logError.message : String(logError),
        });
      }

      // Re-throw to allow caller to handle
      throw error;
    }
  }

  /**
   * Maps notification type to template name
   *
   * @param notificationType The notification type
   * @returns Template file name without extension
   */
  private getTemplateName(notificationType: string): string {
    const templateMap: Record<string, string> = {
      EXPIRATION_30_DAYS: 'expiration-30-days',
      EXPIRATION_7_DAYS: 'expiration-7-days',
      EXPIRATION_1_DAY: 'expiration-1-day',
    };

    return (
      templateMap[notificationType] || 'expiration-30-days'
    );
  }

  /**
   * Formats a date for display in email
   *
   * @param date The date to format
   * @returns Formatted date string (e.g., "December 25, 2025")
   */
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }
}
