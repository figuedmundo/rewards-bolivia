export interface ILedgerRepository {
  getTotalPointsIssued(): Promise<number>;
  getTotalPointsRedeemed(): Promise<number>;
  getTotalPointsBurned(): Promise<number>;

  // 30-day trailing window calculations
  getPointsIssuedInLast30Days(): Promise<number>;
  getPointsRedeemedInLast30Days(): Promise<number>;
  getTransactionCountInLast30Days(): Promise<number>;
}
