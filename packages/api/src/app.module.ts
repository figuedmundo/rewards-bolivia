import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './modules/app/app.controller';
import { AppService } from './modules/app/app.service';
import { MetricsController } from './modules/app/metrics.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './infrastructure/prisma.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerMiddleware } from '@rewards-bolivia/logger';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { RedisModule } from './infrastructure/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
      }),
    }),
    PrismaModule, // Import the new global module
    AuthModule,
    UsersModule,
    TransactionsModule,
    RedisModule,
  ],
  controllers: [AppController, MetricsController],
  providers: [AppService], // Remove PrismaService from here
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
