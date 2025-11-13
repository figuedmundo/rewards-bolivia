import { Test, TestingModule } from '@nestjs/testing';
import { AuditHashService } from './audit-hash.service';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { LedgerEntryType } from '@prisma/client';
import type { DailyAuditHash, PointLedger } from '@prisma/client';

describe('AuditHashService', () => {
  let service: AuditHashService;
  let prisma: PrismaService;

  const mockDate = new Date('2025-01-15T00:00:00.000Z');
  const mockStartOfDay = new Date('2025-01-15T00:00:00.000Z');
  const mockEndOfDay = new Date('2025-01-15T23:59:59.999Z');

  const mockLedgerEntries: PointLedger[] = [
    {
      id: 'entry1',
      type: LedgerEntryType.EARN,
      accountId: 'account1',
      debit: 0,
      credit: 100,
      balanceAfter: 100,
      reason: null,
      hash: null,
      createdAt: new Date('2025-01-15T10:00:00.000Z'),
      transactionId: 'tx1',
    },
    {
      id: 'entry2',
      type: LedgerEntryType.REDEEM,
      accountId: 'account2',
      debit: 50,
      credit: 0,
      balanceAfter: 50,
      reason: null,
      hash: null,
      createdAt: new Date('2025-01-15T11:00:00.000Z'),
      transactionId: 'tx2',
    },
    {
      id: 'entry3',
      type: LedgerEntryType.BURN,
      accountId: 'account1',
      debit: 25,
      credit: 0,
      balanceAfter: 75,
      reason: null,
      hash: null,
      createdAt: new Date('2025-01-15T12:00:00.000Z'),
      transactionId: 'tx3',
    },
  ];

  const mockDailyAuditHash: DailyAuditHash = {
    id: 'hash1',
    date: mockStartOfDay,
    hash: 'abc123hash',
    entryCount: 3,
    transactionTypes: ['EARN', 'REDEEM', 'BURN'],
    blockchainTxHash: null,
    createdAt: new Date('2025-01-16T03:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditHashService,
        {
          provide: PrismaService,
          useValue: {
            dailyAuditHash: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
            },
            pointLedger: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuditHashService>(AuditHashService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDailyHash', () => {
    it('should generate a new hash when none exists', async () => {
      jest.spyOn(prisma.dailyAuditHash, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.pointLedger, 'findMany')
        .mockResolvedValue(mockLedgerEntries);
      jest
        .spyOn(prisma.dailyAuditHash, 'create')
        .mockResolvedValue(mockDailyAuditHash);

      const result = await service.generateDailyHash(mockDate);

      expect(result).toEqual(mockDailyAuditHash);
      expect(prisma.dailyAuditHash.findUnique).toHaveBeenCalledWith({
        where: { date: mockStartOfDay },
      });
      expect(prisma.pointLedger.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: mockStartOfDay,
            lte: mockEndOfDay,
          },
        },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      });
      expect(prisma.dailyAuditHash.create).toHaveBeenCalledWith({
        data: {
          date: mockStartOfDay,
          hash: expect.any(String),
          entryCount: 3,
          transactionTypes: ['EARN', 'REDEEM', 'BURN'],
        },
      });
    });

    it('should return existing hash if already generated', async () => {
      jest
        .spyOn(prisma.dailyAuditHash, 'findUnique')
        .mockResolvedValue(mockDailyAuditHash);

      const result = await service.generateDailyHash(mockDate);

      expect(result).toEqual(mockDailyAuditHash);
      expect(prisma.pointLedger.findMany).not.toHaveBeenCalled();
      expect(prisma.dailyAuditHash.create).not.toHaveBeenCalled();
    });

    it('should handle empty day with no ledger entries', async () => {
      const emptyHash: DailyAuditHash = {
        id: 'hash2',
        date: mockStartOfDay,
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // SHA256 of empty string
        entryCount: 0,
        transactionTypes: [],
        blockchainTxHash: null,
        createdAt: new Date(),
      };

      jest.spyOn(prisma.dailyAuditHash, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.pointLedger, 'findMany').mockResolvedValue([]);
      jest.spyOn(prisma.dailyAuditHash, 'create').mockResolvedValue(emptyHash);

      const result = await service.generateDailyHash(mockDate);

      expect(result.entryCount).toBe(0);
      expect(result.transactionTypes).toEqual([]);
      expect(result.hash).toBeDefined();
    });

    it('should extract unique transaction types correctly', async () => {
      const entriesWithDuplicateTypes: PointLedger[] = [
        ...mockLedgerEntries,
        {
          ...mockLedgerEntries[0],
          id: 'entry4',
          createdAt: new Date('2025-01-15T13:00:00.000Z'),
        },
      ];

      jest.spyOn(prisma.dailyAuditHash, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.pointLedger, 'findMany')
        .mockResolvedValue(entriesWithDuplicateTypes);
      jest
        .spyOn(prisma.dailyAuditHash, 'create')
        .mockResolvedValue(mockDailyAuditHash);

      await service.generateDailyHash(mockDate);

      expect(prisma.dailyAuditHash.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          transactionTypes: ['EARN', 'REDEEM', 'BURN'], // No duplicates
        }),
      });
    });

    it('should generate deterministic hash for same input', async () => {
      jest.spyOn(prisma.dailyAuditHash, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.pointLedger, 'findMany')
        .mockResolvedValue(mockLedgerEntries);

      let capturedHash1: string | undefined;
      jest
        .spyOn(prisma.dailyAuditHash, 'create')
        .mockImplementation(async (args) => {
          capturedHash1 = args.data.hash;
          return { ...mockDailyAuditHash, hash: args.data.hash };
        });

      await service.generateDailyHash(mockDate);

      // Reset mocks and generate again with same data
      jest.clearAllMocks();
      jest.spyOn(prisma.dailyAuditHash, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.pointLedger, 'findMany')
        .mockResolvedValue(mockLedgerEntries);

      let capturedHash2: string | undefined;
      jest
        .spyOn(prisma.dailyAuditHash, 'create')
        .mockImplementation(async (args) => {
          capturedHash2 = args.data.hash;
          return { ...mockDailyAuditHash, hash: args.data.hash };
        });

      await service.generateDailyHash(mockDate);

      expect(capturedHash1).toBe(capturedHash2);
      expect(capturedHash1).toBeDefined();
    });

    it('should generate different hash for different input', async () => {
      const modifiedEntries = [
        {
          ...mockLedgerEntries[0],
          credit: 200, // Different amount
        },
      ];

      jest.spyOn(prisma.dailyAuditHash, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.pointLedger, 'findMany')
        .mockResolvedValue(mockLedgerEntries);

      let hash1: string | undefined;
      jest
        .spyOn(prisma.dailyAuditHash, 'create')
        .mockImplementation(async (args) => {
          hash1 = args.data.hash;
          return { ...mockDailyAuditHash, hash: args.data.hash };
        });

      await service.generateDailyHash(mockDate);

      // Generate with modified data
      jest.clearAllMocks();
      jest.spyOn(prisma.dailyAuditHash, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.pointLedger, 'findMany')
        .mockResolvedValue(modifiedEntries);

      let hash2: string | undefined;
      jest
        .spyOn(prisma.dailyAuditHash, 'create')
        .mockImplementation(async (args) => {
          hash2 = args.data.hash;
          return { ...mockDailyAuditHash, hash: args.data.hash };
        });

      await service.generateDailyHash(mockDate);

      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyDailyHash', () => {
    it('should verify valid hash successfully', async () => {
      // Generate the actual hash from the mock entries to ensure it matches
      jest.spyOn(prisma.dailyAuditHash, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prisma.pointLedger, 'findMany')
        .mockResolvedValue(mockLedgerEntries);

      let actualHash: string | undefined;
      jest
        .spyOn(prisma.dailyAuditHash, 'create')
        .mockImplementation(async (args) => {
          actualHash = args.data.hash;
          return { ...mockDailyAuditHash, hash: args.data.hash };
        });

      await service.generateDailyHash(mockDate);

      // Now verify with the actual hash
      jest.clearAllMocks();
      const storedHashWithActualHash = {
        ...mockDailyAuditHash,
        hash: actualHash!,
      };
      jest
        .spyOn(prisma.dailyAuditHash, 'findUnique')
        .mockResolvedValue(storedHashWithActualHash);
      jest
        .spyOn(prisma.pointLedger, 'findMany')
        .mockResolvedValue(mockLedgerEntries);

      const result = await service.verifyDailyHash(mockDate);

      expect(result.valid).toBe(true);
      expect(result.stored).toBe(actualHash);
      expect(result.computed).toBe(actualHash);
      expect(result.entryCount).toBe(3);
      expect(result.date).toEqual(mockStartOfDay);
    });

    it('should detect tampered data (invalid hash)', async () => {
      const storedHash = {
        ...mockDailyAuditHash,
        hash: 'tampered_hash',
      };

      jest
        .spyOn(prisma.dailyAuditHash, 'findUnique')
        .mockResolvedValue(storedHash);
      jest
        .spyOn(prisma.pointLedger, 'findMany')
        .mockResolvedValue(mockLedgerEntries);

      const result = await service.verifyDailyHash(mockDate);

      expect(result.valid).toBe(false);
      expect(result.stored).toBe('tampered_hash');
      expect(result.computed).not.toBe('tampered_hash');
      expect(result.entryCount).toBe(3);
    });

    it('should throw error when no stored hash exists', async () => {
      jest.spyOn(prisma.dailyAuditHash, 'findUnique').mockResolvedValue(null);

      await expect(service.verifyDailyHash(mockDate)).rejects.toThrow(
        'No audit hash found for date: 2025-01-15',
      );
    });

    it('should correctly count entries during verification', async () => {
      jest
        .spyOn(prisma.dailyAuditHash, 'findUnique')
        .mockResolvedValue(mockDailyAuditHash);
      jest
        .spyOn(prisma.pointLedger, 'findMany')
        .mockResolvedValue(mockLedgerEntries);

      const result = await service.verifyDailyHash(mockDate);

      expect(result.entryCount).toBe(mockLedgerEntries.length);
    });
  });

  describe('getDailyHash', () => {
    it('should return hash for valid date', async () => {
      jest
        .spyOn(prisma.dailyAuditHash, 'findUnique')
        .mockResolvedValue(mockDailyAuditHash);

      const result = await service.getDailyHash(mockDate);

      expect(result).toEqual(mockDailyAuditHash);
      expect(prisma.dailyAuditHash.findUnique).toHaveBeenCalledWith({
        where: { date: mockStartOfDay },
      });
    });

    it('should return null for date with no hash', async () => {
      jest.spyOn(prisma.dailyAuditHash, 'findUnique').mockResolvedValue(null);

      const result = await service.getDailyHash(mockDate);

      expect(result).toBeNull();
    });
  });

  describe('getAllDailyHashes', () => {
    const mockHashes: DailyAuditHash[] = [
      {
        ...mockDailyAuditHash,
        id: 'hash1',
        date: new Date('2025-01-15T00:00:00.000Z'),
      },
      {
        ...mockDailyAuditHash,
        id: 'hash2',
        date: new Date('2025-01-14T00:00:00.000Z'),
      },
      {
        ...mockDailyAuditHash,
        id: 'hash3',
        date: new Date('2025-01-13T00:00:00.000Z'),
      },
    ];

    it('should return hashes ordered by date descending', async () => {
      jest
        .spyOn(prisma.dailyAuditHash, 'findMany')
        .mockResolvedValue(mockHashes);

      const result = await service.getAllDailyHashes();

      expect(result).toEqual(mockHashes);
      expect(prisma.dailyAuditHash.findMany).toHaveBeenCalledWith({
        orderBy: { date: 'desc' },
        take: undefined,
      });
    });

    it('should respect limit parameter', async () => {
      const limitedHashes = mockHashes.slice(0, 2);
      jest
        .spyOn(prisma.dailyAuditHash, 'findMany')
        .mockResolvedValue(limitedHashes);

      const result = await service.getAllDailyHashes(2);

      expect(result).toHaveLength(2);
      expect(prisma.dailyAuditHash.findMany).toHaveBeenCalledWith({
        orderBy: { date: 'desc' },
        take: 2,
      });
    });

    it('should return empty array when no hashes exist', async () => {
      jest.spyOn(prisma.dailyAuditHash, 'findMany').mockResolvedValue([]);

      const result = await service.getAllDailyHashes();

      expect(result).toEqual([]);
    });
  });
});
