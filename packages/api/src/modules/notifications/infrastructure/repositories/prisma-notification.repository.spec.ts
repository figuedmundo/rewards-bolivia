import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { PrismaNotificationRepository } from './prisma-notification.repository';
import {
  NotificationType,
  NotificationStatus,
} from '../../domain/entities/notification-log.entity';
import { CreateNotificationLogDto } from '../../domain/dtos/create-notification-log.dto';

describe('PrismaNotificationRepository', () => {
  let repository: PrismaNotificationRepository;
  let prismaService: PrismaService;

  const mockUserId = 'test-user-id';
  const mockExpirationDate = new Date('2025-12-31');

  // Mock NotificationLog object
  const mockNotificationLog = {
    id: 'notification-id-1',
    userId: mockUserId,
    notificationType: NotificationType.EXPIRATION_30_DAYS,
    status: NotificationStatus.SENT,
    sentAt: new Date(),
    failureReason: null,
    expirationDate: mockExpirationDate,
    pointsExpiring: 500,
    createdAt: new Date(),
  };

  const createLogDto: CreateNotificationLogDto = {
    userId: mockUserId,
    notificationType: NotificationType.EXPIRATION_30_DAYS,
    status: NotificationStatus.SENT,
    sentAt: new Date(),
    failureReason: null,
    expirationDate: mockExpirationDate,
    pointsExpiring: 500,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaNotificationRepository,
        {
          provide: PrismaService,
          useValue: {
            notificationLog: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<PrismaNotificationRepository>(
      PrismaNotificationRepository,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createLog', () => {
    it('should create a notification log entry successfully', async () => {
      // Arrange
      (prismaService.notificationLog.create as jest.Mock).mockResolvedValue(
        mockNotificationLog,
      );

      // Act
      const result = await repository.createLog(createLogDto);

      // Assert
      expect(prismaService.notificationLog.create).toHaveBeenCalledWith({
        data: {
          userId: createLogDto.userId,
          notificationType: createLogDto.notificationType,
          status: createLogDto.status,
          sentAt: createLogDto.sentAt,
          failureReason: createLogDto.failureReason,
          expirationDate: createLogDto.expirationDate,
          pointsExpiring: createLogDto.pointsExpiring,
        },
      });
      expect(result).toEqual(mockNotificationLog);
    });
  });

  describe('findExistingNotification', () => {
    it('should find existing notification by userId, notificationType, and expirationDate', async () => {
      // Arrange
      (prismaService.notificationLog.findFirst as jest.Mock).mockResolvedValue(
        mockNotificationLog,
      );

      // Act
      const result = await repository.findExistingNotification(
        mockUserId,
        NotificationType.EXPIRATION_30_DAYS,
        mockExpirationDate,
      );

      // Assert
      expect(prismaService.notificationLog.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          notificationType: NotificationType.EXPIRATION_30_DAYS,
          expirationDate: mockExpirationDate,
        },
      });
      expect(result).toEqual(mockNotificationLog);
    });

    it('should return null when notification does not exist', async () => {
      // Arrange
      (prismaService.notificationLog.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      // Act
      const result = await repository.findExistingNotification(
        mockUserId,
        NotificationType.EXPIRATION_30_DAYS,
        mockExpirationDate,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should prevent duplicate notifications using deduplication logic', async () => {
      // Arrange: First call returns existing notification
      (prismaService.notificationLog.findFirst as jest.Mock).mockResolvedValue(
        mockNotificationLog,
      );

      // Act
      const result = await repository.findExistingNotification(
        mockUserId,
        NotificationType.EXPIRATION_30_DAYS,
        mockExpirationDate,
      );

      // Assert: Should find the existing notification (deduplication works)
      expect(result).not.toBeNull();
      expect(result?.userId).toBe(mockUserId);
      expect(result?.notificationType).toBe(NotificationType.EXPIRATION_30_DAYS);
      expect(result?.expirationDate).toEqual(mockExpirationDate);
    });
  });

  describe('findByUser', () => {
    it('should find notifications for a specific user with pagination', async () => {
      // Arrange
      const mockNotifications = [mockNotificationLog];
      (prismaService.notificationLog.findMany as jest.Mock).mockResolvedValue(
        mockNotifications,
      );

      // Act
      const result = await repository.findByUser(mockUserId, {
        limit: 10,
        offset: 0,
      });

      // Assert
      expect(prismaService.notificationLog.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('findByDateRange', () => {
    it('should find notifications within a date range', async () => {
      // Arrange
      const startDate = new Date('2025-12-01');
      const endDate = new Date('2025-12-31');
      const mockNotifications = [mockNotificationLog];

      (prismaService.notificationLog.findMany as jest.Mock).mockResolvedValue(
        mockNotifications,
      );

      // Act
      const result = await repository.findByDateRange(startDate, endDate);

      // Assert
      expect(prismaService.notificationLog.findMany).toHaveBeenCalledWith({
        where: {
          expirationDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockNotifications);
    });
  });
});
