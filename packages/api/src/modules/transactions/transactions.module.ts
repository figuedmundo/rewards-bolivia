import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TransactionsController } from './infrastructure/controllers/transactions.controller';
import { EmissionRateController } from './infrastructure/controllers/emission-rate.controller';
import { AuditController } from './infrastructure/controllers/audit.controller';
import { EarnPointsUseCase } from './application/earn-points.use-case';
import { RedeemPointsUseCase } from './application/redeem-points.use-case';
import { PrismaTransactionRepository } from './infrastructure/repositories/prisma-transaction.repository';
import { PrismaModule } from '../../infrastructure/prisma.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { EconomicControlService } from './application/services/economic-control.service';
import { EmissionRateAdjusterService } from './application/services/emission-rate-adjuster.service';
import { AuditHashService } from './application/services/audit-hash.service';
import { TransactionEventPublisher } from './application/services/transaction-event.publisher';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaLedgerRepository } from './infrastructure/repositories/prisma-ledger.repository';
import { TransactionCompletedSubscriber } from './application/subscribers/transaction-completed.subscriber';
import { CheckEmissionRatesJob } from './application/jobs/check-emission-rates.job';
import { GenerateDailyAuditHashJob } from './application/jobs/generate-daily-audit-hash.job';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    TransactionsController,
    EmissionRateController,
    AuditController,
  ],
  providers: [
    EarnPointsUseCase,
    RedeemPointsUseCase,
    EconomicControlService,
    EmissionRateAdjusterService,
    AuditHashService,
    TransactionEventPublisher,
    PrismaLedgerRepository,
    TransactionCompletedSubscriber,
    CheckEmissionRatesJob,
    GenerateDailyAuditHashJob,
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
