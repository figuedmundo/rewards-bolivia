import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionType } from '@prisma/client';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const { customerId, businessId, pointsAmount, type, status, auditHash } = transactionData;

    if (!customerId || !businessId || !pointsAmount || !type || !status) {
      throw new InternalServerErrorException('Missing required transaction data');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update business balance & get new balance
      const business = await tx.business.update({
        where: { id: businessId },
        data: {
          pointsBalance: {
            decrement: type === TransactionType.EARN ? pointsAmount : 0,
            increment: type === TransactionType.REDEEM ? pointsAmount : 0,
          },
        },
      });

      // 2. Update customer balance & get new balance
      const customer = await tx.user.update({
        where: { id: customerId },
        data: {
          pointsBalance: {
            increment: type === TransactionType.EARN ? pointsAmount : 0,
            decrement: type === TransactionType.REDEEM ? pointsAmount : 0,
          },
        },
      });

      // 3. Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          type,
          pointsAmount,
          status,
          auditHash,
          businessId,
          customerId,
        },
      });

      // 4. Create ledger entries
      await tx.pointLedger.createMany({
        data: [
          // Debit from the source
          {
            accountId: type === TransactionType.EARN ? businessId : customerId,
            debit: pointsAmount,
            credit: 0,
            balanceAfter: type === TransactionType.EARN ? business.pointsBalance : customer.pointsBalance,
            transactionId: transaction.id,
          },
          // Credit to the destination
          {
            accountId: type === TransactionType.EARN ? customerId : businessId,
            debit: 0,
            credit: pointsAmount,
            balanceAfter: type === TransactionType.EARN ? customer.pointsBalance : business.pointsBalance,
            transactionId: transaction.id,
          },
        ],
      });

      return transaction as Transaction;
    });
  }

  async redeem(transactionData: Partial<Transaction>): Promise<Transaction> {
    return this.create(transactionData);
  }
}
