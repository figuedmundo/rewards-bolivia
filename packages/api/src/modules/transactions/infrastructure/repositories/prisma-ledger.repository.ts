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
}
