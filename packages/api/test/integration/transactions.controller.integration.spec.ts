import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/infrastructure/prisma.service';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { User, Business } from '@prisma/client';

describe('TransactionsController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let testUser: User;
  let testBusiness: Business;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    prisma = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);
    await app.init();

    // Clean database
    await prisma.transaction.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();

    // Create test user and business
    testUser = await prisma.user.create({
      data: {
        email: 'test-user@example.com',
        name: 'Test User',
        role: 'client',
        pointsBalance: 1000,
      },
    });

    const businessUser = await prisma.user.create({
      data: {
        email: 'business-owner@example.com',
        name: 'Business Owner',
        role: 'business',
      },
    });

    testBusiness = await prisma.business.create({
      data: {
        name: 'Test Business',
        ownerId: businessUser.id,
        pointsBalance: 5000,
      },
    });

    // Generate JWT token
    const { accessToken } = await authService.login(testUser);
    userToken = accessToken;
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.business.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/POST transactions/earn', () => {
    it('should fail without a valid token', () => {
      return request(app.getHttpServer()).post('/transactions/earn').expect(401);
    });

    it('should successfully earn points for a customer', async () => {
      const earnDto = { customerId: testUser.id, purchaseAmount: 150 };

      // We need a business token for this endpoint
      const businessOwner = await prisma.user.findUnique({where: {email: 'business-owner@example.com'}})
      const { accessToken: businessToken } = await authService.login(businessOwner, testBusiness.id);

      const response = await request(app.getHttpServer())
        .post('/transactions/earn')
        .set('Authorization', `Bearer ${businessToken}`)
        .send(earnDto)
        .expect(201);

      expect(response.body.pointsEarned).toBe(150);
      expect(response.body.newCustomerBalance).toBe(1150);

      // Verify db state
      const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
      expect(updatedUser.pointsBalance).toBe(1150);

      const updatedBusiness = await prisma.business.findUnique({ where: { id: testBusiness.id } });
      expect(updatedBusiness.pointsBalance).toBe(5000 - 150);
    });
  });

  describe('/POST transactions/redeem', () => {
    it('should fail without a valid token', () => {
      return request(app.getHttpServer()).post('/transactions/redeem').expect(401);
    });

    it('should successfully redeem points for a customer', async () => {
      const redeemDto = { businessId: testBusiness.id, pointsToRedeem: 100, ticketTotal: 50 };

      const response = await request(app.getHttpServer())
        .post('/transactions/redeem')
        .set('Authorization', `Bearer ${userToken}`)
        .send(redeemDto)
        .expect(201);

      expect(response.body.pointsRedeemed).toBe(100);
      expect(response.body.newCustomerBalance).toBe(1050);

      // Verify db state
      const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
      expect(updatedUser.pointsBalance).toBe(1050);

      const updatedBusiness = await prisma.business.findUnique({ where: { id: testBusiness.id } });
      expect(updatedBusiness.pointsBalance).toBe(4850 + 100);
    });

    it('should fail if redemption exceeds 30% of ticket total', () => {
        const redeemDto = { businessId: testBusiness.id, pointsToRedeem: 100, ticketTotal: 9 }; // 100 * 0.03 = 3. 30% of 9 is 2.7
  
        return request(app.getHttpServer())
          .post('/transactions/redeem')
          .set('Authorization', `Bearer ${userToken}`)
          .send(redeemDto)
          .expect(400);
      });
  });
});
