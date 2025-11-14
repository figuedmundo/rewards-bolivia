import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma.service';
import { AppModule } from '@/app.module';
import { EarnPointsUseCase } from '@/modules/transactions/application/earn-points.use-case';
import { LedgerHashService } from '@/modules/transactions/application/services/ledger-services/ledger-hash.service';
import { User, Business } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';

describe('Ledger Per-Transaction Hashing (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let earnPointsUseCase: EarnPointsUseCase;
  let ledgerHashService: LedgerHashService;

  let user: User;
  let business: Business;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    earnPointsUseCase = app.get<EarnPointsUseCase>(EarnPointsUseCase);
    ledgerHashService = app.get<LedgerHashService>(LedgerHashService);

    // Clear database before tests
    await prisma.pointLedger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await prisma.business.deleteMany();

    // Create a test user and business
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
  });

  afterAll(async () => {
    await prisma.pointLedger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await prisma.business.deleteMany();
    await app.close();
  });

  it('should create ledger entry with valid hash during EARN', async () => {
    const result = await earnPointsUseCase.execute(
      {
        customerId: user.id,
        purchaseAmount: 100,
      },
      business.id,
    );

    const ledgerEntries = await prisma.pointLedger.findMany({
      where: { transactionId: result.transactionId },
    });

    expect(ledgerEntries.length).toBeGreaterThan(0);

    for (const entry of ledgerEntries) {
      expect(entry.hash).toBeDefined();
      expect(entry.hash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex format

      // Verify hash is correct
      const computed = ledgerHashService.computeEntryHash(entry);
      expect(entry.hash).toBe(computed);
    }
  });

  it('should create ledger entries with different hashes for different data', async () => {
    const result1 = await earnPointsUseCase.execute(
      {
        customerId: user.id,
        purchaseAmount: 100,
      },
      business.id,
    );

    const result2 = await earnPointsUseCase.execute(
      {
        customerId: user.id,
        purchaseAmount: 200,
      },
      business.id,
    );

    const entries1 = await prisma.pointLedger.findMany({
      where: { transactionId: result1.transactionId },
    });

    const entries2 = await prisma.pointLedger.findMany({
      where: { transactionId: result2.transactionId },
    });

    // Hashes should be different
    const hashes1 = entries1.map((e) => e.hash);
    const hashes2 = entries2.map((e) => e.hash);

    // Assuming each transaction creates at least one ledger entry
    expect(hashes1.length).toBeGreaterThan(0);
    expect(hashes2.length).toBeGreaterThan(0);

    // Check that no hash from transaction 1 is equal to any hash from transaction 2
    for (const hash1 of hashes1) {
      for (const hash2 of hashes2) {
        expect(hash1).not.toBe(hash2);
      }
    }
  });
});
