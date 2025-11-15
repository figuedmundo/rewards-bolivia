import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { ILedgerRepository } from '../../domain/repositories/ledger.repository';
import { LedgerEntryType } from '@prisma/client';

@Injectable()
export class PrismaLedgerRepository implements ILedgerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTotalPointsIssued(): Promise<number> {
    const result = await this.prisma.pointLedger.aggregate({
      _sum: {
        credit: true,
      },
      where: {
        type: LedgerEntryType.EARN,
      },
    });
    return result._sum.credit ?? 0;
  }

  async getTotalPointsRedeemed(): Promise<number> {
    const result = await this.prisma.pointLedger.aggregate({
      _sum: {
        debit: true,
      },
      where: {
        type: LedgerEntryType.REDEEM,
      },
    });
    return result._sum.debit ?? 0;
  }

  async getTotalPointsBurned(): Promise<number> {
    const result = await this.prisma.pointLedger.aggregate({
      _sum: {
        debit: true,
      },
      where: {
        type: LedgerEntryType.BURN,
      },
    });
    return result._sum.debit ?? 0;
  }

  async getPointsIssuedInLast30Days(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.pointLedger.aggregate({
      _sum: {
        credit: true,
      },
      where: {
        type: LedgerEntryType.EARN,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
    return result._sum.credit ?? 0;
  }

  async getPointsRedeemedInLast30Days(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.pointLedger.aggregate({
      _sum: {
        debit: true,
      },
      where: {
        type: LedgerEntryType.REDEEM,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
    return result._sum.debit ?? 0;
  }

  async getTransactionCountInLast30Days(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const count = await this.prisma.pointLedger.count({
      where: {
        type: {
          in: [LedgerEntryType.EARN, LedgerEntryType.REDEEM],
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
    return count;
  }

  async findLedgerEntriesByAccount(
    accountId: string,
    options: import('../../domain/repositories/ledger.repository').QueryOptions = {},
  ): Promise<{
    entries: import('@prisma/client').PointLedger[];
    total: number;
  }> {
    const { limit = 50, offset = 0 } = options;

    const [entries, total] = await this.prisma.$transaction([
      this.prisma.pointLedger.findMany({
        where: { accountId },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit,
        skip: offset,
      }),
      this.prisma.pointLedger.count({
        where: { accountId },
      }),
    ]);

    return { entries, total };
  }

  async findLedgerEntriesByTransaction(
    transactionId: string,
  ): Promise<import('@prisma/client').PointLedger[]> {
    return this.prisma.pointLedger.findMany({
      where: { transactionId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  async findLedgerEntriesByDateRange(
    startDate: Date,
    endDate: Date,
    options: import('../../domain/repositories/ledger.repository').QueryOptions = {},
  ): Promise<{
    entries: import('@prisma/client').PointLedger[];
    total: number;
  }> {
    const { limit = 50, offset = 0 } = options;

    const [entries, total] = await this.prisma.$transaction([
      this.prisma.pointLedger.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit,
        skip: offset,
      }),
      this.prisma.pointLedger.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      }),
    ]);

    return { entries, total };
  }

  async findLedgerEntryById(
    id: string,
  ): Promise<import('@prisma/client').PointLedger | null> {
    return this.prisma.pointLedger.findUnique({
      where: { id },
    });
  }
}
