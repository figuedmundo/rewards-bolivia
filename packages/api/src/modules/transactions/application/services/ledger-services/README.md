# Ledger Services

This directory contains all ledger and audit-related services for the Rewards Bolivia platform. These services implement the dual-level hashing strategy for comprehensive audit coverage.

## Overview

The ledger services are responsible for:

1. **Per-Transaction Hashing** - Computing and verifying SHA256 hashes for individual ledger entries
2. **Daily Batch Hashing** - Aggregating daily ledger entries into a single hash for blockchain anchoring
3. **Hash-Aware Ledger Creation** - Creating ledger entries with automatic hash computation
4. **Legacy Entry Backfill** - Batch-processing existing entries to compute missing hashes

## Services

### `ledger-hash.service.ts`

**Purpose:** Per-transaction hashing for individual ledger entries (Epic 6)

**Key Methods:**

```typescript
@Injectable()
export class LedgerHashService {
  /**
   * Compute SHA256 hash for a single ledger entry
   * Format: SHA256(id|type|accountId|debit|credit|balanceAfter|transactionId|createdAt)
   */
  computeEntryHash(entry: PointLedger | LedgerEntryData): string;

  /**
   * Verify a ledger entry's hash by recomputing and comparing
   */
  verifyEntryHash(entry: PointLedger): boolean;

  /**
   * Compute hash for pre-creation data (useful during entry creation)
   */
  computeHashForNewEntry(data: NewLedgerEntryData): {
    hash: string;
    timestamp: Date;
  };
}
```

**Hash Format:**

```
SHA256(id|type|accountId|debit|credit|balanceAfter|transactionId|createdAt)
```

**Use Cases:**

- Verifying entry integrity in `GET /ledger/entries/:id/verify` endpoint
- Computing hashes during ledger entry creation
- Detecting tampered or corrupted entries

---

### `audit-hash.service.ts`

**Purpose:** Daily batch hashing for compliance and blockchain anchoring (Epic 5)

**Key Methods:**

```typescript
@Injectable()
export class AuditHashService {
  /**
   * Generate SHA256 hash for all ledger entries on a given date
   */
  generateDailyHash(date: Date): Promise<string>;

  /**
   * Verify a daily hash by recomputing all entries for that date
   */
  verifyDailyHash(date: Date): Promise<boolean>;

  /**
   * Get stored daily hash for a specific date
   */
  getDailyHash(date: Date): Promise<DailyAuditHash | null>;

  /**
   * Get list of recent daily hashes
   */
  getAllDailyHashes(limit?: number): Promise<DailyAuditHash[]>;
}
```

**Daily Hash Computation:**

The daily hash aggregates all ledger entries from a UTC day:

1. Fetch all `PointLedger` entries for the date (midnight to midnight UTC)
2. Sort entries by `createdAt` (oldest first) and then by `id`
3. Concatenate all per-transaction hashes: `hash1|hash2|hash3|...`
4. Compute SHA256 of concatenated string

**Use Cases:**

- Generating daily compliance audits (stored in `DailyAuditHash` table)
- Anchoring daily batch on blockchain (future feature)
- Detecting systematic tampering across a day's transactions

---

### `ledger-creation.helper.ts`

**Purpose:** Hash-aware ledger entry creation (Epic 6)

**Key Methods:**

```typescript
@Injectable()
export class LedgerCreationHelper {
  /**
   * Create a ledger entry with automatic hash computation
   * Pre-generates ID and timestamp to enable single-batch creation
   */
  createLedgerEntry(
    tx: PrismaTransactionClient,
    data: CreateLedgerEntryInput,
  ): Promise<PointLedger>;

  /**
   * Create multiple ledger entries in a single transaction with hashes
   */
  createLedgerEntries(
    tx: PrismaTransactionClient,
    entries: CreateLedgerEntryInput[],
  ): Promise<PointLedger[]>;
}
```

**Design Pattern:**

The helper pre-generates IDs and timestamps before creation to ensure:

1. **Deterministic Hashing:** All hash computations use the same timestamp
2. **Single Database Call:** All entries created atomically in one batch
3. **Performance:** No overhead from multiple round-trips

**Example Usage:**

```typescript
// In a use case or repository method
async execute(dto: EarnPointsDto): Promise<TransactionResult> {
  return this.prisma.$transaction(async (tx) => {
    // ... create transaction ...

    // Create ledger entries with automatic hashing
    const ledgerEntries = await this.ledgerCreationHelper.createLedgerEntries(
      tx,
      [
        {
          type: 'EARN',
          accountId: customer.id,
          debit: 0,
          credit: pointsEarned,
          balanceAfter: newCustomerBalance,
          transactionId: transaction.id,
          reason: 'Customer earned points',
        },
        {
          type: 'CREDIT',
          accountId: business.id,
          debit: 0,
          credit: pointsEarned,
          balanceAfter: newBusinessBalance,
          transactionId: transaction.id,
          reason: 'Business received points',
        },
      ],
    );
    // All entries created atomically with hashes automatically computed
    return { transactionId: transaction.id, ledgerEntries };
  });
}
```

---

## Legacy Entries & Backfill

### Backfill Job

**Purpose:** Compute missing hashes for ledger entries created before Epic 6

**Location:** `packages/api/src/modules/transactions/application/jobs/backfill-ledger-hashes.job.ts`

**How to Run:**

```bash
pnpm --filter api exec ts-node src/modules/transactions/application/jobs/backfill-ledger-hashes.job.ts
```

**What It Does:**

1. Finds all `PointLedger` entries where `hash IS NULL`
2. Computes SHA256 hash for each entry using `LedgerHashService`
3. Updates the database with computed hashes
4. Processes in batches of 100 to avoid memory issues
5. Reports progress and completion statistics

**Performance:**

- **Rate:** ~1000 entries per second on standard hardware
- **Memory:** O(100) - batch size, not total entries
- **Transactions:** Atomic updates per batch

---

## Testing

### Unit Tests

```bash
# Test ledger-hash service
pnpm --filter api test ledger-hash.service.spec.ts

# Test audit-hash service
pnpm --filter api test audit-hash.service.spec.ts

# Test ledger-creation helper
pnpm --filter api test ledger-creation.helper.spec.ts
```

### Integration Tests

```bash
# Test ledger hashing with real database
pnpm --filter api test ledger-hashing.integration.spec.ts

# Test ledger repository with granular queries
pnpm --filter api test ledger-repository.integration.spec.ts
```

### E2E Tests

```bash
# Test ledger endpoints (authentication, authorization, hashing)
pnpm --filter api test ledger-endpoints.e2e.spec.ts
```

---

## Performance Characteristics

- **Per-Entry Hash Computation:** <10ms (p95)
- **Daily Batch Aggregation:** <100ms for 10,000 entries (p95)
- **Hash Verification:** <5ms per entry (p95)
- **Query Endpoints:** <200ms for <1000 entries (p95)

---

## API Endpoints

These services power the following API endpoints:

**Granular Ledger Queries:**
- `GET /api/ledger/entries` - Query entries by account/transaction/date range
- `GET /api/ledger/entries/:id` - Get single entry with hash
- `GET /api/ledger/entries/:id/verify` - Verify entry integrity

**Daily Audit Operations (Admin):**
- `GET /api/admin/audit/hash/:date` - Get daily hash
- `GET /api/admin/audit/verify/:date` - Verify daily hash
- `POST /api/admin/audit/generate/:date` - Manual hash generation
- `GET /api/admin/audit/hashes` - List recent daily hashes

See [Ledger API Endpoints Guide](../../../../docs/api/ledger-endpoints.md) for full documentation.
