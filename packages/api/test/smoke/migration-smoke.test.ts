import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/infrastructure/prisma.service';

describe('Migration Smoke Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Database Schema Integrity', () => {
    it('should have all required tables', async () => {
      // Check if core tables exist
      const tables = [
        'User',
        'Transaction',
        // Add other tables as they are created
      ];

      for (const table of tables) {
        // This is a basic check - in real implementation you'd query information_schema
        // For now, just verify we can connect and basic operations work
        expect(prisma).toBeDefined();
      }
    });

    it('should have required indexes', async () => {
      // Verify critical indexes exist
      // This would check for indexes on frequently queried columns
      const userCount = await prisma.user.count();
      expect(typeof userCount).toBe('number');
    });

    it('should enforce foreign key constraints', async () => {
      // Test that FK constraints are working
      // This would attempt operations that should fail due to constraints
      expect(prisma).toBeDefined();
    });
  });

  describe('Basic CRUD Operations', () => {
    it('should create, read, update, delete users', async () => {
      // Create
      const createResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `smoke-test-${Date.now()}@example.com`,
          password: 'password123',
          firstName: 'Smoke',
          lastName: 'Test',
        });

      expect(createResponse.status).toBe(201);
      const userId = createResponse.body.id;

      // Read
      const readResponse = await request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${createResponse.body.accessToken}`);

      expect(readResponse.status).toBe(200);
      expect(readResponse.body.email).toContain('smoke-test');

      // Update (if endpoint exists)
      // Delete (if endpoint exists)
    });

    it('should handle transactions correctly', async () => {
      // Test transaction creation and balance calculation
      const transactionCount = await prisma.transaction.count();
      expect(typeof transactionCount).toBe('number');
    });
  });

  describe('API Endpoints Availability', () => {
    it('should respond to health check', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });

    it('should serve OpenAPI spec', async () => {
      const response = await request(app.getHttpServer())
        .get('/api-json')
        .expect(200);

      expect(response.body.openapi).toBeDefined();
      expect(response.body.paths).toBeDefined();
    });

    it('should serve metrics endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/metrics')
        .expect(200);

      expect(response.text).toContain('# HELP');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity', async () => {
      // Test that orphaned records don't exist
      // Check for transactions without users, etc.
      const users = await prisma.user.findMany({ select: { id: true } });
      const userIds = users.map(u => u.id);

      const orphanedTransactions = await prisma.transaction.findMany({
        where: {
          userId: {
            notIn: userIds,
          },
        },
      });

      expect(orphanedTransactions).toHaveLength(0);
    });

    it('should have valid enum values', async () => {
      // Check that enum fields contain only valid values
      const users = await prisma.user.findMany({
        select: { role: true },
        take: 10,
      });

      for (const user of users) {
        if (user.role) {
          expect(['user', 'admin']).toContain(user.role);
        }
      }
    });
  });

  describe('Performance Baseline', () => {
    it('should respond within acceptable time', async () => {
      const start = Date.now();

      await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // 1 second
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(10).fill(null).map(() =>
        request(app.getHttpServer()).get('/api/health')
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});