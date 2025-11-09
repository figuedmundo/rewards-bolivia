import { Transaction } from '../entities/transaction.entity';

export interface TransactionCompletedEvent {
  transaction: Transaction;
}
