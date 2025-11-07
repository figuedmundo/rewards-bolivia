import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class EconomicControlService {
  private readonly BURN_FEE_RATE = 0.005; // 0.5% burn rate

  constructor(private readonly prisma: PrismaService) {}

  getBurnFeeRate(): number {
    return this.BURN_FEE_RATE;
  }

  async getEconomyStats() {
    const totalEarned = await this.prisma.transaction.aggregate({
      _sum: { pointsAmount: true },
      where: { type: TransactionType.EARN },
    });

    const totalRedeemed = await this.prisma.transaction.aggregate({
      _sum: { pointsAmount: true },
      where: { type: TransactionType.REDEEM },
    });

    const totalBurned = await this.prisma.transaction.aggregate({
      _sum: { burnAmount: true },
      where: { type: TransactionType.REDEEM }, // Burn happens during redeem
    });

    const totalPointsInCirculation = await this.prisma.user.aggregate({
      _sum: { pointsBalance: true },
    });

    const totalBusinessPoints = await this.prisma.business.aggregate({
      _sum: { pointsBalance: true },
    });

    const totalIssued = (totalEarned._sum.pointsAmount || 0) + (totalBusinessPoints._sum.pointsBalance || 0);
    const totalActive = (totalPointsInCirculation._sum.pointsBalance || 0) + (totalBusinessPoints._sum.pointsBalance || 0);

    const redemptionRate = totalIssued > 0 ? ((totalRedeemed._sum.pointsAmount || 0) / totalIssued) * 100 : 0;
    const burnRatio = (totalRedeemed._sum.pointsAmount || 0) > 0 ? ((totalBurned._sum.burnAmount || 0) / (totalRedeemed._sum.pointsAmount || 0)) * 100 : 0;
    const activePointsPercentage = totalIssued > 0 ? (totalActive / totalIssued) * 100 : 0;

    return {
      totalEarned: totalEarned._sum.pointsAmount || 0,
      totalRedeemed: totalRedeemed._sum.pointsAmount || 0,
      totalBurned: totalBurned._sum.burnAmount || 0,
      totalPointsInCirculation: totalPointsInCirculation._sum.pointsBalance || 0,
      totalBusinessPoints: totalBusinessPoints._sum.pointsBalance || 0,
      totalIssued: totalIssued,
      totalActive: totalActive,
      redemptionRate: redemptionRate,
      burnRatio: burnRatio,
      activePointsPercentage: activePointsPercentage,
    };
  }

  async checkAndAdjustEmission(): Promise<void> {
    // Placeholder for future dynamic emission adjustment logic
    // This would involve:
    // 1. Calculating redemption rate over a trailing period (e.g., 30 days)
    // 2. Comparing it against a threshold (e.g., 25%)
    // 3. Adjusting emission rates for promo/Starter plans if the condition is met
    console.log('Checking and adjusting emission rates (placeholder)');
    // Implementation will be added in a future sprint
  }
}
