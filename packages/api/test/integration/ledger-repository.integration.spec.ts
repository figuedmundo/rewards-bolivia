import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma.service';
import { AppModule } from '@/app.module';
import { PrismaLedgerRepository } from '@/modules/transactions/infrastructure/repositories/prisma-ledger.repository';
import { EarnPointsUseCase } from '@/modules/transactions/application/earn-points.use-case';
import { User, Business } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';

describe('Ledger Repository Granular Queries (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let repository: PrismaLedgerRepository;
  let earnPointsUseCase: EarnPointsUseCase;

  let user: User;
  let business: Business;
  const transactionIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    repository = app.get<PrismaLedgerRepository>(PrismaLedgerRepository);
    earnPointsUseCase = app.get<EarnPointsUseCase>(EarnPointsUseCase);

    // Clear database before tests
    await prisma.pointLedger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await prisma.business.deleteMany();

    // Create test user and business
    user = await prisma.user.create({
      data: {
        id: createId(),
        email: 'testuser@example.com',
        passwordHash: bcrypt.hashSync('password', 10),
        name: 'Test User',
        pointsBalance: 0,
      },
    });

    business = await prisma.business.create({
      data: {
        id: createId(),
        name: 'Test Business',
        pointsBalance: 1000,
        ownerId: user.id,
      },
    });

    // Create some test transactions
    for (let i = 0; i < 5; i++) {
      const result = await earnPointsUseCase.execute(
        {
          customerId: user.id,
          purchaseAmount: 100 + i * 10, // Different amounts for variety
        },
        business.id,
      );
      transactionIds.push(result.transactionId);
    }
  });

  afterAll(async () => {
    await prisma.pointLedger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await prisma.business.deleteMany();
    await app.close();
  });

  describe('findLedgerEntriesByAccount', () => {
    it('should find entries by account with pagination', async () => {
      const result = await repository.findLedgerEntriesByAccount(user.id, {
        limit: 3,
        offset: 0,
      });

      expect(result.entries.length).toBe(3);
      expect(result.total).toBeGreaterThan(3); // Should have more entries from the 5 transactions
      expect(result.entries[0].accountId).toBe(user.id);
      expect(result.entries[0].hash).toBeDefined();
    });

    it('should respect pagination offset', async () => {
      const firstPage = await repository.findLedgerEntriesByAccount(user.id, {
        limit: 2,
        offset: 0,
      });

      const secondPage = await repository.findLedgerEntriesByAccount(user.id, {
        limit: 2,
        offset: 2,
      });

      expect(firstPage.entries.length).toBe(2);
      expect(secondPage.entries.length).toBe(2);
      expect(firstPage.entries[0].id).not.toBe(secondPage.entries[0].id);
    });
  });

  describe('findLedgerEntriesByTransaction', () => {
    it('should find all entries for a specific transaction', async () => {
      const transactionId = transactionIds[0];
      const entries =
        await repository.findLedgerEntriesByTransaction(transactionId);

      expect(entries.length).toBeGreaterThan(0);
      entries.forEach((entry) => {
        expect(entry.transactionId).toBe(transactionId);
        expect(entry.hash).toBeDefined();
      });
    });
  });

  describe('findLedgerEntriesByDateRange', () => {
    it('should find entries within date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1);

      const result = await repository.findLedgerEntriesByDateRange(
        startDate,
        endDate,
        {
          limit: 10,
          offset: 0,
        },
      );

      expect(result.entries.length).toBeGreaterThan(0);
      result.entries.forEach((entry) => {
        expect(entry.createdAt >= startDate).toBe(true);
        expect(entry.createdAt <= endDate).toBe(true);
        expect(entry.hash).toBeDefined();
      });
    });
  });

  describe('findLedgerEntryById', () => {
    it('should find a specific entry by ID', async () => {
      // Get an entry ID from one of the transactions
      const allEntries = await repository.findLedgerEntriesByAccount(user.id, {
        limit: 1,
      });
      const entryId = allEntries.entries[0].id;

      const entry = await repository.findLedgerEntryById(entryId);

      expect(entry).toBeDefined();
      expect(entry!.id).toBe(entryId);
      expect(entry!.accountId).toBe(user.id);
      expect(entry!.hash).toBeDefined();
    });

    it('should return null for non-existent entry', async () => {
      const entry = await repository.findLedgerEntryById('nonexistent-id');
      expect(entry).toBeNull();
    });
  });
});
