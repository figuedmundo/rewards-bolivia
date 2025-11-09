import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infrastructure/prisma.service';
import { User } from '@prisma/client';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

describe('Migration Smoke Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientUser: User;
  let businessUser: User;
  let business: any;
  let clientToken: string;
  let businessToken: string;
  let document: OpenAPIObject;

  beforeAll(async () => {
    // Set required environment variables for Google OAuth
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_CALLBACK_URL = 'http://localhost:3000/auth/google/callback';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = app.get(PrismaService);

    const config = new DocumentBuilder()
      .setTitle('Rewards Bolivia API')
      .setDescription('The Rewards Bolivia API description')
      .setVersion('1.0')
      .build();
    document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // Add OpenAPI JSON endpoint for SDK generation
    app.getHttpAdapter().get('/docs-json', (req, res) => {
      res.json(document);
    });

    // Create users for tests
    const clientEmail = `client-${Date.now()}@example.com`;
    const businessEmail = `business-${Date.now()}@example.com`;

    const clientResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: clientEmail, password: 'password', name: 'Client User' });
    clientUser = clientResponse.body.user;
    clientToken = clientResponse.body.accessToken;

    const businessResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: businessEmail, password: 'password', name: 'Business User', role: 'business' });
    businessUser = businessResponse.body.user;
    businessToken = businessResponse.body.accessToken;

    // Create a business for the business user
    business = await prisma.business.create({
      data: {
        name: 'Smoke Test Business',
        ownerId: businessUser.id,
      },
    });
  });

  afterAll(async () => {
    // Clean up created test data
    await prisma.pointLedger.deleteMany({ where: {} });
    await prisma.transaction.deleteMany({ where: {} });
    await prisma.user.deleteMany({ where: { email: { contains: '@example.com' } } });
    await prisma.business.deleteMany({ where: { ownerId: businessUser.id } });
    await app.close();
  });

  describe('Database Schema Integrity', () => {
    it('should have all required tables', async () => {
      const expectedTables = ['User', 'Business', 'RefreshToken', 'Transaction', 'PointLedger', '_prisma_migrations'];
      const result: any[] = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
      const tableNames = result.map(r => r.tablename);
      for (const table of expectedTables) {
        // Prisma table names are case-sensitive in the client, but table names in postgres are often lowercase.
        // We will check for both cases.
        const found = tableNames.includes(table) || tableNames.includes(table.toLowerCase());
        expect(found).toBe(true);
      }
    });

    it('should have correct columns for User table', async () => {
        const columns: any[] = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'User'`;
      
      const columnMap = new Map(columns.map(c => [c.column_name, c]));

      expect(columnMap.has('id')).toBe(true);
      expect(columnMap.has('email')).toBe(true);
      expect(columnMap.has('pointsBalance')).toBe(true);
      expect(columnMap.has('role')).toBe(true);
    });

    it('should have required indexes', async () => {
        const expectedIndexes = [
            'User_email_key',
            'User_provider_providerId_key',
            'Business_ownerId_idx',
            'RefreshToken_token_key',
            'RefreshToken_userId_idx',
            'Transaction_auditHash_key',
            'Transaction_businessId_idx',
            'Transaction_customerId_idx',
            'PointLedger_accountId_idx',
        ];
        const result: any[] = await prisma.$queryRaw`SELECT indexname FROM pg_indexes WHERE schemaname = 'public'`;
        const indexNames = result.map(i => i.indexname);

        for (const index of expectedIndexes) {
            expect(indexNames).toContain(index);
        }
    });
  });

  describe('Data Consistency', () => {
    it('should have valid enum values for User role', async () => {
      const users = await prisma.user.findMany({ select: { role: true }, take: 10 });
      for (const user of users) {
        if (user.role) {
          expect(['client', 'business', 'admin']).toContain(user.role);
        }
      }
    });

    it('should have valid enum values for TransactionType', async () => {
        const transactions = await prisma.transaction.findMany({ select: { type: true }, take: 10 });
        for (const transaction of transactions) {
            expect(['EARN', 'REDEEM', 'ADJUSTMENT', 'BURN']).toContain(transaction.type);
        }
    });
  });

  describe('API Endpoints Availability', () => {
    it('should respond to metrics endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/metrics')
        .expect(200);

      expect(response.text).toContain('# HELP');
    });

    it('should serve OpenAPI spec', async () => {
      expect(document).toBeDefined();
      expect(document.openapi).toBeDefined();
    });
  });

  describe('Performance Baseline', () => {
    it('should respond within acceptable time', async () => {
      const start = Date.now();
      await request(app.getHttpServer()).get('/api/metrics').expect(200);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // 1 second
    });
  });

  describe('Basic CRUD Operations', () => {
    it('should create, read, update, and delete a user', async () => {
      // Create
      const email = `crud-test-${Date.now()}@example.com`;
      const createResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email, password: 'password', name: 'CRUD Test' });
      
      expect(createResponse.status).toBe(201);
      const user = createResponse.body.user;
      const token = createResponse.body.accessToken;

      // Read
      const readResponse = await request(app.getHttpServer())
        .get(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(readResponse.status).toBe(200);
      expect(readResponse.body.email).toBe(email);

      // Update
      const updateResponse = await request(app.getHttpServer())
        .patch(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'CRUD Test Updated' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('CRUD Test Updated');

      // Delete
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(deleteResponse.status).toBe(200);

      // Verify deletion
      const verifyResponse = await request(app.getHttpServer())
        .get(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(verifyResponse.status).toBe(404);

      // Verify that deleting a non-existent user returns a 404
      const deleteNonExistentResponse = await request(app.getHttpServer())
        .delete(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteNonExistentResponse.status).toBe(404);
    });
    
    it('should correctly handle EARN and REDEEM transactions', async () => {
      // Seed the business with points
      await prisma.business.update({
        where: { id: business.id },
        data: { pointsBalance: 1000 },
      });

      // 1. Earn points
      const earnResponse = await request(app.getHttpServer())
        .post('/api/transactions/earn')
        .set('Authorization', `Bearer ${businessToken}`)
        .send({
          customerId: clientUser.id,
          purchaseAmount: 100,
          businessId: business.id,
        });

      expect(earnResponse.status).toBe(201);
      expect(earnResponse.body.pointsEarned).toBe(100);

      // Verify balances
      let updatedClient = await prisma.user.findUnique({ where: { id: clientUser.id } });
      let updatedBusiness = await prisma.business.findUnique({ where: { id: business.id } });

      expect(updatedClient).not.toBeNull();
      expect(updatedBusiness).not.toBeNull();
      expect(updatedClient!.pointsBalance).toBe(100);
      expect(updatedBusiness!.pointsBalance).toBe(900);

      // 2. Redeem points
      const redeemResponse = await request(app.getHttpServer())
        .post('/api/transactions/redeem')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          businessId: business.id,
          pointsToRedeem: 50,
          ticketTotal: 200,
        });

      expect(redeemResponse.status).toBe(201);
      expect(redeemResponse.body.pointsRedeemed).toBe(50);

      // Verify final balances
      updatedClient = await prisma.user.findUnique({ where: { id: clientUser.id } });
      updatedBusiness = await prisma.business.findUnique({ where: { id: business.id } });

      expect(updatedClient).not.toBeNull();
      expect(updatedBusiness).not.toBeNull();
      expect(updatedClient!.pointsBalance).toBe(50);
      expect(updatedBusiness!.pointsBalance).toBe(950);
    });
  });
});
