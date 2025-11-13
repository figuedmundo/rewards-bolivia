import { Test, TestingModule } from '@nestjs/testing';
import {
  EconomicControlService,
  EconomicStats,
} from './economic-control.service';
import { ILedgerRepository } from '../../domain/repositories/ledger.repository';

describe('EconomicControlService', () => {
  let service: EconomicControlService;
  let ledgerRepository: ILedgerRepository;

  const mockLedgerRepository = {
    getTotalPointsIssued: jest.fn(),
    getTotalPointsRedeemed: jest.fn(),
    getTotalPointsBurned: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EconomicControlService,
        {
          provide: 'ILedgerRepository',
          useValue: mockLedgerRepository,
        },
      ],
    }).compile();

    service = module.get<EconomicControlService>(EconomicControlService);
    ledgerRepository = module.get<ILedgerRepository>('ILedgerRepository');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEconomicStats', () => {
    it('should calculate stats correctly with valid data', async () => {
      mockLedgerRepository.getTotalPointsIssued.mockResolvedValue(1000);
      mockLedgerRepository.getTotalPointsRedeemed.mockResolvedValue(500);
      mockLedgerRepository.getTotalPointsBurned.mockResolvedValue(10);

      const stats: EconomicStats = await service.getEconomicStats();

      expect(stats.totalPointsIssued).toBe(1000);
      expect(stats.totalPointsRedeemed).toBe(500);
      expect(stats.totalPointsBurned).toBe(10);
      expect(stats.burnRatio).toBe(10 / 500); // burned / redeemed = 2%
      expect(stats.activePointsPercentage).toBe((1000 - 500) / 1000); // (issued - redeemed) / issued = 50%
      expect(stats.redemptionRate).toBe(500 / 1000); // redeemed / issued = 50%
    });

    it('should handle division by zero gracefully', async () => {
      mockLedgerRepository.getTotalPointsIssued.mockResolvedValue(0);
      mockLedgerRepository.getTotalPointsRedeemed.mockResolvedValue(0);
      mockLedgerRepository.getTotalPointsBurned.mockResolvedValue(0);

      const stats: EconomicStats = await service.getEconomicStats();

      expect(stats.burnRatio).toBe(0);
      expect(stats.activePointsPercentage).toBe(0);
      expect(stats.redemptionRate).toBe(0);
    });
  });

  describe('getBurnFeeRate', () => {
    it('should return the correct burn fee rate', () => {
      expect(service.getBurnFeeRate()).toBe(0.005);
    });
  });
});
