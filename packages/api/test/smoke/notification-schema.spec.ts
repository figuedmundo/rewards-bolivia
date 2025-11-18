import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/infrastructure/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import * as bcrypt from 'bcrypt';

describe('Notification Schema (Database Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clear test data before tests
    await prisma.$queryRaw`DELETE FROM "NotificationLog" WHERE "userId" LIKE 'test-notification%'`;
    await prisma.$queryRaw`DELETE FROM "User" WHERE "email" LIKE 'test-notification%'`;
  });

  afterAll(async () => {
    // Clean up test data after tests
    await prisma.$queryRaw`DELETE FROM "NotificationLog" WHERE "userId" LIKE 'test-notification%'`;
    await prisma.$queryRaw`DELETE FROM "User" WHERE "email" LIKE 'test-notification%'`;
    await app.close();
  });

  describe('NotificationLog Table', () => {
    it('should have NotificationLog table with correct columns', async () => {
      // Verify table exists by checking information_schema
      const tableResult: any[] = await prisma.$queryRaw`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'NotificationLog'
      `;

      expect(tableResult.length).toBe(1);
      expect(tableResult[0].table_name).toBe('NotificationLog');

      // Verify key columns exist
      const columnsResult: any[] = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'NotificationLog'
        ORDER BY ordinal_position
      `;

      const columnNames = columnsResult.map((c) => c.column_name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('userId');
      expect(columnNames).toContain('notificationType');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('sentAt');
      expect(columnNames).toContain('failureReason');
      expect(columnNames).toContain('expirationDate');
      expect(columnNames).toContain('pointsExpiring');
      expect(columnNames).toContain('createdAt');
    });

    it('should have NotificationLog indexes for efficient querying', async () => {
      // Verify composite index on (userId, notificationType, expirationDate)
      const indexResult: any[] = await prisma.$queryRaw`
        SELECT indexname FROM pg_indexes
        WHERE tablename = 'NotificationLog'
      `;

      const indexNames = indexResult.map((i) => i.indexname);

      // Should have the composite index
      const hasCompositeIndex = indexNames.some(
        (idx) =>
          idx.includes('userId') &&
          idx.includes('notificationType') &&
          idx.includes('expirationDate'),
      );
      expect(hasCompositeIndex).toBe(true);

      // Should have the status index
      const hasStatusIndex = indexNames.some(
        (idx) => idx.includes('status') && idx.includes('createdAt'),
      );
      expect(hasStatusIndex).toBe(true);
    });
  });

  describe('User Model - emailNotifications field', () => {
    it('should have emailNotifications column on User table with default value true', async () => {
      // Verify column exists
      const columnsResult: any[] = await prisma.$queryRaw`
        SELECT column_name, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'User' AND column_name = 'emailNotifications'
      `;

      expect(columnsResult.length).toBe(1);
      expect(columnsResult[0].column_name).toBe('emailNotifications');
      expect(columnsResult[0].is_nullable).toBe('NO');

      // The default should be true (PostgreSQL represents as true)
      expect(columnsResult[0].column_default).toBeDefined();
    });

    it('should insert User with emailNotifications defaulting to true', async () => {
      const userId = createId();
      const email = 'test-notification-default@example.com';
      const now = new Date();

      // Insert user without specifying emailNotifications (using defaults)
      await prisma.$queryRaw`
        INSERT INTO "User" (id, email, "passwordHash", "createdAt", "updatedAt", role, provider)
        VALUES (${userId}, ${email}, ${bcrypt.hashSync('password', 10)}, ${now}, ${now}, 'client', 'local')
      `;

      // Verify it defaults to true
      const userResult: any[] = await prisma.$queryRaw`
        SELECT "emailNotifications" FROM "User" WHERE id = ${userId}
      `;

      expect(userResult.length).toBe(1);
      expect(userResult[0].emailNotifications).toBe(true);
    });
  });

  describe('PointLedger Model - expiresAt field and indexes', () => {
    it('should have expiresAt field on PointLedger table', async () => {
      // Verify column exists
      const columnsResult: any[] = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'PointLedger' AND column_name = 'expiresAt'
      `;

      expect(columnsResult.length).toBe(1);
      expect(columnsResult[0].column_name).toBe('expiresAt');
      // Should be nullable (optional DateTime?)
      expect(columnsResult[0].is_nullable).toBe('YES');
    });

    it('should have PointLedger indexes for expiration queries', async () => {
      const indexResult: any[] = await prisma.$queryRaw`
        SELECT indexname FROM pg_indexes
        WHERE tablename = 'PointLedger'
      `;

      const indexNames = indexResult.map((i) => i.indexname);

      // Should have index on expiresAt
      expect(indexNames.some((idx) => idx.includes('expiresAt'))).toBe(true);

      // Should have composite index on (expiresAt, credit)
      const hasExpiresAtCreditIndex = indexNames.some((idx) =>
        idx.includes('expiresAt') && idx.includes('credit'),
      );
      expect(hasExpiresAtCreditIndex).toBe(true);

      // Should have composite index on (accountId, expiresAt)
      const hasAccountIdExpiresAtIndex = indexNames.some((idx) =>
        idx.includes('accountId') && idx.includes('expiresAt'),
      );
      expect(hasAccountIdExpiresAtIndex).toBe(true);
    });
  });
});
