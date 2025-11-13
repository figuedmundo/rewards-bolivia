import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmissionRateAdjusterService } from '../services/emission-rate-adjuster.service';

@Injectable()
export class CheckEmissionRatesJob {
  private readonly logger = new Logger(CheckEmissionRatesJob.name);

  constructor(
    private readonly emissionRateAdjusterService: EmissionRateAdjusterService,
  ) {}

  /**
   * Run daily at 2 AM to check emission rates and generate recommendations
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCron() {
    this.logger.log('Starting scheduled emission rate check...');

    try {
      const recommendation =
        await this.emissionRateAdjusterService.generateRecommendationIfNeeded();

      if (recommendation) {
        this.logger.warn(
          `New emission rate recommendation created: ${recommendation.id}`,
        );
      } else {
        this.logger.log('No recommendation needed at this time');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to check emission rates: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    this.logger.log('Emission rate check complete');
  }
}
