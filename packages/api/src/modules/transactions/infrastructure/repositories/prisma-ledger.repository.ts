import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import {
  ILedgerRepository,
  LedgerQueryFilters,
} from '../../domain/repositories/ledger.repository';
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

  /**
   * Unified query method supporting comprehensive filters:
   * - accountId, transactionId, date range, transaction type, amount range, and business search
   * - All filters use AND logic, except multiple types which use OR
   */
  async queryLedgerEntries(
    filters: LedgerQueryFilters,
  ): Promise<{
    entries: import('@prisma/client').PointLedger[];
    total: number;
  }> {
    const { limit = 50, offset = 0 } = filters;

    // Build where clause dynamically based on provided filters
    const where: any = {};

    // Account filter
    if (filters.accountId) {
      where.accountId = filters.accountId;
    }

    // Transaction ID filter
    if (filters.transactionId) {
      where.transactionId = filters.transactionId;
    }

    // Date range filter
    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    // Transaction type filter (OR logic for multiple types)
    if (filters.types && filters.types.length > 0) {
      where.type = {
        in: filters.types,
      };
    }

    // Amount range filter
    // Points can be in debit (negative transactions) or credit (positive transactions)
    // We need to check both fields based on the amount range
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      const amountConditions: any[] = [];

      // Handle case: only maxAmount specified (positive values)
      if (
        filters.maxAmount !== undefined &&
        filters.maxAmount >= 0 &&
        filters.minAmount === undefined
      ) {
        amountConditions.push({
          credit: {
            lte: filters.maxAmount,
          },
        });
      }
      // Handle case: only minAmount specified (positive values)
      else if (
        filters.minAmount !== undefined &&
        filters.minAmount >= 0 &&
        filters.maxAmount === undefined
      ) {
        amountConditions.push({
          credit: {
            gte: filters.minAmount,
          },
        });
      }
      // Handle case: both minAmount and maxAmount specified (positive values)
      else if (
        filters.minAmount !== undefined &&
        filters.maxAmount !== undefined &&
        filters.minAmount >= 0 &&
        filters.maxAmount >= 0
      ) {
        amountConditions.push({
          credit: {
            gte: filters.minAmount,
            lte: filters.maxAmount,
          },
        });
      }
      // Handle case: negative amounts (debits)
      else if (
        (filters.minAmount !== undefined && filters.minAmount < 0) ||
        (filters.maxAmount !== undefined && filters.maxAmount < 0)
      ) {
        const minDebit =
          filters.maxAmount !== undefined && filters.maxAmount < 0
            ? Math.abs(filters.maxAmount)
            : undefined;
        const maxDebit =
          filters.minAmount !== undefined && filters.minAmount < 0
            ? Math.abs(filters.minAmount)
            : undefined;

        const debitFilter: any = { debit: {} };
        if (minDebit !== undefined) {
          debitFilter.debit.gte = minDebit;
        }
        if (maxDebit !== undefined) {
          debitFilter.debit.lte = maxDebit;
        }
        amountConditions.push(debitFilter);
      }

      if (amountConditions.length > 0) {
        if (amountConditions.length === 1) {
          Object.assign(where, amountConditions[0]);
        } else {
          where.OR = amountConditions;
        }
      }
    }

    // Business search filter (case-insensitive partial match)
    // Search across transaction.business.name and transactionId
    if (filters.search) {
      where.OR = [
        {
          transaction: {
            business: {
              name: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
          },
        },
        {
          transactionId: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Execute query with pagination
    const [entries, total] = await this.prisma.$transaction([
      this.prisma.pointLedger.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit,
        skip: offset,
        include: {
          transaction: {
            include: {
              business: true,
            },
          },
        },
      }),
      this.prisma.pointLedger.count({
        where,
      }),
    ]);

    return { entries, total };
  }
}
