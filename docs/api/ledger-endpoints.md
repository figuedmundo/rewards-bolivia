# Ledger API Endpoints

## Overview

The Ledger API provides granular access to point ledger entries with cryptographic verification. All endpoints require JWT authentication and follow role-based access control (users can only access their own entries, admins can access any entries).

## Dual-Hashing Strategy

Rewards Bolivia uses two levels of hashing for comprehensive audit coverage:

### 1. Per-Transaction Hashing (Epic 6)
Every `PointLedger` entry has a SHA256 hash computed during creation:

- **Format:** `SHA256(id|type|accountId|debit|credit|balanceAfter|transactionId|createdAt)`
- **Timing:** Computed and stored at the moment of entry creation
- **Purpose:** Enable real-time verification and instant proof-of-entry
- **Use Case:** User disputes, instant verification of specific transactions
- **Endpoint:** `GET /ledger/entries/:id/verify`

### 2. Daily Batch Hashing (Epic 5)
All ledger entries for a given day are aggregated into a single hash:

- **Timing:** Generated automatically at 3 AM UTC via `GenerateDailyAuditHashJob` cron job
- **Storage:** `DailyAuditHash` table
- **Purpose:** Enable blockchain anchoring (gas-efficient) and daily compliance audits
- **Use Case:** Blockchain proof-of-audit, regulatory compliance reporting
- **Endpoint:** `/admin/audit/*` endpoints

## API Endpoints

### GET /api/ledger/entries

Query ledger entries with flexible filters and pagination.

**Authentication:** Required (JWT Bearer token)

**Query Parameters:**

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `accountId` | string | No | - | - | Filter by account (userId or businessId). Users can only query their own, admins can query any |
| `transactionId` | string | No | - | - | Filter by transaction ID. Returns all ledger entries for that transaction |
| `startDate` | ISO 8601 date-time | No | - | - | Filter entries created on or after this date (e.g., `2025-11-13T00:00:00Z`) |
| `endDate` | ISO 8601 date-time | No | - | - | Filter entries created on or before this date (e.g., `2025-11-13T23:59:59Z`) |
| `limit` | number | No | 50 | 500 | Pagination limit. Max 500 entries per request |
| `offset` | number | No | 0 | - | Pagination offset. Combined with limit for cursor-based pagination |

**Authorization Rules:**

- Regular users: Can only query their own `accountId`. Requests with different `accountId` return 401 Unauthorized
- Admin users: Can query any `accountId`, including other users' entries
- Both roles: Can filter by `transactionId` or date range for any account they have access to

**Success Response (200 OK):**

```json
{
  "entries": [
    {
      "id": "clx123...",
      "type": "EARN",
      "accountId": "user_abc",
      "debit": 0,
      "credit": 100,
      "balanceAfter": 100,
      "reason": "Purchase at Café Aroma - 5% rewards",
      "hash": "a3f5d9e8c2b1d4f6e8a9c1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1",
      "createdAt": "2025-11-13T10:30:00Z",
      "transactionId": "tx_xyz"
    },
    {
      "id": "clx456...",
      "type": "REDEEM",
      "accountId": "user_abc",
      "debit": 50,
      "credit": 0,
      "balanceAfter": 50,
      "reason": "Redeemed at Partner Store",
      "hash": "b7c2e4f1a9d3e5b8c2d4f6e8a9c1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1b3d5",
      "createdAt": "2025-11-13T14:20:00Z",
      "transactionId": "tx_def"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

**Error Responses:**

```json
// 401 Unauthorized - Missing or invalid token
{
  "statusCode": 401,
  "message": "Unauthorized"
}

// 401 Unauthorized - Attempting to query other user's entries
{
  "statusCode": 401,
  "message": "You can only query your own ledger entries"
}

// 400 Bad Request - Limit exceeds maximum
{
  "statusCode": 400,
  "message": "Limit cannot exceed 500"
}

// 400 Bad Request - Invalid date format
{
  "statusCode": 400,
  "message": "Invalid date format. Use ISO 8601."
}
```

---

### GET /api/ledger/entries/:id

Retrieve a single ledger entry by ID with its cryptographic hash.

**Authentication:** Required (JWT Bearer token)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The ledger entry ID (CUID format) |

**Authorization Rules:**

- Regular users: Can only access entries where `accountId` matches their user ID. Accessing another user's entry returns 401 Unauthorized
- Admin users: Can access any entry regardless of `accountId`

**Success Response (200 OK):**

```json
{
  "id": "clx123...",
  "type": "REDEEM",
  "accountId": "user_abc",
  "debit": 50,
  "credit": 0,
  "balanceAfter": 50,
  "reason": "Redeemed at Partner Store",
  "hash": "b7c2e4f1a9d3e5b8c2d4f6e8a9c1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1b3d5",
  "createdAt": "2025-11-13T14:20:00Z",
  "transactionId": "tx_def"
}
```

**Error Responses:**

```json
// 401 Unauthorized - Missing token or accessing other user's entry
{
  "statusCode": 401,
  "message": "You can only access your own ledger entries"
}

