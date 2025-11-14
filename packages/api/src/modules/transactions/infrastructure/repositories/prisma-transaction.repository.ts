import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionType, LedgerEntryType } from '@prisma/client';
import { TransactionEventPublisher } from '../../application/services/transaction-event.publisher';
import { LedgerCreationHelper } from '../../application/services/ledger-services/ledger-creation.helper';

import { RedisService } from '../../../../infrastructure/redis/redis.service';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  private readonly logger = new Logger(PrismaTransactionRepository.name);
  private readonly CACHE_TTL = 300; // 5 minutes in seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: TransactionEventPublisher,
    private readonly redisService: RedisService,
    private readonly ledgerCreationHelper: LedgerCreationHelper,
  ) {}

  /**
   * Cache helper methods for cache-aside pattern
   */
  private getCustomerBalanceKey(customerId: string): string {
    return `customer:${customerId}:balance`;
  }

  private getBusinessBalanceKey(businessId: string): string {
    return `business:${businessId}:balance`;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  private async getCachedBalance(key: string): Promise<number | null> {
    try {
      const cached = await this.redisService.get(key);
      return cached ? parseInt(cached, 10) : null;
    } catch (error) {
      this.logger.warn(
        `Cache read failed for key ${key}: ${this.getErrorMessage(error)}`,
      );
      return null;
    }
  }

  private async setCachedBalance(key: string, balance: number): Promise<void> {
    try {
      await this.redisService.set(key, balance.toString(), this.CACHE_TTL);
    } catch (error) {
      this.logger.warn(
        `Cache write failed for key ${key}: ${this.getErrorMessage(error)}`,
      );
      // Non-critical error, continue without cache
    }
  }

  private async invalidateBalanceCache(
    customerId: string,
    businessId: string,
  ): Promise<void> {
    try {
      await this.redisService.del(this.getCustomerBalanceKey(customerId));
      await this.redisService.del(this.getBusinessBalanceKey(businessId));
    } catch (error) {
      this.logger.warn(
        `Cache invalidation failed: ${this.getErrorMessage(error)}`,
      );
    }
  }

  async create(
    transactionData: Partial<Transaction>,
    burnAmount = 0,
  ): Promise<Transaction> {
    const { customerId, businessId, pointsAmount, type, status, auditHash } =
      transactionData;

    if (!customerId || !businessId || !pointsAmount || !type || !status) {
      throw new BadRequestException('Missing required transaction data');
    }

    // Check cache first for balances (cache-aside pattern)
    const customerBalanceKey = this.getCustomerBalanceKey(customerId);
    const businessBalanceKey = this.getBusinessBalanceKey(businessId);

    let transaction: Transaction;

    // Execute transaction with proper isolation
    try {
      transaction = await this.prisma.$transaction(
        async (tx) => {
          // 1. Update business balance
          const businessUpdateData = {};
          if (type === TransactionType.EARN) {
            businessUpdateData['pointsBalance'] = { decrement: pointsAmount };
          } else if (type === TransactionType.REDEEM) {
            businessUpdateData['pointsBalance'] = {
              increment: pointsAmount - burnAmount,
            };
          }
          const business = await tx.business.update({
            where: { id: businessId },
            data: businessUpdateData,
          });

          // 2. Update customer balance
          const customerUpdateData = {};
          if (type === TransactionType.EARN) {
            customerUpdateData['pointsBalance'] = { increment: pointsAmount };
          } else if (type === TransactionType.REDEEM) {
            customerUpdateData['pointsBalance'] = { decrement: pointsAmount };
          }
          const customer = await tx.user.update({
            where: { id: customerId },
            data: customerUpdateData,
          });

          // 3. Create the transaction record
          const finalPointsAmount =
            type === TransactionType.REDEEM ? -pointsAmount : pointsAmount;
          const dbTransaction = await tx.transaction.create({
            data: {
              type,
              pointsAmount: finalPointsAmount,
              burnAmount: type === TransactionType.REDEEM ? burnAmount : null, // Store burn amount if applicable
              status,
              auditHash,
              businessId,
              customerId,
            },
          });

          // 4. Create ledger entries using the helper
          const ledgerEntries = [];

          // Debit from the source
          const sourceEntry = await this.ledgerCreationHelper.createLedgerEntry(
            {
              type:
                type === TransactionType.EARN
                  ? LedgerEntryType.EARN
                  : LedgerEntryType.REDEEM,
              accountId:
                type === TransactionType.EARN ? businessId : customerId,
              debit: pointsAmount,
              credit: 0,
              balanceAfter:
                type === TransactionType.EARN
                  ? business.pointsBalance
                  : customer.pointsBalance,
              transaction: { connect: { id: dbTransaction.id } },
            },
            tx,
          );
          ledgerEntries.push(sourceEntry);

          // Credit to the destination
          const destEntry = await this.ledgerCreationHelper.createLedgerEntry(
            {
              type:
                type === TransactionType.EARN
                  ? LedgerEntryType.EARN
                  : LedgerEntryType.REDEEM,
              accountId:
                type === TransactionType.EARN ? customerId : businessId,
              debit: 0,
              credit: pointsAmount - burnAmount, // Credit destination with points minus burn
              balanceAfter:
                type === TransactionType.EARN
                  ? customer.pointsBalance
                  : business.pointsBalance,
              transaction: { connect: { id: dbTransaction.id } },
            },
            tx,
          );
          ledgerEntries.push(destEntry);

          // Add BURN ledger entry if applicable
          if (type === TransactionType.REDEEM && burnAmount > 0) {
            const burnEntry = await this.ledgerCreationHelper.createLedgerEntry(
              {
                type: LedgerEntryType.BURN,
                accountId: businessId,
                debit: burnAmount,
                credit: 0,
                balanceAfter: business.pointsBalance, // Final correct balance
                reason: 'OPERATIONAL_FEE',
                transaction: { connect: { id: dbTransaction.id } },
              },
              tx,
            );
            ledgerEntries.push(burnEntry);
          }

          // Cache new balances after successful transaction
          await this.setCachedBalance(
            customerBalanceKey,
            customer.pointsBalance,
          );
          await this.setCachedBalance(
            businessBalanceKey,
            business.pointsBalance,
          );

          // Return transaction entity
          return {
            ...dbTransaction,
            ledgerEntries,
          } as Transaction;
        },
        {
          isolationLevel: 'Serializable', // Highest isolation for financial transactions
        },
      );

      // Publish event AFTER transaction commits (outside transaction boundary)
      this.eventPublisher.publishTransactionCompleted({ transaction });

      this.logger.log(`Transaction ${transaction.id} completed successfully`);
      return transaction;
    } catch (error) {
      this.logger.error(`Transaction failed: ${this.getErrorMessage(error)}`);

      // Invalidate cache on failure to prevent stale data
      await this.invalidateBalanceCache(customerId, businessId);

      throw new InternalServerErrorException(
        `Transaction failed: ${this.getErrorMessage(error)}`,
      );
    }
  }

  async redeem(
    transactionData: Partial<Transaction>,
    burnAmount = 0,
  ): Promise<Transaction> {
    return this.create(transactionData, burnAmount);
  }
}
