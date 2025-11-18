import { NotificationLog } from '../entities/notification-log.entity';
import { CreateNotificationLogDto } from '../dtos/create-notification-log.dto';

export interface QueryOptions {
  limit?: number;
  offset?: number;
}

export interface INotificationRepository {
  /**
   * Creates a new notification log entry
   * @param data The notification log data to create
   * @returns The created NotificationLog entity
   */
  createLog(data: CreateNotificationLogDto): Promise<NotificationLog>;

  /**
   * Finds an existing notification for deduplication
   * @param userId The user ID
   * @param notificationType The notification type
   * @param expirationDate The expiration date
   * @returns The existing NotificationLog or null if not found
   */
  findExistingNotification(
    userId: string,
    notificationType: string,
    expirationDate: Date,
  ): Promise<NotificationLog | null>;

  /**
   * Finds all notifications for a specific user
   * @param userId The user ID
   * @param options Query options for pagination
   * @returns Array of NotificationLog entries for the user
   */
  findByUser(
    userId: string,
    options?: QueryOptions,
  ): Promise<NotificationLog[]>;

  /**
   * Finds all notifications within a date range
   * @param startDate The start of the range
   * @param endDate The end of the range
   * @returns Array of NotificationLog entries in the range
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<NotificationLog[]>;
}
