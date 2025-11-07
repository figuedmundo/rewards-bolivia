import { Module } from '@nestjs/common';
import { TransactionsController } from './infrastructure/controllers/transactions.controller';
import { EarnPointsUseCase } from './application/earn-points.use-case';
import { RedeemPointsUseCase } from './application/redeem-points.use-case';
import { PrismaTransactionRepository } from './infrastructure/repositories/prisma-transaction.repository';
import { ITransactionRepository } from './domain/repositories/transaction.repository';
import { PrismaModule } from '../../infrastructure/prisma.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { EconomicControlService } from './application/services/economic-control.service';
import { TransactionEventPublisher } from './application/services/transaction-event.publisher';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [PrismaModule, RedisModule, EventEmitterModule.forRoot()],
  controllers: [TransactionsController],
  providers: [
    EarnPointsUseCase,
    RedeemPointsUseCase,
    EconomicControlService,
    TransactionEventPublisher,
    {
      provide: 'ITransactionRepository',
      useClass: PrismaTransactionRepository,
    },
  ],
})
export class TransactionsModule {}
