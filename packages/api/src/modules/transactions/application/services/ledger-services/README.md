# Ledger Services

This directory contains all ledger and audit-related services.

## Services

### `audit-hash.service.ts`
**Purpose:** Daily batch hashing (Epic 5)
- Generates SHA256 hash for all ledger entries on a given date
- Stores in `DailyAuditHash` table
- Used by `GenerateDailyAuditHashJob`

### `ledger-hash.service.ts`
**Purpose:** Per-transaction hashing (Epic 6)
- Computes SHA256 hash for individual ledger entries
- Verifies entry integrity
- Format: `SHA256(id|type|accountId|debit|credit|balanceAfter|transactionId|createdAt)`

### `ledger-creation.helper.ts`
**Purpose:** Hash-aware ledger entry creation (Epic 6)
- Wraps `prisma.pointLedger.create()` with automatic hash computation
- Pre-generates ID to enable single DB call
- Use in all use cases creating ledger entries

## Usage

```typescript
// In PrismaTransactionRepository
const entry = await this.ledgerCreationHelper.createLedgerEntry(
  {
    type: 'EARN',
    accountId: userId,
    credit: 100,
    debit: 0,
    balanceAfter: newBalance,
    transaction: { connect: { id: transactionId } },
  },
  tx, // Pass transaction context for atomicity
);
// entry.hash is automatically computed and stored
```
