import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from '../../infrastructure/prisma.module';

// Controllers
import { NotificationPreferencesController } from './infrastructure/controllers/notification-preferences.controller';

// Services
import { EmailService } from './application/services/email.service';
import { NotificationBuilderService } from './application/services/notification-builder.service';
import { ExpirationNotificationService } from './application/services/expiration-notification.service';
import { NotificationConfigService } from './application/services/notification-config.service';

// Use Cases
import { SendExpirationNotificationUseCase } from './application/use-cases/send-expiration-notification.use-case';

// Jobs
import { CheckExpiringPointsJob } from './application/jobs/check-expiring-points.job';

// Repositories
import { PrismaNotificationRepository } from './infrastructure/repositories/prisma-notification.repository';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), EventEmitterModule.forRoot()],
  controllers: [NotificationPreferencesController],
  providers: [
    // Configuration
    NotificationConfigService,
    // Services
    EmailService,
    NotificationBuilderService,
    ExpirationNotificationService,
    // Use Cases
    SendExpirationNotificationUseCase,
    // Jobs
    CheckExpiringPointsJob,
    // Repositories with DI tokens
    {
      provide: 'INotificationRepository',
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [
    ExpirationNotificationService,
    EmailService,
    SendExpirationNotificationUseCase,
    NotificationConfigService,
  ],
})
export class NotificationsModule {}
