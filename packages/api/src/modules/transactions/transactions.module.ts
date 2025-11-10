import { Module } from '@nestjs/common';
import { TransactionsController } from './infrastructure/controllers/transactions.controller';
import { EarnPointsUseCase } from './application/earn-points.use-case';
import { RedeemPointsUseCase } from './application/redeem-points.use-case';
import { PrismaTransactionRepository } from './infrastructure/repositories/prisma-transaction.repository';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ITransactionRepository } from './domain/repositories/transaction.repository';
import { PrismaModule } from '../../infrastructure/prisma.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { EconomicControlService } from './application/services/economic-control.service';
import { TransactionEventPublisher } from './application/services/transaction-event.publisher';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ILedgerRepository } from './domain/repositories/ledger.repository';
import { PrismaLedgerRepository } from './infrastructure/repositories/prisma-ledger.repository';

@Module({
  imports: [PrismaModule, RedisModule, EventEmitterModule.forRoot()],
  controllers: [TransactionsController],
  providers: [
    EarnPointsUseCase,
    RedeemPointsUseCase,
    EconomicControlService,
    TransactionEventPublisher,
    PrismaLedgerRepository,
    {
      provide: 'ITransactionRepository',
      useClass: PrismaTransactionRepository,
    },
    {
      provide: 'ILedgerRepository',
      useClass: PrismaLedgerRepository,
    },
  ],
})
export class TransactionsModule {}
