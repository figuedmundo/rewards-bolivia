import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from 'eventemitter2';
import { EmissionRateAdjusterService } from './emission-rate-adjuster.service';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import type { ILedgerRepository } from '../../domain/repositories/ledger.repository';
import { Decimal } from '@prisma/client/runtime/library';

describe('EmissionRateAdjusterService', () => {
  let service: EmissionRateAdjusterService;
  let prismaService: jest.Mocked<PrismaService>;
  let ledgerRepository: jest.Mocked<ILedgerRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmissionRateAdjusterService,
        {
          provide: PrismaService,
          useValue: {
            emissionRateRecommendation: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            emissionRateConfig: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: 'ILedgerRepository',
          useValue: {
            getPointsIssuedInLast30Days: jest.fn(),
            getPointsRedeemedInLast30Days: jest.fn(),
            getTransactionCountInLast30Days: jest.fn(),
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

    service = module.get<EmissionRateAdjusterService>(
      EmissionRateAdjusterService,
    );
    prismaService = module.get(PrismaService);
    ledgerRepository = module.get('ILedgerRepository');
    eventEmitter = module.get(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateTrailing30DayMetrics', () => {
    it('should calculate correct metrics with normal data', async () => {
      ledgerRepository.getPointsIssuedInLast30Days.mockResolvedValue(1000);
      ledgerRepository.getPointsRedeemedInLast30Days.mockResolvedValue(250);
      ledgerRepository.getTransactionCountInLast30Days.mockResolvedValue(150);

      const metrics = await service.calculateTrailing30DayMetrics();

      expect(metrics).toEqual({
        pointsIssued: 1000,
        pointsRedeemed: 250,
        redemptionRate: 0.25,
        transactionCount: 150,
      });
    });

    it('should return 0 redemption rate when no points issued', async () => {
      ledgerRepository.getPointsIssuedInLast30Days.mockResolvedValue(0);
      ledgerRepository.getPointsRedeemedInLast30Days.mockResolvedValue(0);
      ledgerRepository.getTransactionCountInLast30Days.mockResolvedValue(0);

      const metrics = await service.calculateTrailing30DayMetrics();

      expect(metrics.redemptionRate).toBe(0);
    });
  });

  describe('generateRecommendationIfNeeded', () => {
    beforeEach(() => {
      // Default mocks for success case
      ledgerRepository.getPointsIssuedInLast30Days.mockResolvedValue(1000);
      ledgerRepository.getPointsRedeemedInLast30Days.mockResolvedValue(200); // 20% redemption rate
      ledgerRepository.getTransactionCountInLast30Days.mockResolvedValue(150);
      prismaService.emissionRateRecommendation.findFirst.mockResolvedValue(
        null,
      );
      prismaService.emissionRateConfig.findUnique.mockResolvedValue({
        id: 'config-1',
        rateType: 'BASE',
        emissionRate: new Decimal(1.0),
        lastAdjustedAt: null,
        lastAdjustedBy: null,
        updatedAt: new Date(),
      });
    });

    it('should generate recommendation when redemption rate < 25%', async () => {
      const mockRecommendation = {
        id: 'rec-123',
        currentEmissionRate: new Decimal(1.0),
        recommendedEmissionRate: new Decimal(0.95),
        adjustmentPercentage: new Decimal(-5),
        reason: 'Low redemption rate',
        redemptionRate30d: new Decimal(0.2),
        metricsSnapshot: {},
        status: 'PENDING',
        approvedBy: null,
        approvedAt: null,
        appliedAt: null,
        createdAt: new Date(),
        expiresAt: new Date(),
      };

      prismaService.emissionRateRecommendation.create.mockResolvedValue(
        mockRecommendation,
      );

      const result = await service.generateRecommendationIfNeeded();

      expect(result).toBeDefined();
      expect(
        prismaService.emissionRateRecommendation.create,
      ).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'emission.recommendation.created',
        expect.any(Object),
      );
    });

    it('should not generate recommendation when redemption rate >= 25%', async () => {
      ledgerRepository.getPointsRedeemedInLast30Days.mockResolvedValue(300); // 30% redemption rate

      const result = await service.generateRecommendationIfNeeded();

      expect(result).toBeNull();
      expect(
        prismaService.emissionRateRecommendation.create,
      ).not.toHaveBeenCalled();
    });

    it('should not generate when insufficient transaction data', async () => {
      ledgerRepository.getTransactionCountInLast30Days.mockResolvedValue(50); // Less than 100

      const result = await service.generateRecommendationIfNeeded();

      expect(result).toBeNull();
      expect(
        prismaService.emissionRateRecommendation.create,
      ).not.toHaveBeenCalled();
    });

    it('should respect cooldown period', async () => {
      const recentRec = {
        id: 'rec-old',
        createdAt: new Date(),
        status: 'PENDING',
      };

      prismaService.emissionRateRecommendation.findFirst.mockResolvedValue(
        recentRec as any,
      );

      const result = await service.generateRecommendationIfNeeded();

      expect(result).toBeNull();
      expect(
        prismaService.emissionRateRecommendation.create,
      ).not.toHaveBeenCalled();
    });
  });

  describe('applyRecommendation', () => {
    const mockRecommendation = {
      id: 'rec-123',
      currentEmissionRate: new Decimal(1.0),
      recommendedEmissionRate: new Decimal(0.95),
      adjustmentPercentage: new Decimal(-5),
      reason: 'Low redemption rate',
      redemptionRate30d: new Decimal(0.2),
      metricsSnapshot: {},
      status: 'PENDING',
      approvedBy: null,
      approvedAt: null,
      appliedAt: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    it('should apply a pending recommendation', async () => {
      prismaService.emissionRateRecommendation.findUnique.mockResolvedValue(
        mockRecommendation,
      );
      prismaService.emissionRateConfig.update.mockResolvedValue({} as any);
      prismaService.emissionRateRecommendation.update.mockResolvedValue(
        {} as any,
      );

      await service.applyRecommendation('rec-123', 'admin-user-123');

      expect(prismaService.emissionRateConfig.update).toHaveBeenCalledWith({
        where: { rateType: 'BASE' },
        data: expect.objectContaining({
          emissionRate: mockRecommendation.recommendedEmissionRate,
          lastAdjustedBy: 'admin-user-123',
        }),
      });

      expect(
        prismaService.emissionRateRecommendation.update,
      ).toHaveBeenCalledWith({
        where: { id: 'rec-123' },
        data: expect.objectContaining({
          status: 'APPROVED',
          approvedBy: 'admin-user-123',
        }),
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'emission.rate.adjusted',
        expect.any(Object),
      );
    });

    it('should throw error if recommendation not found', async () => {
      prismaService.emissionRateRecommendation.findUnique.mockResolvedValue(
        null,
      );

      await expect(
        service.applyRecommendation('rec-999', 'admin-user-123'),
      ).rejects.toThrow('Recommendation rec-999 not found');
    });

    it('should throw error if recommendation is not pending', async () => {
      const approvedRec = { ...mockRecommendation, status: 'APPROVED' };
      prismaService.emissionRateRecommendation.findUnique.mockResolvedValue(
        approvedRec,
      );

      await expect(
        service.applyRecommendation('rec-123', 'admin-user-123'),
      ).rejects.toThrow('not pending');
    });

    it('should throw error and mark as expired if recommendation has expired', async () => {
      const expiredRec = {
        ...mockRecommendation,
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      };
      prismaService.emissionRateRecommendation.findUnique.mockResolvedValue(
        expiredRec,
      );
      prismaService.emissionRateRecommendation.update.mockResolvedValue(
        {} as any,
      );

      await expect(
        service.applyRecommendation('rec-123', 'admin-user-123'),
      ).rejects.toThrow('has expired');

      expect(
        prismaService.emissionRateRecommendation.update,
      ).toHaveBeenCalledWith({
        where: { id: 'rec-123' },
        data: { status: 'EXPIRED' },
      });
    });
  });

  describe('rejectRecommendation', () => {
    it('should reject a pending recommendation', async () => {
      const mockRecommendation = {
        id: 'rec-123',
        status: 'PENDING',
      };

      prismaService.emissionRateRecommendation.findUnique.mockResolvedValue(
        mockRecommendation as any,
      );
      prismaService.emissionRateRecommendation.update.mockResolvedValue(
        {} as any,
      );

      await service.rejectRecommendation('rec-123', 'admin-user-123');

      expect(
        prismaService.emissionRateRecommendation.update,
      ).toHaveBeenCalledWith({
        where: { id: 'rec-123' },
        data: expect.objectContaining({
          status: 'REJECTED',
          approvedBy: 'admin-user-123',
        }),
      });
    });
  });

  describe('getRecommendations', () => {
    it('should return all recommendations when no status filter', async () => {
      const mockRecommendations = [{ id: 'rec-1' }, { id: 'rec-2' }];
      prismaService.emissionRateRecommendation.findMany.mockResolvedValue(
        mockRecommendations as any,
      );

      const result = await service.getRecommendations();

      expect(result).toEqual(mockRecommendations);
      expect(
        prismaService.emissionRateRecommendation.findMany,
      ).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by status when provided', async () => {
      const mockRecommendations = [{ id: 'rec-1', status: 'PENDING' }];
      prismaService.emissionRateRecommendation.findMany.mockResolvedValue(
        mockRecommendations as any,
      );

      const result = await service.getRecommendations('PENDING');

      expect(result).toEqual(mockRecommendations);
      expect(
        prismaService.emissionRateRecommendation.findMany,
      ).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