// 404 Not Found - Entry does not exist
{
  "statusCode": 404,
  "message": "Ledger entry not found"
}
```

---

### GET /api/ledger/entries/:id/verify

Verify the cryptographic integrity of a single ledger entry by recomputing its hash and comparing against the stored value.

**Authentication:** Required (JWT Bearer token)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The ledger entry ID (CUID format) |

**Authorization Rules:**

- Regular users: Can only verify entries where `accountId` matches their user ID
- Admin users: Can verify any entry
- Both: Attempting to verify without proper authorization returns 401 Unauthorized

**Success Response (200 OK - Verification Passed):**

```json
{
  "id": "clx123...",
  "valid": true,
  "storedHash": "a3f5d9e8c2b1d4f6e8a9c1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1",
  "computedHash": "a3f5d9e8c2b1d4f6e8a9c1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1",
  "entry": {
    "id": "clx123...",
    "type": "EARN",
    "accountId": "user_abc",
    "debit": 0,
    "credit": 100,
    "balanceAfter": 100,
    "createdAt": "2025-11-13T10:30:00Z",
    "transactionId": "tx_xyz"
  },
  "message": "Hash verification passed - entry integrity confirmed"
}
```

**Success Response (200 OK - Verification Failed):**

```json
{
  "id": "clx123...",
  "valid": false,
  "storedHash": "a3f5d9e8c2b1d4f6e8a9c1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1",
  "computedHash": "b4c6e2f9d3a5e7c1f3a5b7d9e1f3a5b7d9e1f3a5b7d9e1f3a5b7d9e1f3a5",
  "entry": {
    "id": "clx123...",
    "type": "EARN",
    "accountId": "user_abc",
    "debit": 0,
    "credit": 100,
    "balanceAfter": 100,
    "createdAt": "2025-11-13T10:30:00Z",
    "transactionId": "tx_xyz"
  },
  "message": "Hash verification FAILED - entry may have been tampered with"
}
```

**Error Responses:**

```json
// 401 Unauthorized - Missing token or accessing other user's entry
{
  "statusCode": 401,
  "message": "You can only verify your own ledger entries"
}

// 404 Not Found - Entry does not exist
{
  "statusCode": 404,
  "message": "Ledger entry not found"
}

// 400 Bad Request - Entry created before per-transaction hashing was implemented
{
  "statusCode": 400,
  "message": "Ledger entry does not have a hash (created before per-transaction hashing was implemented)"
}
```

---

## Ledger Entry Types

The `type` field in ledger entries indicates the kind of transaction:

| Type | Debit | Credit | Description |
|------|-------|--------|-------------|
| `EARN` | 0 | > 0 | Customer earned points from a purchase |
| `REDEEM` | > 0 | 0 | Customer redeemed points at a business |
| `BURN` | > 0 | 0 | Points burned (expired or administrative) |
| `ADJUSTMENT` | any | any | Manual adjustment to point balance |
| `EXPIRE` | > 0 | 0 | Points expired due to inactivity |

## Common Use Cases

### 1. Get All Entries for a User

```bash
curl -X GET "http://localhost:3001/api/ledger/entries" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Get Entries for a Specific Transaction

```bash
curl -X GET "http://localhost:3001/api/ledger/entries?transactionId=tx_abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Entries Within a Date Range

```bash
curl -X GET "http://localhost:3001/api/ledger/entries?startDate=2025-11-01T00:00:00Z&endDate=2025-11-30T23:59:59Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Verify a Specific Entry's Integrity

```bash
curl -X GET "http://localhost:3001/api/ledger/entries/clx123abc/verify" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Admin: Query Another User's Entries

```bash
curl -X GET "http://localhost:3001/api/ledger/entries?accountId=user_xyz" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Hash Format & Verification

Every ledger entry includes a SHA256 hash computed from the following fields in order:

```
SHA256(id|type|accountId|debit|credit|balanceAfter|transactionId|createdAt)
```

**Example:**

For an entry with:
- `id`: "clx123"
- `type`: "EARN"
- `accountId`: "user_abc"
- `debit`: 0
- `credit`: 100
- `balanceAfter`: 100
- `transactionId`: "tx_xyz"
- `createdAt`: "2025-11-13T10:30:00Z"

The computed hash would be:
```
SHA256("clx123|EARN|user_abc|0|100|100|tx_xyz|2025-11-13T10:30:00Z")
= "a3f5d9e8c2b1d4f6e8a9c1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1b3d5f7e9a1"
```

### Verification Process

1. Client retrieves the ledger entry via `GET /api/ledger/entries/:id`
2. Client calls `GET /api/ledger/entries/:id/verify` endpoint
3. Server recomputes the hash using the entry's data
4. Server compares stored hash with computed hash
5. Returns `valid: true` if they match, `false` otherwise

If `valid: false`, this indicates the entry may have been tampered with. This should trigger an alert or investigation.

## Performance Characteristics

- **Query endpoints:** Response time typically <200ms for <1000 entries (p95)
- **Hash computation:** Per-entry hashing adds <10ms overhead (p95)
- **Verification:** Hash recomputation is cached in memory, typically <5ms (p95)

## Migration from Legacy Entries

Ledger entries created before Epic 6 implementation may not have hashes. The backfill job can be run to compute hashes for existing entries:

```bash
# One-time backfill job
pnpm --filter api exec ts-node src/modules/transactions/application/jobs/backfill-ledger-hashes.job.ts
```

See [Backfill Job Documentation](../ledger-services/README.md#legacy-entries) for details.

## Related Endpoints

- **Daily Batch Hashing:** See `/admin/audit/*` endpoints in [Admin API Documentation](./admin-endpoints.md)
- **Transaction Endpoints:** See `/transactions/*` endpoints for creating transactions
