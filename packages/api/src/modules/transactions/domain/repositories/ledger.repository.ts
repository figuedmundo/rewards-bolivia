export interface ILedgerRepository {
  getTotalPointsIssued(): Promise<number>;
  getTotalPointsRedeemed(): Promise<number>;
  getTotalPointsBurned(): Promise<number>;
}
