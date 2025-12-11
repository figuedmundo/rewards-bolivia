import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { INotificationRepository, QueryOptions } from '../../domain/repositories/notification.repository';
import { NotificationLog } from '../../domain/entities/notification-log.entity';
import { CreateNotificationLogDto } from '../../domain/dtos/create-notification-log.dto';
import { LoggerService } from '@rewards-bolivia/logger';

/**
 * Prisma implementation of INotificationRepository
 * Handles all database operations for notification logs using Prisma ORM
 */
@Injectable()
export class PrismaNotificationRepository implements INotificationRepository {
  private readonly logger = new LoggerService('PrismaNotificationRepository');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new notification log entry in the database
   * @param data The notification log data to create
   * @returns The created NotificationLog entity
   * @throws InternalServerErrorException if database operation fails
   */
  async createLog(data: CreateNotificationLogDto): Promise<NotificationLog> {
    try {
      const created = await this.prisma.notificationLog.create({
        data: {
          userId: data.userId,
          notificationType: data.notificationType,
          status: data.status,
          sentAt: data.sentAt || null,
          failureReason: data.failureReason || null,
          expirationDate: data.expirationDate,
          pointsExpiring: data.pointsExpiring,
        },
      });

      return this.mapToEntity(created);
    } catch (error) {
      this.logger.error('Failed to create notification log', {
        userId: data.userId,
        notificationType: data.notificationType,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new InternalServerErrorException('Failed to create notification log');
    }
  }

  /**
   * Finds an existing notification for deduplication purposes
   * Uses composite index on (userId, notificationType, expirationDate) for efficiency
   * @param userId The user ID
   * @param notificationType The notification type
   * @param expirationDate The expiration date
   * @returns The existing NotificationLog or null if not found
   * @throws InternalServerErrorException if database operation fails
   */
  async findExistingNotification(
    userId: string,
    notificationType: string,
    expirationDate: Date,
  ): Promise<NotificationLog | null> {
    try {
      const existing = await this.prisma.notificationLog.findFirst({
        where: {
          userId,
          notificationType,
          expirationDate,
        },
      });

      return existing ? this.mapToEntity(existing) : null;
    } catch (error) {
      this.logger.error('Failed to find existing notification', {
        userId,
        notificationType,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new InternalServerErrorException('Failed to query notification log');
    }
  }

  /**
   * Finds all notifications for a specific user with pagination support
   * @param userId The user ID
   * @param options Query options for pagination (limit, offset)
   * @returns Array of NotificationLog entries for the user
   * @throws InternalServerErrorException if database operation fails
   */
  async findByUser(
    userId: string,
    options: QueryOptions = {},
  ): Promise<NotificationLog[]> {
    try {
      const { limit = 50, offset = 0 } = options;

      const notifications = await this.prisma.notificationLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return notifications.map((n) => this.mapToEntity(n));
    } catch (error) {
      this.logger.error('Failed to find notifications for user', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new InternalServerErrorException('Failed to query notifications for user');
    }
  }

  /**
   * Finds all notifications within a date range for admin queries
   * @param startDate The start of the range
   * @param endDate The end of the range
   * @returns Array of NotificationLog entries in the range
   * @throws InternalServerErrorException if database operation fails
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<NotificationLog[]> {
    try {
      const notifications = await this.prisma.notificationLog.findMany({
        where: {
          expirationDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return notifications.map((n) => this.mapToEntity(n));
    } catch (error) {
      this.logger.error('Failed to find notifications by date range', {
        startDate,
        endDate,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new InternalServerErrorException('Failed to query notifications by date range');
    }
  }

  /**
   * Maps Prisma NotificationLog record to domain entity
   * @param record The Prisma record
   * @returns NotificationLog domain entity
   */
  private mapToEntity(record: any): NotificationLog {
    return new NotificationLog({
      id: record.id,
      userId: record.userId,
      notificationType: record.notificationType,
      status: record.status,
      sentAt: record.sentAt,
      failureReason: record.failureReason,
      expirationDate: record.expirationDate,
      pointsExpiring: record.pointsExpiring,
      createdAt: record.createdAt,
    });
  }
}
