import { Test, TestingModule } from '@nestjs/testing';
import { SendExpirationNotificationUseCase } from './send-expiration-notification.use-case';
import { EmailService } from '../services/email.service';
import { NotificationBuilderService } from '../services/notification-builder.service';
import { INotificationRepository } from '../../domain/repositories/notification.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExpiringPointsDto } from '../../domain/dtos/expiring-points.dto';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('SendExpirationNotificationUseCase', () => {
  let useCase: SendExpirationNotificationUseCase;
  let emailService: jest.Mocked<EmailService>;
  let notificationBuilderService: jest.Mocked<NotificationBuilderService>;
  let notificationRepository: jest.Mocked<INotificationRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockEmailService = {
      sendTransactionalEmail: jest.fn(),
    };

    const mockNotificationBuilderService = {
      renderEmailContent: jest.fn(),
    };

    const mockNotificationRepository = {
      createLog: jest.fn(),
      findExistingNotification: jest.fn(),
      findByUser: jest.fn(),
      findByDateRange: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendExpirationNotificationUseCase,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: NotificationBuilderService,
          useValue: mockNotificationBuilderService,
        },
        {
          provide: 'INotificationRepository',
          useValue: mockNotificationRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<SendExpirationNotificationUseCase>(
      SendExpirationNotificationUseCase,
    );
    emailService = module.get<EmailService>(EmailService) as any;
    notificationBuilderService = module.get<NotificationBuilderService>(
      NotificationBuilderService,
    ) as any;
    notificationRepository = module.get<INotificationRepository>(
      'INotificationRepository',
    ) as any;
    eventEmitter = module.get<EventEmitter2>(EventEmitter2) as any;
    prismaService = module.get<PrismaService>(PrismaService) as any;
  });

  describe('execute', () => {
    const testUserId = 'user-123';
    const testEmail = 'user@example.com';
    const expiringPoints: ExpiringPointsDto = {
      userId: testUserId,
      pointsExpiring: 100,
      expirationDate: new Date('2025-12-25'),
      daysRemaining: 30,
    };

    it('should send notification and create log entry successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: testUserId,
        email: testEmail,
        pointsBalance: 1000,
        name: 'Test User',
      } as any);

      notificationBuilderService.renderEmailContent.mockResolvedValue({
        html: '<html>test</html>',
        text: 'test',
      });

      emailService.sendTransactionalEmail.mockResolvedValue(undefined);
      notificationRepository.createLog.mockResolvedValue({} as any);

      await useCase.execute(testUserId, expiringPoints, 'EXPIRATION_30_DAYS');

      expect(emailService.sendTransactionalEmail).toHaveBeenCalled();
      expect(notificationRepository.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          notificationType: 'EXPIRATION_30_DAYS',
          status: 'SENT',
        }),
      );
    });

    it('should handle email sending errors gracefully', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: testUserId,
        email: testEmail,
        pointsBalance: 1000,
        name: 'Test User',
      } as any);

      notificationBuilderService.renderEmailContent.mockResolvedValue({
        html: '<html>test</html>',
        text: 'test',
      });

      const emailError = new BadRequestException('Invalid email');
      emailService.sendTransactionalEmail.mockRejectedValue(emailError);

      notificationRepository.createLog.mockResolvedValue({} as any);
      notificationRepository.findExistingNotification.mockResolvedValue(null);

      try {
        await useCase.execute(testUserId, expiringPoints, 'EXPIRATION_30_DAYS');
      } catch (error) {
        // Expected to throw
      }

      expect(notificationRepository.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'FAILED',
          failureReason: expect.any(String),
        }),
      );
    });

    it('should publish notification sent event', async () => {
      prismaService.user.findUnique.mockResolvedValue({
        id: testUserId,
        email: testEmail,
        pointsBalance: 1000,
        name: 'Test User',
      } as any);

      notificationBuilderService.renderEmailContent.mockResolvedValue({
        html: '<html>test</html>',
        text: 'test',
      });

      emailService.sendTransactionalEmail.mockResolvedValue(undefined);
      notificationRepository.createLog.mockResolvedValue({} as any);

      await useCase.execute(testUserId, expiringPoints, 'EXPIRATION_30_DAYS');

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'notification.sent',
        expect.objectContaining({
          userId: testUserId,
          notificationType: 'EXPIRATION_30_DAYS',
          status: 'SENT',
        }),
      );
    });
  });
});
