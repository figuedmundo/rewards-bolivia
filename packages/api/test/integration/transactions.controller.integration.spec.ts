import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/infrastructure/prisma.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { User, Business } from '@prisma/client';

describe('TransactionsController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let redisService: RedisService;
  let testUser: User;
  let testBusiness: Business;
  let businessUser: User;

  beforeAll(async () => {
    // Set environment variables before creating the module
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_CALLBACK_URL =
      'http://localhost:3000/auth/google/callback';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    prisma = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);
    redisService = app.get<RedisService>(RedisService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prisma.pointLedger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();
    await prisma.refreshToken.deleteMany();

    // Clean Redis cache
    await redisService.del(`customer:${testUser?.id}:balance`);
    await redisService.del(`business:${testBusiness?.id}:balance`);

    // Create test user and business
    businessUser = await prisma.user.create({
      data: {
        email: 'business-owner@example.com',
        name: 'Business Owner',
        role: 'business',
      },
    });

    testUser = await prisma.user.create({
      data: {
        email: 'test-user@example.com',
        name: 'Test User',
        role: 'client',
        pointsBalance: 1000,
      },
    });

    testBusiness = await prisma.business.create({
      data: {
        name: 'Test Business',
        ownerId: businessUser.id,
        pointsBalance: 5000,
      },
    });
  });

  afterAll(async () => {
    const redisService = app.get(RedisService);
    await redisService['redisClient'].quit();
    await prisma.$disconnect();
    await app.close();
  });

  describe('/POST transactions/earn', () => {
    it('should fail without a valid token', () => {
      return request(app.getHttpServer())
        .post('/api/transactions/earn')
        .expect(401);
    });

    it('should successfully earn points for a customer', async () => {
      const earnDto = {
        customerId: testUser.id,
        purchaseAmount: 150,
        businessId: testBusiness.id,
      };

      // We need a business token for this endpoint
      const { accessToken: businessToken } = await authService.login(
        businessUser!,
      );

      const response = await request(app.getHttpServer())
        .post('/api/transactions/earn')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(earnDto)
        .expect(201);

      expect(response.body.pointsEarned).toBe(150);
      expect(response.body.newCustomerBalance).toBe(1150);

      // Verify db state
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser!.pointsBalance).toBe(1150);

      const updatedBusiness = await prisma.business.findUnique({
        where: { id: testBusiness.id },
      });
      expect(updatedBusiness!.pointsBalance).toBe(5000 - 150);

      // Verify Redis cache
      const cachedUserBalance = await redisService.get(
        `customer:${testUser.id}:balance`,
      );
      expect(cachedUserBalance).toBe('1150');

      const cachedBusinessBalance = await redisService.get(
        `business:${testBusiness.id}:balance`,
      );
      expect(cachedBusinessBalance).toBe('4850');
    });
  });

  describe('/POST transactions/redeem', () => {
    it('should fail without a valid token', () => {
      return request(app.getHttpServer())
        .post('/api/transactions/redeem')
        .expect(401);
    });

    it('should successfully redeem points for a customer', async () => {
      const { accessToken } = await authService.login(testUser);
      const userToken = accessToken;

      const redeemDto = {
        businessId: testBusiness.id,
        pointsToRedeem: 100,
        ticketTotal: 50,
      };

      const response = await request(app.getHttpServer())
        .post('/api/transactions/redeem')
        .set('Authorization', `Bearer ${userToken}`)
        .send(redeemDto)
        .expect(201);

      expect(response.body.pointsRedeemed).toBe(100);
      expect(response.body.newCustomerBalance).toBe(900);

      // Verify db state
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser!.pointsBalance).toBe(900);

      const updatedBusiness = await prisma.business.findUnique({
        where: { id: testBusiness.id },
      });
      expect(updatedBusiness!.pointsBalance).toBe(5000 + 100);

      // Verify Redis cache
      const cachedUserBalance = await redisService.get(
        `customer:${testUser.id}:balance`,
      );
      expect(cachedUserBalance).toBe('900');

      const cachedBusinessBalance = await redisService.get(
        `business:${testBusiness.id}:balance`,
      );
      expect(cachedBusinessBalance).toBe('5100');
    });

    it('should fail if redemption exceeds 30% of ticket total', async () => {
      const { accessToken } = await authService.login(testUser);
      const userToken = accessToken;

      const redeemDto = {
        businessId: testBusiness.id,
        pointsToRedeem: 100,
        ticketTotal: 9,
      }; // 100 * 0.03 = 3. 30% of 9 is 2.7

      return request(app.getHttpServer())
        .post('/api/transactions/redeem')
        .set('Authorization', `Bearer ${userToken}`)
        .send(redeemDto)
        .expect(400);
    });

    it('should handle full earn and redeem cycle end-to-end', async () => {
      // First, earn points
      const earnDto = {
        customerId: testUser.id,
        purchaseAmount: 200,
        businessId: testBusiness.id,
      };
      const { accessToken: businessToken } = await authService.login(
        businessUser!,
      );

      await request(app.getHttpServer())
        .post('/api/transactions/earn')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(earnDto)
        .expect(201);

      // Verify balances after earn
      let updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser!.pointsBalance).toBe(1200); // 1000 + 200

      let updatedBusiness = await prisma.business.findUnique({
        where: { id: testBusiness.id },
      });
      expect(updatedBusiness!.pointsBalance).toBe(4800); // 5000 - 200

      // Now, redeem points
      const { accessToken } = await authService.login(testUser);
      const userToken = accessToken;

      const redeemDto = {
        businessId: testBusiness.id,
        pointsToRedeem: 300,
        ticketTotal: 50,
      }; // 300 * 0.03 = 9, 30% of 50 = 15, ok

      const redeemResponse = await request(app.getHttpServer())
        .post('/api/transactions/redeem')
        .set('Authorization', `Bearer ${userToken}`)
        .send(redeemDto)
        .expect(201);

      expect(redeemResponse.body.pointsRedeemed).toBe(300);
      expect(redeemResponse.body.newCustomerBalance).toBe(900); // 1200 - 300

      // Verify final balances
      updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(updatedUser!.pointsBalance).toBe(900);

      updatedBusiness = await prisma.business.findUnique({
        where: { id: testBusiness.id },
      });
      expect(updatedBusiness!.pointsBalance).toBe(5100); // 4800 + 300

      // Verify Redis cache
      const cachedUserBalance = await redisService.get(
        `customer:${testUser.id}:balance`,
      );
      expect(cachedUserBalance).toBe('900');

      const cachedBusinessBalance = await redisService.get(
        `business:${testBusiness.id}:balance`,
      );
      expect(cachedBusinessBalance).toBe('5100');
    });
  });
});
