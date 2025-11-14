import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infrastructure/prisma.service';
import { AuthService } from 'src/modules/auth/auth.service';

describe('Ledger Endpoints (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let transactionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);

    // Clean up database
    await prisma.pointLedger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await prisma.business.deleteMany();

    // Create users and business
    const user = await prisma.user.create({
      data: {
        email: 'ledger-user@test.com',
        name: 'Ledger User',
        role: 'client',
        password: 'password123',
      },
    });
    const admin = await prisma.user.create({
      data: {
        email: 'ledger-admin@test.com',
        name: 'Ledger Admin',
        role: 'admin',
        password: 'password123',
      },
    });
    const businessOwner = await prisma.user.create({
      data: {
        email: 'ledger-biz@test.com',
        name: 'Ledger Biz',
        role: 'business',
        password: 'password123',
      },
    });
    const business = await prisma.business.create({
      data: {
        name: 'Ledger Test Business',
        ownerId: businessOwner.id,
        pointsBalance: 10000,
      },
    });

    userId = user.id;
    const userLogin = await authService.login(user);
    userToken = userLogin.accessToken;
    const adminLogin = await authService.login(admin);
    adminToken = adminLogin.accessToken;

    // Create a transaction to generate ledger entries
    const response = await request(app.getHttpServer())
      .post('/api/transactions/earn')
      .set('Authorization', `Bearer ${adminToken}`) // Use admin to act on behalf of business
      .send({
        customerId: user.id,
        businessId: business.id,
        purchaseAmount: 100,
      });
    
    transactionId = response.body.transactionId;
  });

  afterAll(async () => {
    await prisma.pointLedger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await prisma.business.deleteMany();
    await app.close();
  });

  describe('GET /api/ledger/entries', () => {
    it('should return user ledger entries when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/ledger/entries')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.entries).toBeDefined();
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.entries[0].accountId).toBe(userId);
    });

    it('should filter by accountId if user is admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/ledger/entries?accountId=${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.entries.length).toBeGreaterThan(0);
      response.body.entries.forEach((entry) => {
        expect(entry.accountId).toBe(userId);
      });
    });

    it('should reject query for other user accountId if not admin', async () => {
      await request(app.getHttpServer())
        .get(`/api/ledger/entries?accountId=other-user`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401);
    });

    it('should filter by transactionId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/ledger/entries?transactionId=${transactionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.entries.length).toBeGreaterThan(0);
      response.body.entries.forEach((entry) => {
        expect(entry.transactionId).toBe(transactionId);
      });
    });

    it('should paginate results', async () => {
        // Create more entries for pagination test
        for (let i = 0; i < 10; i++) {
            await prisma.pointLedger.create({
                data: {
                    type: 'EARN',
                    accountId: userId,
                    credit: 1,
                    debit: 0,
                    balanceAfter: 101 + i,
                    transactionId: transactionId,
                }
            });
        }

      const response = await request(app.getHttpServer())
        .get(`/api/ledger/entries?accountId=${userId}&limit=5&offset=5`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.entries.length).toBe(5);
      expect(response.body.offset).toBe(5);
    });
  });

  describe('GET /api/ledger/entries/:id', () => {
    it('should return single entry when user owns it', async () => {
        const entry = await prisma.pointLedger.findFirst({ where: { accountId: userId } });
        const response = await request(app.getHttpServer())
            .get(`/api/ledger/entries/${entry.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(response.body.id).toBe(entry.id);
        expect(response.body.hash).toBeDefined();
    });

    it('should reject access to other user entry', async () => {
        const otherUser = await prisma.user.create({ data: { email: 'other@test.com', name: 'Other', password: 'password' } });
        const otherEntry = await prisma.pointLedger.create({
            data: {
                type: 'EARN',
                accountId: otherUser.id,
                credit: 10,
                debit: 0,
                balanceAfter: 10,
                transactionId: transactionId,
            }
        });

        await request(app.getHttpServer())
            .get(`/api/ledger/entries/${otherEntry.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(401);
    });
  });

  describe('GET /api/ledger/entries/:id/verify', () => {
    it('should verify a valid hash', async () => {
        const entry = await prisma.pointLedger.findFirst({ where: { accountId: userId } });
        const response = await request(app.getHttpServer())
            .get(`/api/ledger/entries/${entry.id}/verify`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(response.body.valid).toBe(true);
        expect(response.body.storedHash).toBe(response.body.computedHash);
        expect(response.body.message).toContain('passed');
    });

    it('should detect a tampered entry', async () => {
        const entry = await prisma.pointLedger.findFirst({ where: { accountId: userId } });
        
        // Tamper with the hash
        await prisma.pointLedger.update({
            where: { id: entry.id },
            data: { hash: 'tampered_hash' }
        });

        const response = await request(app.getHttpServer())
            .get(`/api/ledger/entries/${entry.id}/verify`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);

        expect(response.body.valid).toBe(false);
        expect(response.body.storedHash).toBe('tampered_hash');
        expect(response.body.computedHash).not.toBe('tampered_hash');
        expect(response.body.message).toContain('FAILED');

        // Restore hash for other tests
        await prisma.pointLedger.update({
            where: { id: entry.id },
            data: { hash: response.body.computedHash }
        });
    });
  });
});
