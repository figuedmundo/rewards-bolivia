/**
 * Test fixtures for notification feature testing
 * Provides helper functions to create realistic test data
 */

import { PrismaClient } from '@prisma/client';
import {
  NotificationLog,
  NotificationType,
  NotificationStatus,
} from '../domain/entities/notification-log.entity';

/**
 * Create a test user with specific email notification settings
 */
export async function createTestUser(
  prisma: PrismaClient,
  overrides?: {
    id?: string;
    email?: string;
    name?: string;
    emailNotifications?: boolean;
  },
) {
  const userData = {
    id: overrides?.id || `user-${Date.now()}`,
    email: overrides?.email || `test-${Date.now()}@example.com`,
    name: overrides?.name || 'Test User',
    emailNotifications: overrides?.emailNotifications ?? true,
    passwordHash: 'test-hash',
    pointsBalance: 1000,
  };

  return prisma.user.upsert({
    where: { id: userData.id },
    update: userData,
    create: userData,
  });
}

/**
 * Create a PointLedger entry with expiring points
 */
export async function createExpiringPointsLedgerEntry(
  prisma: PrismaClient,
  overrides?: {
    userId?: string;
    pointsExpiring?: number;
    daysUntilExpiration?: number;
    transactionId?: string;
  },
) {
  const now = new Date();
  const daysUntilExpiration = overrides?.daysUntilExpiration ?? 30;
  const expiresAt = new Date(
    now.getTime() + daysUntilExpiration * 24 * 60 * 60 * 1000,
  );

  const ledgerData = {
    id: `ledger-${Date.now()}`,
    accountId: overrides?.userId || `user-${Date.now()}`,
    type: 'CREDIT' as const,
    debit: 0,
    credit: overrides?.pointsExpiring ?? 100,
    balanceAfter: 1000 + (overrides?.pointsExpiring ?? 100),
    expiresAt,
    transactionId: overrides?.transactionId || `txn-${Date.now()}`,
    createdAt: new Date(),
  };

  return prisma.pointLedger.create({
    data: ledgerData,
  });
}

/**
 * Create multiple PointLedger entries for batch testing
 */
export async function createBatchExpiringPointsLedger(
  prisma: PrismaClient,
  count: number,
  overrides?: {
    daysUntilExpiration?: number;
    pointsPerEntry?: number;
  },
) {
  const entries = [];
  const now = new Date();
  const daysUntilExpiration = overrides?.daysUntilExpiration ?? 30;
  const expiresAt = new Date(
    now.getTime() + daysUntilExpiration * 24 * 60 * 60 * 1000,
  );

  for (let i = 0; i < count; i++) {
    entries.push({
      id: `ledger-batch-${Date.now()}-${i}`,
      accountId: `user-batch-${Date.now()}-${i}`,
      type: 'CREDIT' as const,
      debit: 0,
      credit: overrides?.pointsPerEntry ?? 100,
      balanceAfter: 1000 + (overrides?.pointsPerEntry ?? 100),
      expiresAt,
      transactionId: `txn-batch-${Date.now()}-${i}`,
      createdAt: new Date(),
    });
  }

  return prisma.pointLedger.createMany({
    data: entries,
    skipDuplicates: true,
  });
}

/**
 * Create a NotificationLog entry
 */
export async function createNotificationLogEntry(
  prisma: PrismaClient,
  overrides?: {
    userId?: string;
    notificationType?: NotificationType;
    status?: NotificationStatus;
    failureReason?: string | null;
    pointsExpiring?: number;
    daysUntilExpiration?: number;
  },
) {
  const now = new Date();
  const daysUntilExpiration = overrides?.daysUntilExpiration ?? 30;
  const expiresAt = new Date(
    now.getTime() + daysUntilExpiration * 24 * 60 * 60 * 1000,
  );

  return prisma.notificationLog.create({
    data: {
      id: `notif-${Date.now()}`,
      userId: overrides?.userId || `user-${Date.now()}`,
      notificationType:
        overrides?.notificationType || NotificationType.EXPIRATION_30_DAYS,
      status: overrides?.status || NotificationStatus.SENT,
      sentAt: overrides?.status === NotificationStatus.SENT ? new Date() : null,
      failureReason: overrides?.failureReason ?? null,
      expirationDate: expiresAt,
      pointsExpiring: overrides?.pointsExpiring ?? 100,
    },
  });
}

/**
 * Clear all NotificationLog entries (for test isolation)
 */
export async function clearNotificationLogs(prisma: PrismaClient) {
  return prisma.notificationLog.deleteMany({});
}

/**
 * Clear all PointLedger entries for a specific user
 */
export async function clearUserPointsLedger(
  prisma: PrismaClient,
  userId: string,
) {
  return prisma.pointLedger.deleteMany({
    where: { accountId: userId },
  });
}

/**
 * Query notification history for a user
 */
export async function getUserNotificationHistory(
  prisma: PrismaClient,
  userId: string,
) {
  return prisma.notificationLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Check if a specific notification has been sent
 */
export async function hasNotificationBeenSent(
  prisma: PrismaClient,
  userId: string,
  notificationType: NotificationType,
  expirationDate: Date,
) {
  const entry = await prisma.notificationLog.findFirst({
    where: {
      userId,
      notificationType,
      expirationDate: {
        equals: expirationDate,
      },
      status: NotificationStatus.SENT,
    },
  });

  return !!entry;
}

/**
 * Get summary statistics for notifications in a time period
 */
export async function getNotificationStatistics(
  prisma: PrismaClient,
  startDate: Date,
  endDate: Date,
) {
  const logs = await prisma.notificationLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return {
    total: logs.length,
    sent: logs.filter((l) => l.status === NotificationStatus.SENT).length,
    failed: logs.filter((l) => l.status === NotificationStatus.FAILED).length,
    skipped: logs.filter((l) => l.status === NotificationStatus.SKIPPED)
      .length,
    byType: {
      [NotificationType.EXPIRATION_30_DAYS]: logs.filter(
        (l) => l.notificationType === NotificationType.EXPIRATION_30_DAYS,
      ).length,
      [NotificationType.EXPIRATION_7_DAYS]: logs.filter(
        (l) => l.notificationType === NotificationType.EXPIRATION_7_DAYS,
      ).length,
      [NotificationType.EXPIRATION_1_DAY]: logs.filter(
        (l) => l.notificationType === NotificationType.EXPIRATION_1_DAY,
      ).length,
    },
  };
}
