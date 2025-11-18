import {
  NotificationLog,
  NotificationType,
  NotificationStatus,
} from '../entities/notification-log.entity';
import { INotificationRepository } from '../repositories/notification.repository';
import { NotificationSentEvent } from '../events/notification-sent.event';
import { CreateNotificationLogDto } from '../dtos/create-notification-log.dto';
import { ExpiringPointsDto } from '../dtos/expiring-points.dto';
import { EmailNotificationDto } from '../dtos/email-notification.dto';

describe('Domain Layer - Notifications Module', () => {
  describe('NotificationLog Entity', () => {
    it('should create a NotificationLog entity with all required fields', () => {
      const data = {
        id: 'test-id-1',
        userId: 'user-123',
        notificationType: NotificationType.EXPIRATION_30_DAYS,
        status: NotificationStatus.SENT,
        sentAt: new Date('2025-12-01T09:00:00Z'),
        failureReason: null,
        expirationDate: new Date('2025-12-31T23:59:59Z'),
        pointsExpiring: 500,
        createdAt: new Date('2025-11-18T09:00:00Z'),
      };

      const notificationLog = new NotificationLog(data);

      expect(notificationLog.id).toBe('test-id-1');
      expect(notificationLog.userId).toBe('user-123');
      expect(notificationLog.notificationType).toBe(NotificationType.EXPIRATION_30_DAYS);
      expect(notificationLog.status).toBe(NotificationStatus.SENT);
      expect(notificationLog.sentAt).toEqual(new Date('2025-12-01T09:00:00Z'));
      expect(notificationLog.failureReason).toBeNull();
      expect(notificationLog.expirationDate).toEqual(new Date('2025-12-31T23:59:59Z'));
      expect(notificationLog.pointsExpiring).toBe(500);
    });

    it('should instantiate NotificationLog with failed status and failure reason', () => {
      const data = {
        id: 'test-id-2',
        userId: 'user-456',
        notificationType: NotificationType.EXPIRATION_7_DAYS,
        status: NotificationStatus.FAILED,
        sentAt: null,
        failureReason: 'Invalid email format',
        expirationDate: new Date('2025-12-25T23:59:59Z'),
        pointsExpiring: 300,
        createdAt: new Date('2025-11-18T10:00:00Z'),
      };

      const notificationLog = new NotificationLog(data);

      expect(notificationLog.status).toBe(NotificationStatus.FAILED);
      expect(notificationLog.failureReason).toBe('Invalid email format');
      expect(notificationLog.sentAt).toBeNull();
    });

    it('should support all three notification types', () => {
      const types = [
        NotificationType.EXPIRATION_30_DAYS,
        NotificationType.EXPIRATION_7_DAYS,
        NotificationType.EXPIRATION_1_DAY,
      ];

      types.forEach((type) => {
        const log = new NotificationLog({
          id: `test-${type}`,
          userId: 'user-123',
          notificationType: type,
          status: NotificationStatus.SENT,
          sentAt: new Date(),
          failureReason: null,
          expirationDate: new Date(),
          pointsExpiring: 100,
          createdAt: new Date(),
        });

        expect(log.notificationType).toBe(type);
      });
    });
  });

  describe('INotificationRepository Interface', () => {
    it('should define all required repository methods', () => {
      const repositoryMethods: (keyof INotificationRepository)[] = [
        'createLog',
        'findExistingNotification',
        'findByUser',
        'findByDateRange',
      ];

      repositoryMethods.forEach((method) => {
        expect(typeof method).toBe('string');
      });
    });
  });

  describe('NotificationSentEvent', () => {
    it('should structure event with all required fields for analytics', () => {
      const event: NotificationSentEvent = {
        userId: 'user-789',
        notificationType: NotificationType.EXPIRATION_1_DAY,
        status: NotificationStatus.SENT,
        timestamp: new Date('2025-11-18T09:30:00Z'),
        pointsExpiring: 150,
        expirationDate: new Date('2025-11-19T23:59:59Z'),
      };

      expect(event.userId).toBe('user-789');
      expect(event.notificationType).toBe(NotificationType.EXPIRATION_1_DAY);
      expect(event.status).toBe(NotificationStatus.SENT);
      expect(event.timestamp).toEqual(new Date('2025-11-18T09:30:00Z'));
      expect(event.pointsExpiring).toBe(150);
      expect(event.expirationDate).toEqual(new Date('2025-11-19T23:59:59Z'));
    });
  });

  describe('Domain DTOs', () => {
    it('should instantiate CreateNotificationLogDto with valid data', () => {
      const dto: CreateNotificationLogDto = {
        userId: 'user-123',
        notificationType: NotificationType.EXPIRATION_30_DAYS,
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        failureReason: null,
        expirationDate: new Date('2025-12-31'),
        pointsExpiring: 500,
      };

      expect(dto.userId).toBe('user-123');
      expect(dto.pointsExpiring).toBe(500);
    });

    it('should instantiate ExpiringPointsDto correctly', () => {
      const dto: ExpiringPointsDto = {
        userId: 'user-456',
        pointsExpiring: 300,
        expirationDate: new Date('2025-12-25'),
        daysRemaining: 30,
      };

      expect(dto.userId).toBe('user-456');
      expect(dto.pointsExpiring).toBe(300);
      expect(dto.daysRemaining).toBe(30);
    });

    it('should instantiate EmailNotificationDto correctly', () => {
      const dto: EmailNotificationDto = {
        to: 'user@example.com',
        subject: 'Your Rewards Bolivia Points Are Expiring Soon',
        htmlBody: '<html><body>Your points are expiring</body></html>',
        textBody: 'Your points are expiring',
      };

      expect(dto.to).toBe('user@example.com');
      expect(dto.subject).toBe('Your Rewards Bolivia Points Are Expiring Soon');
      expect(dto.htmlBody).toContain('html');
    });
  });
});
