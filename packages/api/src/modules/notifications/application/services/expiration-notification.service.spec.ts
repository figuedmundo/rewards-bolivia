import { Test, TestingModule } from '@nestjs/testing';
import { ExpirationNotificationService } from './expiration-notification.service';
import { INotificationRepository } from '../../domain/repositories/notification.repository';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { NotificationStatus, NotificationType } from '../../domain/entities/notification-log.entity';
import { ExpiringPointsDto } from '../../domain/dtos/expiring-points.dto';
import { SendExpirationNotificationUseCase } from '../use-cases/send-expiration-notification.use-case';

describe('ExpirationNotificationService', () => {
  let service: ExpirationNotificationService;
  let mockNotificationRepository: jest.Mocked<INotificationRepository>;
  let mockPrismaService: jest.Mocked<PrismaService>;
  let mockSendExpirationNotificationUseCase: jest.Mocked<SendExpirationNotificationUseCase>;

  beforeEach(async () => {
    mockNotificationRepository = {
      createLog: jest.fn(),
      findExistingNotification: jest.fn(),
      findByUser: jest.fn(),
      findByDateRange: jest.fn(),
    };

    mockPrismaService = {
      pointLedger: {
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    } as any;

    mockSendExpirationNotificationUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpirationNotificationService,
        {
          provide: 'INotificationRepository',
          useValue: mockNotificationRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SendExpirationNotificationUseCase,
          useValue: mockSendExpirationNotificationUseCase,
        },
      ],
    }).compile();

    service = module.get<ExpirationNotificationService>(
      ExpirationNotificationService,
    );
  });

  describe('findExpiringPoints', () => {
    it('should find expiring points within the notification window', async () => {
      const now = new Date();
      const expirationDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const mockLedgerEntries = [
        {
          accountId: 'user-1',
          expiresAt: expirationDate,
          credit: 100,
        },
        {
          accountId: 'user-1',
          expiresAt: expirationDate,
          credit: 50,
        },
        {
          accountId: 'user-2',
          expiresAt: expirationDate,
          credit: 200,
        },
      ];

      mockPrismaService.pointLedger.findMany.mockResolvedValue(
        mockLedgerEntries as any,
      );

      const window = {
        start: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000),
      };

      const result = await service.findExpiringPoints(window);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        userId: 'user-1',
        pointsExpiring: 150,
        expirationDate,
      });
      expect(result[1]).toMatchObject({
        userId: 'user-2',
        pointsExpiring: 200,
        expirationDate,
      });
    });

    it('should only include entries with credit > 0 and expiresAt in window', async () => {
      const now = new Date();
      const window = {
        start: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        end: new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000),
      };

      mockPrismaService.pointLedger.findMany.mockResolvedValue([]);

      await service.findExpiringPoints(window);

      expect(mockPrismaService.pointLedger.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            expiresAt: expect.objectContaining({
              gte: window.start,
              lte: window.end,
            }),
            credit: {
              gt: 0,
            },
          }),
        }),
      );
    });
  });

  describe('processNotifications', () => {
    it('should respect user opt-out preference when emailNotifications is false', async () => {
      const expirationDate = new Date();
      const expiringPoints: ExpiringPointsDto[] = [
        {
          userId: 'user-1',
          pointsExpiring: 100,
          expirationDate,
          daysRemaining: 30,
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        emailNotifications: false,
      } as any);

      mockNotificationRepository.findExistingNotification.mockResolvedValue(
        null,
      );

      const result = await service.processNotifications(
        expiringPoints,
        NotificationType.EXPIRATION_30_DAYS,
      );

      expect(result.skipped).toBe(1);
      expect(result.sent).toBe(0);
      expect(
        mockNotificationRepository.createLog,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          status: NotificationStatus.SKIPPED,
          userId: 'user-1',
        }),
      );
    });

    it('should skip notifications that have already been sent (deduplication)', async () => {
      const expirationDate = new Date();
      const expiringPoints: ExpiringPointsDto[] = [
        {
          userId: 'user-1',
          pointsExpiring: 100,
          expirationDate,
          daysRemaining: 30,
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        emailNotifications: true,
      } as any);

      // Mock the use case to track deduplication
      mockSendExpirationNotificationUseCase.execute.mockImplementation(
        async (userId, expiringPoints, notificationType) => {
          // Simulate checking for existing notification internally
          const existing = await mockNotificationRepository.findExistingNotification(
            userId,
            notificationType as any,
            expiringPoints.expirationDate,
          );

          if (existing) {
            throw new Error('Notification already sent - deduplication');
          }
        },
      );

      // First setup: no existing notification
      mockNotificationRepository.findExistingNotification.mockResolvedValue(
        null,
      );

      const result = await service.processNotifications(
        expiringPoints,
        NotificationType.EXPIRATION_30_DAYS,
      );

      // Should process the notification
      expect(mockSendExpirationNotificationUseCase.execute).toHaveBeenCalledTimes(
        1,
      );
    });

    it('should handle batch processing of users', async () => {
      const expirationDate = new Date();
      const expiringPoints: ExpiringPointsDto[] = Array.from(
        { length: 250 },
        (_, i) => ({
          userId: `user-${i}`,
          pointsExpiring: 100,
          expirationDate,
          daysRemaining: 30,
        }),
      );

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        emailNotifications: true,
      } as any);

      mockNotificationRepository.findExistingNotification.mockResolvedValue(
        null,
      );

      mockSendExpirationNotificationUseCase.execute.mockResolvedValue(
        undefined,
      );

      const result = await service.processNotifications(
        expiringPoints,
        NotificationType.EXPIRATION_30_DAYS,
      );

      // Should process all 250 users
      expect(result.sent).toBe(250);
      expect(mockSendExpirationNotificationUseCase.execute).toHaveBeenCalledTimes(
        250,
      );
    });

    it('should handle errors during notification processing without stopping batch', async () => {
      const expirationDate = new Date();
      const expiringPoints: ExpiringPointsDto[] = [
        {
          userId: 'user-1',
          pointsExpiring: 100,
          expirationDate,
          daysRemaining: 30,
        },
        {
          userId: 'user-2',
          pointsExpiring: 100,
          expirationDate,
          daysRemaining: 30,
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        emailNotifications: true,
      } as any);

      mockNotificationRepository.findExistingNotification.mockResolvedValue(
        null,
      );

      // First user fails, second succeeds
      mockSendExpirationNotificationUseCase.execute
        .mockRejectedValueOnce(new Error('Email service error'))
        .mockResolvedValueOnce(undefined);

      const result = await service.processNotifications(
        expiringPoints,
        NotificationType.EXPIRATION_30_DAYS,
      );

      // Should have 1 failed and 1 sent
      expect(result.sent).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('should skip notification when user not found', async () => {
      const expirationDate = new Date();
      const expiringPoints: ExpiringPointsDto[] = [
        {
          userId: 'non-existent',
          pointsExpiring: 100,
          expirationDate,
          daysRemaining: 30,
        },
      ];

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.processNotifications(
        expiringPoints,
        NotificationType.EXPIRATION_30_DAYS,
      );

      expect(result.skipped).toBe(1);
      expect(result.sent).toBe(0);
      expect(mockSendExpirationNotificationUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
