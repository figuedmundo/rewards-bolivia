import { Injectable, Inject } from '@nestjs/common';
import type { ILedgerRepository } from '../../domain/repositories/ledger.repository';

export interface EconomicStats {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalPointsBurned: number;
  burnRatio: number;
  activePointsPercentage: number;
  redemptionRate: number;
}

@Injectable()
export class EconomicControlService {
  constructor(
    @Inject('ILedgerRepository')
    private readonly ledgerRepository: ILedgerRepository,
  ) {}

  async getEconomicStats(): Promise<EconomicStats> {
    const totalPointsIssued =
      await this.ledgerRepository.getTotalPointsIssued();
    const totalPointsRedeemed =
      await this.ledgerRepository.getTotalPointsRedeemed();
    const totalPointsBurned =
      await this.ledgerRepository.getTotalPointsBurned();

    const burnRatio =
      totalPointsRedeemed > 0 ? totalPointsBurned / totalPointsRedeemed : 0;
    const activePoints = totalPointsIssued - totalPointsRedeemed;
    const activePointsPercentage =
      totalPointsIssued > 0 ? activePoints / totalPointsIssued : 0;
    const redemptionRate =
      totalPointsIssued > 0 ? totalPointsRedeemed / totalPointsIssued : 0;

    const stats = {
      totalPointsIssued,
      totalPointsRedeemed,
      totalPointsBurned,
      burnRatio,
      activePointsPercentage,
      redemptionRate,
    };

    return stats;
  }

  /**
   * Placeholder for future dynamic rule adjustments.
   */
  checkAndAdjustEmissionRates(): void {
    // In the future, this method could contain logic to:
    // 1. Fetch redemption rates over the last 30 days.
    // 2. Compare against a threshold (e.g., 25%).
    // 3. If below threshold, temporarily reduce emission rates for promotional campaigns.
    console.log('Checking and adjusting emission rates (placeholder)');
  }

  /**
   * Returns the current burn fee rate.
   * @returns The burn fee rate.
   */
  getBurnFeeRate(): number {
    // TODO: Make this configurable
    return 0.005; // 0.5%
  }
}
