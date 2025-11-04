import { Transaction } from '../entities/transaction.entity';

export interface ITransactionRepository {
  create(transaction: Partial<Transaction>): Promise<Transaction>;
  redeem(transaction: Partial<Transaction>): Promise<Transaction>;
}
