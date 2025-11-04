import { Module } from '@nestjs/common';
import { TransactionsController } from './infrastructure/controllers/transactions.controller';
import { EarnPointsUseCase } from './application/earn-points.use-case';
import { RedeemPointsUseCase } from './application/redeem-points.use-case';
import { PrismaTransactionRepository } from './infrastructure/repositories/prisma-transaction.repository';
import { ITransactionRepository } from './domain/repositories/transaction.repository';
import { PrismaModule } from '../../infrastructure/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TransactionsController],
  providers: [
    EarnPointsUseCase,
    RedeemPointsUseCase,
    {
      provide: 'ITransactionRepository',
      useClass: PrismaTransactionRepository,
    },
  ],
})
export class TransactionsModule {}
