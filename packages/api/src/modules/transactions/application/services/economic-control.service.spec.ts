import { Test, TestingModule } from '@nestjs/testing';
import { EconomicControlService } from './economic-control.service';
import { PrismaService } from 'src/infrastructure/prisma.service';
import { TransactionType } from '@prisma/client';

describe('EconomicControlService', () => {
  let service: EconomicControlService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EconomicControlService,
        {
          provide: PrismaService,
          useValue: {
            transaction: {
              aggregate: jest.fn(),
            },
            user: {
              aggregate: jest.fn(),
            },
            business: {
              aggregate: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EconomicControlService>(EconomicControlService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the correct burn fee rate', () => {
    expect(service.getBurnFeeRate()).toBe(0.005);
  });

  describe('getEconomyStats', () => {
    it('should return correct economic statistics', async () => {
      jest.spyOn(prisma.transaction, 'aggregate').mockImplementation((args) => {
        if (args.where.type === TransactionType.EARN) {
          return Promise.resolve({ _sum: { pointsAmount: 1000 } });
        }
        if (args.where.type === TransactionType.REDEEM) {
          return Promise.resolve({ _sum: { pointsAmount: 500, burnAmount: 5 } });
        }
        return Promise.resolve({ _sum: { pointsAmount: 0, burnAmount: 0 } });
      });

      jest.spyOn(prisma.user, 'aggregate').mockResolvedValue({ _sum: { pointsBalance: 300 } });
      jest.spyOn(prisma.business, 'aggregate').mockResolvedValue({ _sum: { pointsBalance: 200 } });

      const stats = await service.getEconomyStats();

      expect(stats.totalEarned).toBe(1000);
      expect(stats.totalRedeemed).toBe(500);
      expect(stats.totalBurned).toBe(5);
      expect(stats.totalPointsInCirculation).toBe(300);
      expect(stats.totalBusinessPoints).toBe(200);
      expect(stats.totalIssued).toBe(1200); // 1000 (earned) + 200 (business points)
      expect(stats.totalActive).toBe(500); // 300 (user) + 200 (business)
      expect(stats.redemptionRate).toBeCloseTo((500 / 1200) * 100);
      expect(stats.burnRatio).toBeCloseTo((5 / 500) * 100);
      expect(stats.activePointsPercentage).toBeCloseTo((500 / 1200) * 100);
    });

    it('should handle zero values gracefully', async () => {
      jest.spyOn(prisma.transaction, 'aggregate').mockResolvedValue({ _sum: { pointsAmount: 0, burnAmount: 0 } });
      jest.spyOn(prisma.user, 'aggregate').mockResolvedValue({ _sum: { pointsBalance: 0 } });
      jest.spyOn(prisma.business, 'aggregate').mockResolvedValue({ _sum: { pointsBalance: 0 } });

      const stats = await service.getEconomyStats();

      expect(stats.totalEarned).toBe(0);
      expect(stats.totalRedeemed).toBe(0);
      expect(stats.totalBurned).toBe(0);
      expect(stats.totalPointsInCirculation).toBe(0);
      expect(stats.totalBusinessPoints).toBe(0);
      expect(stats.totalIssued).toBe(0);
      expect(stats.totalActive).toBe(0);
      expect(stats.redemptionRate).toBe(0);
      expect(stats.burnRatio).toBe(0);
      expect(stats.activePointsPercentage).toBe(0);
    });
  });

  describe('checkAndAdjustEmission', () => {
    it('should log a message for now as it is a placeholder', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      await service.checkAndAdjustEmission();
      expect(consoleSpy).toHaveBeenCalledWith('Checking and adjusting emission rates (placeholder)');
      consoleSpy.mockRestore();
    });
  });
});
