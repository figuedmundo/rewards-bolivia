import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from 'eventemitter2';
import type { TransactionCompletedEvent } from '../../domain/events/transaction-completed.event';
import {
  EconomicControlService,
  EconomicStats,
} from '../services/economic-control.service';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { Prisma, TransactionType } from '@prisma/client';

interface CachedEconomicStats extends EconomicStats {
  lastUpdated: number;
}

@Injectable()
export class TransactionCompletedSubscriber {
  private readonly logger = new Logger(TransactionCompletedSubscriber.name);
  private readonly ALERT_THRESHOLD_ACTIVE_POINTS = 0.8; // 80%
  private readonly ALERT_THROTTLE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly economicControlService: EconomicControlService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('transaction.completed', { async: true })
  async handleTransactionCompleted(
    event: TransactionCompletedEvent,
  ): Promise<void> {
    try {
      this.logger.log(
        `Processing transaction.completed event for tx: ${event.transaction.id}`,
      );

      // Update real-time metrics cache
      const metrics = await this.updateRealTimeMetrics(event);

      // Check thresholds and trigger alerts if needed
      if (metrics) {
        await this.checkAndTriggerAlerts(metrics);
      }

      this.logger.log(
        `Successfully processed transaction.completed event for tx: ${event.transaction.id}`,
      );
    } catch (error) {
      // Never throw errors that could affect the main transaction flow
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to process transaction.completed event: ${errorMessage}`,
        errorStack,
      );
    }
  }

  private async updateRealTimeMetrics(
    event: TransactionCompletedEvent,
  ): Promise<CachedEconomicStats | null> {
    const metricsKey = 'economy:realtime:metrics';

    try {
      // Get current metrics from cache or calculate fresh
      let metrics = await this.getCachedMetrics(metricsKey);

      if (!metrics) {
        // Cache miss - calculate from database
        const freshMetrics =
          await this.economicControlService.getEconomicStats();
        metrics = {
          ...freshMetrics,
          lastUpdated: Date.now(),
        };
      }

      // Update metrics based on transaction type
      if (event.transaction.type === TransactionType.EARN) {
        metrics.totalPointsIssued += Math.abs(event.transaction.pointsAmount);
      } else if (event.transaction.type === TransactionType.REDEEM) {
        const pointsUsed = Math.abs(event.transaction.pointsAmount);
        metrics.totalPointsRedeemed += pointsUsed;

        // Add burn amount if present
        if (event.transaction.burnAmount && event.transaction.burnAmount > 0) {
          metrics.totalPointsBurned += event.transaction.burnAmount;
        }
      }

      // Recalculate derived metrics
      const activePoints =
        metrics.totalPointsIssued - metrics.totalPointsBurned;
      metrics.activePointsPercentage =
        metrics.totalPointsIssued > 0
          ? activePoints / metrics.totalPointsIssued
          : 0;

      metrics.redemptionRate =
        metrics.totalPointsIssued > 0
          ? metrics.totalPointsRedeemed / metrics.totalPointsIssued
          : 0;

      metrics.lastUpdated = Date.now();

      // Store back in cache
      await this.redisService.set(
        metricsKey,
        JSON.stringify(metrics),
        300, // 5 minutes TTL
      );

      this.logger.debug(
        `Updated real-time metrics: ${JSON.stringify(metrics)}`,
      );
      return metrics;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to update real-time metrics: ${errorMessage}`);
      // Non-critical, continue without cache update
      return null;
    }
  }

  private async getCachedMetrics(
    metricsKey: string,
  ): Promise<CachedEconomicStats | null> {
    try {
      const cached = await this.redisService.get(metricsKey);
      return cached ? (JSON.parse(cached) as CachedEconomicStats) : null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to read metrics cache: ${errorMessage}`);
      return null;
    }
  }

  private async checkAndTriggerAlerts(
    metrics: CachedEconomicStats,
  ): Promise<void> {
    try {
      // Check active points threshold
      if (metrics.activePointsPercentage > this.ALERT_THRESHOLD_ACTIVE_POINTS) {
        await this.triggerAlert(
          'HIGH_ACTIVE_POINTS',
          'WARNING',
          `Active points percentage (${(metrics.activePointsPercentage * 100).toFixed(2)}%) exceeds 80% threshold`,
          metrics,
        );
      }

      // Check low redemption rate (optional, can be extended)
      if (metrics.redemptionRate < 0.25) {
        await this.triggerAlert(
          'LOW_REDEMPTION_RATE',
          'WARNING',
          `Redemption rate (${(metrics.redemptionRate * 100).toFixed(2)}%) is below 25% threshold`,
          metrics,
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to check alert thresholds: ${errorMessage}`,
        errorStack,
      );
    }
  }

  private async triggerAlert(
    alertType: string,
    severity: string,
    message: string,
    metrics: CachedEconomicStats,
  ): Promise<void> {
    const throttleKey = `economy:alert:throttle:${alertType}`;

    try {
      // Check if alert was triggered recently (rate limiting)
      const lastAlert = await this.redisService.get(throttleKey);
      if (lastAlert) {
        this.logger.debug(
          `Alert ${alertType} throttled - already triggered recently`,
        );
        return;
      }

      // Create alert in database
      const alert = await this.prisma.economicAlert.create({
        data: {
          alertType,
          severity,
          message,
          metricsSnapshot: metrics as unknown as Prisma.InputJsonValue,
          acknowledged: false,
        },
      });

      // Set throttle to prevent spam
      await this.redisService.set(
        throttleKey,
        Date.now().toString(),
        this.ALERT_THROTTLE_TTL,
      );

      // Emit alert event for potential notification handlers
      this.eventEmitter.emit('economic.alert.triggered', {
        alert,
        metrics,
      });

      this.logger.warn(`Economic alert triggered: ${alertType} - ${message}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to trigger alert ${alertType}: ${errorMessage}`,
        errorStack,
      );
    }
  }
}
