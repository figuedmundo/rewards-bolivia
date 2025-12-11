import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from 'src/infrastructure/prisma.service';
import { AppModule } from 'src/app.module';
import { EarnPointsUseCase } from 'src/modules/transactions/application/earn-points.use-case';
import { RedeemPointsUseCase } from 'src/modules/transactions/application/redeem-points.use-case';
import { User, Business } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';

describe('Ledger Controller Filtering (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let earnPointsUseCase: EarnPointsUseCase;
  let redeemPointsUseCase: RedeemPointsUseCase;

  let regularUser: User;
  let adminUser: User;
  let business1: Business;
  let business2: Business;

  let regularUserToken: string;
  let adminUserToken: string;

  const TEST_TIMEOUT = 30000;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.setGlobalPrefix('api');
      await app.init();

      prisma = app.get<PrismaService>(PrismaService);
      earnPointsUseCase = app.get<EarnPointsUseCase>(EarnPointsUseCase);
      redeemPointsUseCase = app.get<RedeemPointsUseCase>(RedeemPointsUseCase);

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
          email: 'regular-filter@test.com',
          passwordHash: bcrypt.hashSync('password123', 10),
          name: 'Regular User',
          pointsBalance: 500,
          role: 'user',
        },
      });

      adminUser = await prisma.user.create({
        data: {
          id: createId(),
          email: 'admin-filter@test.com',
          passwordHash: bcrypt.hashSync('password123', 10),
          name: 'Admin User',
          pointsBalance: 0,
          role: 'admin',
        },
      });

      // Create businesses
      business1 = await prisma.business.create({
        data: {
          id: createId(),
          name: 'Coffee Shop',
          pointsBalance: 5000,
          ownerId: regularUser.id,
        },
      });

      business2 = await prisma.business.create({
        data: {
          id: createId(),
          name: 'Pizza Restaurant',
          pointsBalance: 5000,
          ownerId: regularUser.id,
        },
      });

      // Get auth tokens
      const regularUserLoginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'regular-filter@test.com',
          password: 'password123',
        });
      regularUserToken = regularUserLoginRes.body.accessToken;

      const adminUserLoginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'admin-filter@test.com',
          password: 'password123',
        });
      adminUserToken = adminUserLoginRes.body.accessToken;

      // Create diverse test transactions for filtering
      // EARN transactions at Coffee Shop
      await earnPointsUseCase.execute(
        {
          customerId: regularUser.id,
          purchaseAmount: 100, // Will earn ~10 points
        },
        business1.id,
      );

      await earnPointsUseCase.execute(
        {
          customerId: regularUser.id,
          purchaseAmount: 250, // Will earn ~25 points
        },
        business1.id,
      );

      // EARN transactions at Pizza Restaurant
      await earnPointsUseCase.execute(
        {
          customerId: regularUser.id,
          purchaseAmount: 500, // Will earn ~50 points
        },
        business2.id,
      );

      // Refresh user balance before redeeming
      regularUser = (await prisma.user.findUnique({
        where: { id: regularUser.id },
      })) as User;

      // REDEEM transactions
      await redeemPointsUseCase.execute(
        {
          businessId: business1.id,
          pointsToRedeem: 20,
          ticketTotal: 100, // 20 points = 0.6 Bs which is 0.6% of 100 Bs
        },
        regularUser.id,
      );

      // Refresh balance again
      regularUser = (await prisma.user.findUnique({
        where: { id: regularUser.id },
      })) as User;

      await redeemPointsUseCase.execute(
        {
          businessId: business2.id,
          pointsToRedeem: 30,
          ticketTotal: 150,
        },
        regularUser.id,
      );

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  }, TEST_TIMEOUT);

  afterAll(async () => {
    if (prisma) {
      await prisma.refreshToken.deleteMany();
      await prisma.pointLedger.deleteMany();
      await prisma.transaction.deleteMany();
      await prisma.dailyAuditHash.deleteMany();
      await prisma.user.deleteMany();
      await prisma.business.deleteMany();
    }
    if (app) {
      await app.close();
    }
  });

  describe('Transaction Type Filtering', () => {
    it(
      'should filter by single transaction type (EARN)',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?type=EARN')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();
        expect(response.body.entries.length).toBeGreaterThan(0);

        // All entries should be EARN type
        response.body.entries.forEach((entry: any) => {
          expect(entry.type).toBe('EARN');
        });
      },
      TEST_TIMEOUT,
    );

    it(
      'should filter by multiple transaction types (EARN,REDEEM)',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?type=EARN,REDEEM')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();
        expect(response.body.entries.length).toBeGreaterThan(0);

        // All entries should be either EARN or REDEEM
        response.body.entries.forEach((entry: any) => {
          expect(['EARN', 'REDEEM']).toContain(entry.type);
        });
      },
      TEST_TIMEOUT,
    );

    it(
      'should reject invalid transaction type',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?type=INVALID')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(400);

        expect(response.body.message).toContain('Invalid transaction type');
      },
      TEST_TIMEOUT,
    );
  });

  describe('Amount Range Filtering', () => {
    it(
      'should filter by minimum amount only',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?minAmount=30')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();

        // All credit entries should be >= 30 points
        response.body.entries.forEach((entry: any) => {
          if (entry.credit > 0) {
            expect(entry.credit).toBeGreaterThanOrEqual(30);
          }
        });
      },
      TEST_TIMEOUT,
    );

    it(
      'should filter by maximum amount only',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?maxAmount=30')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();

        // All credit entries should be <= 30 points
        response.body.entries.forEach((entry: any) => {
          if (entry.credit > 0) {
            expect(entry.credit).toBeLessThanOrEqual(30);
          }
        });
      },
      TEST_TIMEOUT,
    );

    it(
      'should filter by amount range (min and max)',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?minAmount=15&maxAmount=35')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();

        // All credit entries should be between 15 and 35 points
        response.body.entries.forEach((entry: any) => {
          if (entry.credit > 0) {
            expect(entry.credit).toBeGreaterThanOrEqual(15);
            expect(entry.credit).toBeLessThanOrEqual(35);
          }
        });
      },
      TEST_TIMEOUT,
    );

    it(
      'should reject invalid amount values',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?minAmount=invalid')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(400);

        expect(response.body.message).toContain('Invalid minAmount');
      },
      TEST_TIMEOUT,
    );

    it(
      'should reject max < min amount',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?minAmount=100&maxAmount=50')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(400);

        expect(response.body.message).toContain(
          'maxAmount must be greater than or equal to minAmount',
        );
      },
      TEST_TIMEOUT,
    );
  });

  describe('Business Search Filtering', () => {
    it(
      'should filter by business name (case-insensitive)',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?search=coffee')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();
        expect(response.body.entries.length).toBeGreaterThan(0);

        // Verify entries are related to Coffee Shop
        response.body.entries.forEach((entry: any) => {
          const businessName = entry.transaction?.business?.name;
          const txId = entry.transactionId;
          // Either business name contains 'coffee' or transactionId contains 'coffee'
          const matchesSearch =
            (businessName && businessName.toLowerCase().includes('coffee')) ||
            (txId && txId.toLowerCase().includes('coffee'));
          expect(matchesSearch).toBe(true);
        });
      },
      TEST_TIMEOUT,
    );

    it(
      'should return no results for non-existent business',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?search=nonexistent12345xyz')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();
        expect(response.body.entries.length).toBe(0);
        expect(response.body.total).toBe(0);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Combined Filters', () => {
    it(
      'should combine date range and transaction type filters',
      async () => {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const response = await request(app.getHttpServer())
          .get(
            `/api/ledger/entries?type=EARN&startDate=${yesterday.toISOString()}&endDate=${tomorrow.toISOString()}`,
          )
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();

        // All entries should be EARN type and within date range
        response.body.entries.forEach((entry: any) => {
          expect(entry.type).toBe('EARN');
          const entryDate = new Date(entry.createdAt);
          expect(entryDate.getTime()).toBeGreaterThanOrEqual(
            yesterday.getTime(),
          );
          expect(entryDate.getTime()).toBeLessThanOrEqual(tomorrow.getTime());
        });
      },
      TEST_TIMEOUT,
    );

    it(
      'should combine type, amount, and search filters',
      async () => {
        const response = await request(app.getHttpServer())
          .get('/api/ledger/entries?type=EARN&minAmount=15&search=pizza')
          .set('Authorization', `Bearer ${regularUserToken}`)
          .expect(200);

        expect(response.body.entries).toBeDefined();

        // All entries should match all filter criteria
        response.body.entries.forEach((entry: any) => {
          expect(entry.type).toBe('EARN');
          if (entry.credit > 0) {
            expect(entry.credit).toBeGreaterThanOrEqual(15);
          }
          const businessName = entry.transaction?.business?.name;
          const txId = entry.transactionId;
          const matchesSearch =
            (businessName && businessName.toLowerCase().includes('pizza')) ||
            (txId && txId.toLowerCase().includes('pizza'));
          expect(matchesSearch).toBe(true);
        });
      },
      TEST_TIMEOUT,
    );
  });
});
