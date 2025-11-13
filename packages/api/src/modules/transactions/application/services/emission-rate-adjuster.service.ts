import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import type { ILedgerRepository } from '../../domain/repositories/ledger.repository';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { Prisma, type EmissionRateRecommendation } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface Trailing30DayMetrics {
  pointsIssued: number;
  pointsRedeemed: number;
  redemptionRate: number;
  transactionCount: number;
}

@Injectable()
export class EmissionRateAdjusterService {
  private readonly logger = new Logger(EmissionRateAdjusterService.name);

  // Configuration constants
  private readonly REDEMPTION_THRESHOLD = 0.25; // 25%
  private readonly MAX_ADJUSTMENT_PERCENTAGE = 0.2; // -20% max
  private readonly MIN_ADJUSTMENT_PERCENTAGE = 0.05; // -5% min
  private readonly RECOMMENDATION_EXPIRY_DAYS = 7;
  private readonly COOLDOWN_DAYS = 7;
  private readonly MIN_SAMPLE_SIZE = 100; // Minimum transactions needed

  constructor(
    @Inject('ILedgerRepository')
    private readonly ledgerRepository: ILedgerRepository,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Calculate redemption rate for the trailing 30-day window
   */
  async calculateTrailing30DayMetrics(): Promise<Trailing30DayMetrics> {
    const pointsIssued =
      await this.ledgerRepository.getPointsIssuedInLast30Days();
    const pointsRedeemed =
      await this.ledgerRepository.getPointsRedeemedInLast30Days();
    const transactionCount =
      await this.ledgerRepository.getTransactionCountInLast30Days();

    const redemptionRate = pointsIssued > 0 ? pointsRedeemed / pointsIssued : 0;

    return {
      pointsIssued,
      pointsRedeemed,
      redemptionRate,
      transactionCount,
    };
  }

  /**
   * Generate a recommendation if thresholds are breached
   */
  async generateRecommendationIfNeeded(): Promise<EmissionRateRecommendation | null> {
    this.logger.log('Checking if emission rate recommendation is needed...');

    // Calculate metrics
    const metrics = await this.calculateTrailing30DayMetrics();

    this.logger.debug(`Trailing 30-day metrics: ${JSON.stringify(metrics)}`);

    // Check if we have enough data
    if (metrics.transactionCount < this.MIN_SAMPLE_SIZE) {
      this.logger.warn(
        `Insufficient data for recommendation (${metrics.transactionCount} transactions, need ${this.MIN_SAMPLE_SIZE})`,
      );
      return null;
    }

    // Check if redemption rate is below threshold
    if (metrics.redemptionRate >= this.REDEMPTION_THRESHOLD) {
      this.logger.log(
        `Redemption rate (${(metrics.redemptionRate * 100).toFixed(2)}%) is healthy. No recommendation needed.`,
      );
      return null;
    }

    // Check cooldown period (has a recommendation been created recently?)
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() - this.COOLDOWN_DAYS);

    const recentRecommendation =
      await this.prisma.emissionRateRecommendation.findFirst({
        where: {
          createdAt: {
            gte: cooldownDate,
          },
          status: {
            in: ['PENDING', 'APPROVED'],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    if (recentRecommendation) {
      this.logger.warn(
        `Recommendation already exists within cooldown period (created ${recentRecommendation.createdAt.toISOString()})`,
      );
      return null;
    }

    // Get current emission rate (using BASE as default)
    const currentRateConfig = await this.prisma.emissionRateConfig.findUnique({
      where: { rateType: 'BASE' },
    });

    if (!currentRateConfig) {
      this.logger.error('No BASE emission rate config found');
      return null;
    }

    const currentRate = currentRateConfig.emissionRate.toNumber();

    // Calculate adjustment
    const adjustmentFactor = this.REDEMPTION_THRESHOLD - metrics.redemptionRate;
    let adjustmentPercentage = Math.min(
      adjustmentFactor,
      this.MAX_ADJUSTMENT_PERCENTAGE,
    );
    adjustmentPercentage = Math.max(
      adjustmentPercentage,
      this.MIN_ADJUSTMENT_PERCENTAGE,
    );

    const recommendedRate = currentRate * (1 - adjustmentPercentage);

    // Create recommendation
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.RECOMMENDATION_EXPIRY_DAYS);

    const recommendation = await this.prisma.emissionRateRecommendation.create({
      data: {
        currentEmissionRate: new Decimal(currentRate),
        recommendedEmissionRate: new Decimal(recommendedRate),
        adjustmentPercentage: new Decimal(-adjustmentPercentage * 100), // Store as negative percentage
        reason: `Low redemption rate detected: ${(metrics.redemptionRate * 100).toFixed(2)}% (threshold: ${(this.REDEMPTION_THRESHOLD * 100).toFixed(2)}%). Recommending ${(adjustmentPercentage * 100).toFixed(2)}% reduction in emission rate to balance economy.`,
        redemptionRate30d: new Decimal(metrics.redemptionRate),
        metricsSnapshot: metrics as unknown as Prisma.InputJsonValue,
        status: 'PENDING',
        expiresAt,
      },
    });

    this.logger.warn(
      `Created emission rate recommendation: reduce from ${currentRate} to ${recommendedRate} (${(adjustmentPercentage * 100).toFixed(2)}% reduction)`,
    );

    // Emit event for alerting
    this.eventEmitter.emit('emission.recommendation.created', {
      recommendation,
      metrics,
    });

    return recommendation;
  }

  /**
   * Apply an approved recommendation
   */
  async applyRecommendation(
    recommendationId: string,
    approvedBy: string,
  ): Promise<void> {
    const recommendation =
      await this.prisma.emissionRateRecommendation.findUnique({
        where: { id: recommendationId },
      });

    if (!recommendation) {
      throw new Error(`Recommendation ${recommendationId} not found`);
    }

    if (recommendation.status !== 'PENDING') {
      throw new Error(
        `Recommendation ${recommendationId} is not pending (status: ${recommendation.status})`,
      );
    }

    // Check if expired
    if (new Date() > recommendation.expiresAt) {
      await this.prisma.emissionRateRecommendation.update({
        where: { id: recommendationId },
        data: { status: 'EXPIRED' },
      });
      throw new Error(`Recommendation ${recommendationId} has expired`);
    }

    // Update emission rate config
    await this.prisma.emissionRateConfig.update({
      where: { rateType: 'BASE' },
      data: {
        emissionRate: recommendation.recommendedEmissionRate,
        lastAdjustedAt: new Date(),
        lastAdjustedBy: approvedBy,
      },
    });

    // Mark recommendation as approved and applied
    await this.prisma.emissionRateRecommendation.update({
      where: { id: recommendationId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
        appliedAt: new Date(),
      },
    });

    this.logger.log(
      `Applied emission rate recommendation ${recommendationId}: new rate = ${recommendation.recommendedEmissionRate.toString()}`,
    );

    // Emit event
    this.eventEmitter.emit('emission.rate.adjusted', {
      recommendation,
      approvedBy,
    });
  }

  /**
   * Reject a recommendation
   */
  async rejectRecommendation(
    recommendationId: string,
    rejectedBy: string,
  ): Promise<void> {
    const recommendation =
      await this.prisma.emissionRateRecommendation.findUnique({
        where: { id: recommendationId },
      });

    if (!recommendation) {
      throw new Error(`Recommendation ${recommendationId} not found`);
    }

    if (recommendation.status !== 'PENDING') {
      throw new Error(
        `Recommendation ${recommendationId} is not pending (status: ${recommendation.status})`,
      );
    }

    await this.prisma.emissionRateRecommendation.update({
      where: { id: recommendationId },
      data: {
        status: 'REJECTED',
        approvedBy: rejectedBy, // Reuse field for who rejected
        approvedAt: new Date(),
      },
    });

    this.logger.log(
      `Rejected emission rate recommendation ${recommendationId} by ${rejectedBy}`,
    );
  }

  /**
   * Get all recommendations with optional status filter
   */
  async getRecommendations(
    status?: string,
  ): Promise<EmissionRateRecommendation[]> {
    return this.prisma.emissionRateRecommendation.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get current emission rate for a specific type
   */
  async getCurrentEmissionRate(rateType: string): Promise<number> {
    const config = await this.prisma.emissionRateConfig.findUnique({
      where: { rateType },
    });

    if (!config) {
      throw new Error(`Emission rate config not found for type: ${rateType}`);
    }

    return config.emissionRate.toNumber();
  }
}
