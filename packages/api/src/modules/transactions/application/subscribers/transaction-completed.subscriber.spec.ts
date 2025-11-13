import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from 'eventemitter2';
import { TransactionCompletedSubscriber } from './transaction-completed.subscriber';
import { EconomicControlService } from '../services/economic-control.service';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import type { TransactionCompletedEvent } from '../../domain/events/transaction-completed.event';
import { TransactionType } from '@prisma/client';

describe('TransactionCompletedSubscriber', () => {
  let subscriber: TransactionCompletedSubscriber;
  let economicControlService: jest.Mocked<EconomicControlService>;
  let redisService: jest.Mocked<RedisService>;
  let prismaService: jest.Mocked<PrismaService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionCompletedSubscriber,
        {
          provide: EconomicControlService,
          useValue: {
            getEconomicStats: jest.fn(),
            getBurnFeeRate: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            economicAlert: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    subscriber = module.get<TransactionCompletedSubscriber>(
      TransactionCompletedSubscriber,
    );
    economicControlService = module.get(EconomicControlService);
    redisService = module.get(RedisService);
    prismaService = module.get(PrismaService);
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(subscriber).toBeDefined();
  });

  describe('handleTransactionCompleted', () => {
    const mockEvent: TransactionCompletedEvent = {
      transaction: {
        id: 'tx-123',
        type: TransactionType.REDEEM,
        pointsAmount: -100,
        burnAmount: 1,
        status: 'COMPLETED',
        businessId: 'biz-1',
        customerId: 'cust-1',
      } as any,
    };

    it('should trigger an alert for high active points after a redeem transaction', async () => {
      // Arrange
      const mockMetrics = {
        totalPointsIssued: 1000,
        totalPointsRedeemed: 500,
        totalPointsBurned: 10,
        activePointsPercentage: 0.5,
        redemptionRate: 0.5,
      };
      economicControlService.getEconomicStats.mockResolvedValue(
        JSON.parse(JSON.stringify(mockMetrics)),
      );
      redisService.get.mockResolvedValue(null); // Cache miss

      // Act
      await subscriber.handleTransactionCompleted(mockEvent);

      // Assert
      expect(redisService.set).toHaveBeenCalledWith(
        'economy:realtime:metrics',
        expect.any(String),
        300,
      );
      expect(prismaService.economicAlert.create).toHaveBeenCalled();
    });

    it('should trigger alert when active points exceed 80%', async () => {
      // Arrange
      const highActivePointsMetrics = {
        totalPointsIssued: 1000,
        totalPointsRedeemed: 100,
        totalPointsBurned: 50,
        activePointsPercentage: 0.85, // 85% - exceeds threshold
        redemptionRate: 0.3,
      };

      economicControlService.getEconomicStats.mockResolvedValue(
        JSON.parse(JSON.stringify(highActivePointsMetrics)),
      );
      redisService.get.mockResolvedValue(null); // Cache miss

      // Act
      await subscriber.handleTransactionCompleted(mockEvent);

      // Assert
      expect(prismaService.economicAlert.create).toHaveBeenCalledWith({
        data: {
          alertType: 'HIGH_ACTIVE_POINTS',
          severity: 'WARNING',
          message: expect.stringContaining('exceeds 80% threshold'),
          metricsSnapshot: expect.any(Object),
          acknowledged: false,
        },
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'economic.alert.triggered',
        expect.any(Object),
      );
    });

    it('should throttle alerts to prevent spam', async () => {
      // Arrange
      const highActivePointsMetrics = {
        totalPointsIssued: 1000,
        totalPointsRedeemed: 200,
        totalPointsBurned: 50,
        activePointsPercentage: 0.85,
        redemptionRate: 0.3, // Above threshold
      };

      economicControlService.getEconomicStats.mockResolvedValue(
        JSON.parse(JSON.stringify(highActivePointsMetrics)),
      );

      redisService.get.mockImplementation((key: string) => {
        if (key === 'economy:realtime:metrics') {
          return Promise.resolve(null);
        }
        if (key === 'economy:alert:throttle:HIGH_ACTIVE_POINTS') {
          return Promise.resolve(Date.now().toString());
        }
        return Promise.resolve(null);
      });

      // Act
      await subscriber.handleTransactionCompleted(mockEvent);

      // Assert
      expect(prismaService.economicAlert.create).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully without throwing', async () => {
      // Arrange
      economicControlService.getEconomicStats.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(
        subscriber.handleTransactionCompleted(mockEvent),
      ).resolves.not.toThrow();
    });

    it('should update metrics for EARN transaction type', async () => {
      // Arrange
      const earnEvent: TransactionCompletedEvent = {
        transaction: {
          id: 'tx-456',
          type: TransactionType.EARN,
          pointsAmount: 50,
          status: 'COMPLETED',
          businessId: 'biz-1',
          customerId: 'cust-1',
        } as any,
      };

      const mockMetrics = {
        totalPointsIssued: 1000,
        totalPointsRedeemed: 500,
        totalPointsBurned: 10,
        activePointsPercentage: 0.5,
        redemptionRate: 0.5,
      };

      economicControlService.getEconomicStats.mockResolvedValue(
        JSON.parse(JSON.stringify(mockMetrics)),
      );
      redisService.get.mockResolvedValue(null); // Cache miss

      // Act
      await subscriber.handleTransactionCompleted(earnEvent);

      // Assert
      const updatedMetrics = JSON.parse(redisService.set.mock.calls[0][1]);
      expect(updatedMetrics.totalPointsIssued).toBe(1050);
    });
  });
});
