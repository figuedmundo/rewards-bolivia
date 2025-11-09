import {
  Transaction as PrismaTransaction,
  PointLedger as PrismaPointLedger,
  TransactionType,
  LedgerEntryType,
} from '@prisma/client';

export class Transaction implements PrismaTransaction {
  id: string;
  type: TransactionType;
  pointsAmount: number;
  burnAmount: number | null;
  status: string;
  auditHash: string | null;
  createdAt: Date;
  updatedAt: Date;
  businessId: string;
  customerId: string;
  ledgerEntries: PointLedger[];
}

export class PointLedger implements PrismaPointLedger {
  id: string;
  type: LedgerEntryType;
  accountId: string;
  debit: number;
  credit: number;
  balanceAfter: number;
  reason: string | null;
  hash: string | null;
  createdAt: Date;
  transactionId: string;
}
