import { Transaction } from '../entities/transaction.entity';

export interface ITransactionRepository {
  create(
    transaction: Partial<Transaction>,
    burnAmount?: number,
  ): Promise<Transaction>;
  redeem(
    transaction: Partial<Transaction>,
    burnAmount?: number,
  ): Promise<Transaction>;
}
