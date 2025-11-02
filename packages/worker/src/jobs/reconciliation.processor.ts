import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '@rewards-bolivia/logger';
import { ReconciliationJobData, JobResult } from '../types/job.types';
import { queueConfig } from '../queues/queue.config';

export class ReconciliationProcessor {
  private prisma: PrismaClient;
  private logger: LoggerService;

  constructor() {
    this.prisma = new PrismaClient();
    this.logger = new LoggerService('ReconciliationWorker');
  }

  async process(job: Job<ReconciliationJobData>): Promise<JobResult> {
    const { userId, transactionId, consolidationType, correlationId } = job.data;

    try {
      this.logger.log(`Starting reconciliation for user ${userId}`, {
        correlationId,
        consolidationType,
        transactionId,
      });

      // Calculate user's current balance from transactions
      const balance = await this.calculateUserBalance(userId);

      // Check for discrepancies with on-chain data (placeholder)
      const onChainBalance = await this.getOnChainBalance(userId);

      if (Math.abs(balance - onChainBalance) > 0.01) { // Allow for small floating point differences
        this.logger.warn(`Balance discrepancy detected for user ${userId}`, {
          correlationId,
          offChainBalance: balance,
          onChainBalance,
          difference: balance - onChainBalance,
        });

        // Trigger reconciliation action
        await this.performReconciliation(userId, balance, onChainBalance, correlationId);
      } else {
        this.logger.log(`Balances match for user ${userId}`, { correlationId });
      }

      return {
        success: true,
        message: 'Reconciliation completed successfully',
        data: { userId, balance, onChainBalance },
      };
    } catch (error) {
      this.logger.error(`Reconciliation failed for user ${userId}`, {
        correlationId,
        error: error.message,
        stack: error.stack,
      });

      throw error;
    }
  }

  private async calculateUserBalance(userId: string): Promise<number> {
    // This would calculate balance from transaction history
    // Placeholder implementation
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
    });

    return transactions.reduce((balance, tx) => {
      return tx.type === 'credit' ? balance + tx.amount : balance - tx.amount;
    }, 0);
  }

  private async getOnChainBalance(userId: string): Promise<number> {
    // Placeholder for on-chain balance retrieval
    // In real implementation, this would query blockchain/smart contract
    this.logger.log(`Retrieving on-chain balance for user ${userId}`);

    // Mock implementation - replace with actual blockchain integration
    return 0; // Placeholder
  }

  private async performReconciliation(
    userId: string,
    offChainBalance: number,
    onChainBalance: number,
    correlationId: string
  ): Promise<void> {
    // Create reconciliation record
    await this.prisma.reconciliation.create({
      data: {
        userId,
        offChainBalance,
        onChainBalance,
        difference: offChainBalance - onChainBalance,
        status: 'pending',
        correlationId,
      },
    });

    // TODO: Trigger on-chain consolidation transaction
    this.logger.log(`Reconciliation record created for user ${userId}`, { correlationId });
  }
}

export const createReconciliationWorker = () => {
  const processor = new ReconciliationProcessor();

  const worker = new Worker(
    'reconciliation',
    async (job) => processor.process(job),
    queueConfig
  );

  worker.on('completed', (job) => {
    processor['logger'].log(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    processor['logger'].error(`Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
};