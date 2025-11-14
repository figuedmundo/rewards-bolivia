export interface LedgerEntryDto {
  id: string;
  type: 'EARN' | 'REDEEM' | 'BURN' | 'EXPIRE' | 'ADJUSTMENT';
  accountId: string;
  debit: number;
  credit: number;
  balanceAfter: number;
  reason?: string;
  hash: string;
  createdAt: Date;
  transactionId: string;
}

export interface LedgerEntriesResponse {
  entries: LedgerEntryDto[];
  total: number;
  limit: number;
  offset: number;
}

export interface LedgerEntryVerificationDto {
  id: string;
  valid: boolean;
  storedHash: string;
  computedHash: string;
  entry: LedgerEntryDto;
  message: string;
}
