import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@rewards-bolivia/logger';

/**
 * NotificationConfigService centralizes configuration management for the notifications module.
 * Loads settings from environment variables and provides typed accessors for other services.
 */
@Injectable()
export class NotificationConfigService {
  private readonly logger = new LoggerService('NotificationConfigService');

  constructor(private readonly configService: ConfigService) {
    this.logger.debug('Initializing NotificationConfigService');
  }

  /**
   * Get AWS SES configuration
   * @returns Object containing AWS SES configuration
   */
  getSESConfig(): {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    fromEmail: string;
  } {
    return {
      region: this.configService.get<string>('AWS_SES_REGION') || 'us-east-1',
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
      secretAccessKey:
        this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      fromEmail:
        this.configService.get<string>('AWS_SES_FROM_EMAIL') ||
        'noreply@rewards-bolivia.com',
    };
  }

  /**
   * Get the cron schedule for the notification job
   * @returns Cron expression (default: "0 9 * * *" for 9 AM UTC daily)
   */
  getCronSchedule(): string {
    return (
      this.configService.get<string>('NOTIFICATION_CRON_SCHEDULE') ||
      '0 9 * * *'
    );
  }

  /**
   * Get the batch size for processing notifications
   * @returns Batch size (default: 100)
   */
  getBatchSize(): number {
    return (
      this.configService.get<number>('NOTIFICATION_BATCH_SIZE') || 100
    );
  }

  /**
   * Get the rate limit for email sending
   * @returns Emails per second (default: 14)
   */
  getRateLimit(): number {
    return (
      this.configService.get<number>('NOTIFICATION_RATE_LIMIT') || 14
    );
  }

  /**
   * Get the frontend wallet URL for email CTAs
   * @returns Frontend wallet URL
   */
  getWalletUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_WALLET_URL') ||
      'http://localhost:5173/wallet'
    );
  }
}
