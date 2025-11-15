import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/infrastructure/prisma.service';
import { AppModule } from 'src/app.module';
import { EarnPointsUseCase } from 'src/modules/transactions/application/earn-points.use-case';
import { User, Business } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';

describe('Ledger Controller Endpoints (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let earnPointsUseCase: EarnPointsUseCase;

  let regularUser: User;
  let adminUser: User;
  let otherUser: User;
  let business: Business;

  let regularUserToken: string;
  let adminUserToken: string;
  let otherUserToken: string;

  let transactionId: string;
  let ledgerEntryId: string;
  let otherUserLedgerEntryId: string;

  const TEST_TIMEOUT = 30000;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    earnPointsUseCase = app.get<EarnPointsUseCase>(EarnPointsUseCase);

    // Clear database
    await prisma.refreshToken.deleteMany();
    await prisma.pointLedger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.dailyAuditHash.deleteMany();
    await prisma.user.deleteMany();
    await prisma.business.deleteMany();

    // Create test users
    regularUser = await prisma.user.create({
      data: {
        id: createId(),
        email: 'regular@example.com',
        passwordHash: bcrypt.hashSync('password123', 10),
        name: 'Regular User',
        pointsBalance: 0,
        role: 'user',
      },
    });

    otherUser = await prisma.user.create({
      data: {
        id: createId(),
        email: 'other@example.com',
        passwordHash: bcrypt.hashSync('password123', 10),
        name: 'Other User',
        pointsBalance: 0,
        role: 'user',
      },
    });

    adminUser = await prisma.user.create({
      data: {
        id: createId(),
        email: 'admin@example.com',
        passwordHash: bcrypt.hashSync('password123', 10),
        name: 'Admin User',
        pointsBalance: 0,
        role: 'admin',
      },
    });

    // Create business
    business = await prisma.business.create({
      data: {
        id: createId(),
        name: 'Test Business',
        pointsBalance: 5000,
        ownerId: regularUser.id,
      },
    });

    // Get auth tokens
    const regularUserLoginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'regular@example.com',
        password: 'password123',
      });
    regularUserToken = regularUserLoginRes.body.accessToken;

    const otherUserLoginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'other@example.com',
        password: 'password123',
      });
    otherUserToken = otherUserLoginRes.body.accessToken;

    const adminUserLoginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });
    adminUserToken = adminUserLoginRes.body.accessToken;

    // Create a test transaction with ledger entries
    const earnResult = await earnPointsUseCase.execute(
      {
        customerId: regularUser.id,
        purchaseAmount: 100,
      },
      business.id,
    );
    transactionId = earnResult.transactionId;

    // Get a ledger entry ID for testing (customer EARN entry, not business)
    const ledgerEntries = await prisma.pointLedger.findMany({
      where: {
        transactionId,
        accountId: regularUser.id,
        type: 'EARN', // Only get EARN entries which are for the customer
      },
    });
    if (ledgerEntries.length === 0) {
      throw new Error('No EARN ledger entry found for test setup');
    }
    ledgerEntryId = ledgerEntries[0].id;

    // Create multiple transactions for pagination testing
    for (let i = 0; i < 3; i++) {
      await earnPointsUseCase.execute(
        {
          customerId: regularUser.id,
          purchaseAmount: 50 + i * 10,
        },
        business.id,
      );
    }

    // Create a transaction for otherUser to test authorization
    const otherUserTransaction = await earnPointsUseCase.execute(
      {
        customerId: otherUser.id,
        purchaseAmount: 100,
      },
      business.id,
    );

    const otherUserEntries = await prisma.pointLedger.findMany({
      where: {
        transactionId: otherUserTransaction.transactionId,
        accountId: otherUser.id,
        type: 'EARN',
      },
      take: 1,
    });
    if (otherUserEntries.length > 0) {
      otherUserLedgerEntryId = otherUserEntries[0].id;
    }
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.pointLedger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.dailyAuditHash.deleteMany();
    await prisma.user.deleteMany();
    await prisma.business.deleteMany();
    await app.close();
  });

  describe('GET /api/ledger/entries', () => {
    it(
      'should return 401 without authentication',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries')
          .expect(401);

        expect(response.body.statusCode).toBe(401);
      },
      TEST_TIMEOUT,
    );

    it(
      'should return user own ledger entries when authenticated',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();
        expect(Array.isArray(response.body.entries)).toBe(true);
        expect(response.body.total).toBeGreaterThan(0);
        expect(response.body.limit).toBe(50);
        expect(response.body.offset).toBe(0);

        // Verify we have valid entries with hashes
        expect(response.body.entries.length).toBeGreaterThan(0);
        response.body.entries.forEach((entry: any) => {
          expect(entry.hash).toBeDefined();
          expect(entry.hash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex format
        });
      },
      TEST_TIMEOUT,
    );

    it(
      'should filter by transactionId',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/ledger/entries?transactionId=${transactionId}`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();
        expect(response.body.entries.length).toBeGreaterThan(0);
        response.body.entries.forEach((entry: any) => {
          expect(entry.transactionId).toBe(transactionId);
          expect(entry.hash).toBeDefined();
        });
      },
      TEST_TIMEOUT,
    );

    it(
      'should respect pagination limit',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?limit=3&offset=0')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries.length).toBeLessThanOrEqual(3);
        expect(response.body.limit).toBe(3);
        expect(response.body.offset).toBe(0);
      },
      TEST_TIMEOUT,
    );

    it(
      'should reject limit exceeding 500',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?limit=501')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(400);

        expect(response.body.message).toContain('Limit cannot exceed 500');
      },
      TEST_TIMEOUT,
    );
  });

  describe('GET /api/ledger/entries/:id', () => {
    it(
      'should return 401 without authentication',
      async () => {
        await request(app.getHttpServer())
          .get(`/api/ledger/entries/${ledgerEntryId}`)
          .expect(401);
      },
      TEST_TIMEOUT,
    );

    it(
      'should return single entry when authorized',
      async () => {
        // Using admin token to ensure we can access any entry
        const response = await request(app.getHttpServer())
          .get(`/api/ledger/entries/${ledgerEntryId}`)
          .set('Authorization', `Bearer ${adminUserToken}`)
          .expect(200);

        expect(response.body.id).toBe(ledgerEntryId);
        expect(response.body.hash).toBeDefined();
        expect(response.body.hash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex format
        expect(response.body.type).toBeDefined();
        expect(response.body.transactionId).toBeDefined();
      },
      TEST_TIMEOUT,
    );

    it(
      'should allow admin to access any entry',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/ledger/entries/${ledgerEntryId}`)
          .set('Authorization', `Bearer ${adminUserToken}`)
          .expect(200);

        expect(response.body.id).toBe(ledgerEntryId);
      },
      TEST_TIMEOUT,
    );

    it(
      'should return 404 for non-existent entry',
      async () => {
        await request(app.getHttpServer())
          .get('/api/ledger/entries/nonexistent-id')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(404);
      },
      TEST_TIMEOUT,
    );
  });

  describe('GET /api/ledger/entries/:id/verify', () => {
    it(
      'should return 401 without authentication',
      async () => {
        await request(app.getHttpServer())
          .get(`/api/ledger/entries/${ledgerEntryId}/verify`)
          .expect(401);
      },
      TEST_TIMEOUT,
    );

    it(
      'should verify valid hash for entry',
      async () => {
        // Using admin token to ensure we can access any entry
        const response = await request(app.getHttpServer())
          .get(`/api/ledger/entries/${ledgerEntryId}/verify`)
          .set('Authorization', `Bearer ${adminUserToken}`)
          .expect(200);

        expect(response.body.id).toBe(ledgerEntryId);
        expect(response.body.valid).toBe(true);
        expect(response.body.storedHash).toBeDefined();
        expect(response.body.computedHash).toBeDefined();
        expect(response.body.storedHash).toBe(response.body.computedHash);
        expect(response.body.storedHash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex format
        expect(response.body.message).toContain('passed');
        expect(response.body.entry).toBeDefined();
      },
      TEST_TIMEOUT,
    );

    it(
      'should allow admin to verify any entry',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/ledger/entries/${ledgerEntryId}/verify`)
          .set('Authorization', `Bearer ${adminUserToken}`)
          .expect(200);

        expect(response.body.valid).toBe(true);
      },
      TEST_TIMEOUT,
    );

    it(
      'should return 404 for non-existent entry',
      async () => {
        await request(app.getHttpServer())
          .get('/api/ledger/entries/nonexistent-id/verify')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(404);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Authorization & Security', () => {
    it(
      'should reject query for other user accountId (non-admin)',
      async () => {
        await request(app.getHttpServer())
          .get(`/api/ledger/entries?accountId=${otherUser.id}`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(401);
      },
      TEST_TIMEOUT,
    );

    it(
      'should allow admin to query any accountId',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/ledger/entries?accountId=${regularUser.id}`)
          .set('Authorization', `Bearer ${adminUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();
        expect(Array.isArray(response.body.entries)).toBe(true);
      },
      TEST_TIMEOUT,
    );

    it(
      'should reject access to other user entry (non-admin)',
      async () => {
        if (otherUserLedgerEntryId) {
          await request(app.getHttpServer())
            .get(`/api/ledger/entries/${otherUserLedgerEntryId}`)
            .set('Authorization', `Bearer ${regularUserToken}`)
            .expect(401);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should reject access to other user entry verification (non-admin)',
      async () => {
        if (otherUserLedgerEntryId) {
          await request(app.getHttpServer())
            .get(`/api/ledger/entries/${otherUserLedgerEntryId}/verify`)
            .set('Authorization', `Bearer ${regularUserToken}`)
            .expect(401);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should allow admin to access any entry',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/ledger/entries/${ledgerEntryId}`)
          .set('Authorization', `Bearer ${adminUserToken}`)
          .expect(200);

        expect(response.body.id).toBe(ledgerEntryId);
      },
      TEST_TIMEOUT,
    );

    it(
      'should enforce authentication for all endpoints',
      async () => {
        await request(app.getHttpServer())
          .get('/api/ledger/entries')
          .expect(401);

        await request(app.getHttpServer())
          .get(`/api/ledger/entries/${ledgerEntryId}`)
          .expect(401);

        await request(app.getHttpServer())
          .get(`/api/ledger/entries/${ledgerEntryId}/verify`)
          .expect(401);
      },
      TEST_TIMEOUT,
    );

    it(
      'should include hash in all ledger entry responses',
      async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/ledger/entries?transactionId=${transactionId}`)
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries.length).toBeGreaterThan(0);
        response.body.entries.forEach((entry: any) => {
          expect(entry.hash).toBeDefined();
          expect(entry.hash).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex format
        });
      },
      TEST_TIMEOUT,
    );
  });
});
