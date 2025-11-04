import { Transaction as PrismaTransaction, PointLedger as PrismaPointLedger } from '@prisma/client';

export class Transaction implements PrismaTransaction {
  id: string;
  type: any;
  pointsAmount: number;
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
  accountId: string;
  debit: number;
  credit: number;
  balanceAfter: number;
  createdAt: Date;
  transactionId: string;
}
