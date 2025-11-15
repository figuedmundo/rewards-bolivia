import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { PrismaLedgerRepository } from './prisma-ledger.repository';
import { PointLedger, LedgerEntryType } from '@prisma/client';

describe('PrismaLedgerRepository - Granular Queries', () => {
  let repository: PrismaLedgerRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    // Use real PrismaService but mock its methods
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaLedgerRepository, PrismaService],
    }).compile();

    repository = module.get<PrismaLedgerRepository>(PrismaLedgerRepository);
    prismaService = module.get(PrismaService);

    // Mock the Prisma methods
    jest.spyOn(prismaService.pointLedger, 'findMany').mockResolvedValue([]);
    jest.spyOn(prismaService.pointLedger, 'count').mockResolvedValue(0);
    jest.spyOn(prismaService.pointLedger, 'findUnique').mockResolvedValue(null);
    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (queries: any[]) => {
        // Mock implementation that returns results based on the queries
        const results = [];
        for (const query of queries) {
          if (query.count) {
            results.push(0); // default count
          } else if (query.findMany) {
            results.push([]); // default findMany
          } else {
            results.push([]);
          }
        }
        return results;
      });
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  const createMockEntry = (overrides?: Partial<PointLedger>): PointLedger => {
    return {
      id: 'clx123mockid',
      type: LedgerEntryType.EARN,
      accountId: 'user_abc',
      debit: 0,
      credit: 100,
      balanceAfter: 100,
      reason: 'Test reason',
      hash: 'mockhash123',
      createdAt: new Date('2025-11-13T10:30:00Z'),
      transactionId: 'tx_xyz',
      ...overrides,
    };
  };

  describe('findLedgerEntriesByAccount', () => {
    it('should find entries by account with pagination', async () => {
      const mockEntries = [
        createMockEntry(),
        createMockEntry({ id: 'clx456mockid' }),
      ];
      const mockTotal = 2;

      prismaService.$transaction.mockResolvedValue([mockEntries, mockTotal]);

      const result = await repository.findLedgerEntriesByAccount('user_abc', {
        limit: 5,
        offset: 0,
      });

      expect(result.entries).toEqual(mockEntries);
      expect(result.total).toBe(mockTotal);
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should use default pagination options', async () => {
      const mockEntries = [createMockEntry()];
      const mockTotal = 1;

      prismaService.$transaction.mockResolvedValue([mockEntries, mockTotal]);

      const result = await repository.findLedgerEntriesByAccount('user_abc');

      expect(result.entries).toEqual(mockEntries);
      expect(result.total).toBe(mockTotal);
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('findLedgerEntriesByTransaction', () => {
    it('should find entries by transaction', async () => {
      const mockEntries = [
        createMockEntry(),
        createMockEntry({
          id: 'clx456mockid',
          type: LedgerEntryType.REDEEM,
          debit: 50,
          credit: 0,
        }),
      ];

      (prismaService.pointLedger.findMany as jest.Mock).mockResolvedValue(
        mockEntries,
      );

      const result = await repository.findLedgerEntriesByTransaction('tx_xyz');

      expect(result).toEqual(mockEntries);
      expect(prismaService.pointLedger.findMany).toHaveBeenCalledWith({
        where: { transactionId: 'tx_xyz' },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      });
    });
  });

  describe('findLedgerEntriesByDateRange', () => {
    it('should find entries by date range with pagination', async () => {
      const startDate = new Date('2025-11-01');
      const endDate = new Date('2025-11-30');
      const mockEntries = [createMockEntry()];
      const mockTotal = 1;

      prismaService.$transaction.mockResolvedValue([mockEntries, mockTotal]);

      const result = await repository.findLedgerEntriesByDateRange(
        startDate,
        endDate,
        {
          limit: 10,
          offset: 5,
        },
      );

      expect(result.entries).toEqual(mockEntries);
      expect(result.total).toBe(mockTotal);
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should use default pagination for date range queries', async () => {
      const startDate = new Date('2025-11-01');
      const endDate = new Date('2025-11-30');
      const mockEntries = [createMockEntry()];
      const mockTotal = 1;

      prismaService.$transaction.mockResolvedValue([mockEntries, mockTotal]);

      const result = await repository.findLedgerEntriesByDateRange(
        startDate,
        endDate,
      );

      expect(result.entries).toEqual(mockEntries);
      expect(result.total).toBe(mockTotal);
      expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('findLedgerEntryById', () => {
    it('should find entry by id', async () => {
      const mockEntry = createMockEntry();

      (prismaService.pointLedger.findUnique as jest.Mock).mockResolvedValue(
        mockEntry,
      );

      const result = await repository.findLedgerEntryById('clx123mockid');

      expect(result).toEqual(mockEntry);
      expect(prismaService.pointLedger.findUnique).toHaveBeenCalledWith({
        where: { id: 'clx123mockid' },
      });
    });

    it('should return null if entry not found', async () => {
      (prismaService.pointLedger.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await repository.findLedgerEntryById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
