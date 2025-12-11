import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CheckExpiringPointsJob } from './check-expiring-points.job';
import { ExpirationNotificationService } from '../services/expiration-notification.service';
import {
  NotificationType,
} from '../../domain/entities/notification-log.entity';

describe('CheckExpiringPointsJob', () => {
  let job: CheckExpiringPointsJob;
  let expirationNotificationService: jest.Mocked<ExpirationNotificationService>;
  let loggerSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Mock the services
    const mockExpirationNotificationService = {
      findExpiringPoints: jest.fn(),
      processNotifications: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(() => '0 9 * * *'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckExpiringPointsJob,
        {
          provide: ExpirationNotificationService,
          useValue: mockExpirationNotificationService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    job = module.get<CheckExpiringPointsJob>(CheckExpiringPointsJob);
    expirationNotificationService = module.get(
      ExpirationNotificationService,
    ) as jest.Mocked<ExpirationNotificationService>;

    // Spy on the Logger methods of the job instance
    loggerSpy = jest.spyOn(job['logger'], 'log');
    errorSpy = jest.spyOn(job['logger'], 'error');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('handleCron', () => {
    it('should process all 3 notification windows', async () => {
      // Arrange
      const mockExpiringPoints = [
        {
          userId: 'user1',
          pointsExpiring: 100,
          expirationDate: new Date(),
          daysRemaining: 30,
        },
      ];

      expirationNotificationService.findExpiringPoints.mockResolvedValue(
        mockExpiringPoints,
      );
      expirationNotificationService.processNotifications.mockResolvedValue({
        sent: 1,
        failed: 0,
        skipped: 0,
      });

      // Act
      await job.handleCron();

      // Assert
      expect(expirationNotificationService.findExpiringPoints).toHaveBeenCalledTimes(3);
      expect(expirationNotificationService.processNotifications).toHaveBeenCalledTimes(3);

      // Verify the three windows are processed with correct notification types
      const calls = expirationNotificationService.processNotifications.mock.calls;
      expect(calls[0][1]).toBe(NotificationType.EXPIRATION_30_DAYS);
      expect(calls[1][1]).toBe(NotificationType.EXPIRATION_7_DAYS);
      expect(calls[2][1]).toBe(NotificationType.EXPIRATION_1_DAY);
    });

    it('should log job start and completion with timestamp', async () => {
      // Arrange
      expirationNotificationService.findExpiringPoints.mockResolvedValue([]);
      expirationNotificationService.processNotifications.mockResolvedValue({
        sent: 0,
        failed: 0,
        skipped: 0,
      });

      // Act
      await job.handleCron();

      // Assert
      const logCalls = loggerSpy.mock.calls.map(call => call[0]);
      expect(logCalls.some(msg => msg.includes('Starting expiring points check job'))).toBe(true);
      expect(logCalls.some(msg => msg.includes('Expiring points check job completed'))).toBe(true);
    });

    it('should log summary statistics for each notification window', async () => {
      // Arrange
      expirationNotificationService.findExpiringPoints.mockResolvedValue([
        {
          userId: 'user1',
          pointsExpiring: 100,
          expirationDate: new Date(),
          daysRemaining: 30,
        },
      ]);

      expirationNotificationService.processNotifications.mockResolvedValue({
        sent: 1,
        failed: 0,
        skipped: 0,
      });

      // Act
      await job.handleCron();

      // Assert
      const logCalls = loggerSpy.mock.calls.map(call => call[0]);
      // Should have logs mentioning the windows and statistics
      expect(logCalls.some(msg => msg.includes('30-day') && msg.includes('window'))).toBe(true);
      expect(logCalls.some(msg => msg.includes('sent'))).toBe(true);
    });

    it('should handle window-level errors gracefully and continue processing', async () => {
      // Arrange
      const testError = new Error('Service failure');
      // First call fails, other two succeed
      expirationNotificationService.findExpiringPoints
        .mockRejectedValueOnce(testError)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      expirationNotificationService.processNotifications.mockResolvedValue({
        sent: 0,
        failed: 0,
        skipped: 0,
      });

      // Act
      await job.handleCron();

      // Assert
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error processing'),
      );
      // Job should still try to process other windows
      expect(expirationNotificationService.findExpiringPoints).toHaveBeenCalledTimes(3);
    });
  });
});
