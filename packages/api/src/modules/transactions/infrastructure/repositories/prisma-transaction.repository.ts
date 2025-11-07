import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionType } from '@prisma/client';
import { EconomicControlService } from '../../application/services/economic-control.service';
import { TransactionEventPublisher } from '../../application/services/transaction-event.publisher';
import { TransactionCompletedEvent } from '../../domain/events/transaction-completed.event';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly economicControlService: EconomicControlService,
    private readonly eventPublisher: TransactionEventPublisher,
  ) {}

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const { customerId, businessId, pointsAmount, type, status, auditHash } =
      transactionData;

    if (!customerId || !businessId || !pointsAmount || !type || !status) {
      throw new BadRequestException(
        'Missing required transaction data',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let burnAmount = 0;
      if (type === TransactionType.REDEEM) {
        const feeRate = this.economicControlService.getBurnFeeRate();
        burnAmount = Math.floor(pointsAmount * feeRate);
      }

      // 1. Update business balance & get new balance
      const business = await tx.business.update({
        where: { id: businessId },
        data: {
          ...(type === TransactionType.EARN && {
            pointsBalance: { decrement: pointsAmount },
          }),
          ...(type === TransactionType.REDEEM && {
            pointsBalance: { increment: pointsAmount - burnAmount }, // Business gets points back minus burn amount
          }),
        },
      });

      // 2. Update customer balance & get new balance
      const customer = await tx.user.update({
        where: { id: customerId },
        data: {
          ...(type === TransactionType.EARN && {
            pointsBalance: { increment: pointsAmount },
          }),
          ...(type === TransactionType.REDEEM && {
            pointsBalance: { decrement: pointsAmount },
          }),
        },
      });

      // 3. Create the transaction record
      const finalPointsAmount = type === TransactionType.REDEEM ? -pointsAmount : pointsAmount;
      const transaction = await tx.transaction.create({
        data: {
          type,
          pointsAmount: finalPointsAmount,
          burnAmount: burnAmount > 0 ? burnAmount : null, // Store burn amount if applicable
          status,
          auditHash,
          businessId,
          customerId,
        },
      });

      // 4. Create ledger entries
      const ledgerEntries = [
        // Debit from the source
        {
          accountId: type === TransactionType.EARN ? businessId : customerId,
          debit: pointsAmount,
          credit: 0,
          balanceAfter:
            type === TransactionType.EARN
              ? business.pointsBalance
              : customer.pointsBalance,
          transactionId: transaction.id,
        },
        // Credit to the destination
        {
          accountId: type === TransactionType.EARN ? customerId : businessId,
          debit: 0,
          credit: pointsAmount - burnAmount, // Credit destination with points minus burn
          balanceAfter:
            type === TransactionType.EARN
              ? customer.pointsBalance
              : business.pointsBalance,
          transactionId: transaction.id,
        },
      ];

      // Add BURN ledger entry if applicable
      if (burnAmount > 0) {
        ledgerEntries.push({
          accountId: 'SYSTEM_BURN_ACCOUNT', // A special account for burned points
          debit: 0,
          credit: burnAmount,
          balanceAfter: 0, // Burned points are removed from circulation
          transactionId: transaction.id,
        });
      }

      await tx.pointLedger.createMany({
        data: ledgerEntries,
      });

      // Publish event after successful transaction
      this.eventPublisher.publishTransactionCompleted({ transaction });

      return transaction as Transaction;
    });
  }

  async redeem(transactionData: Partial<Transaction>): Promise<Transaction> {
    return this.create(transactionData);
  }
}
