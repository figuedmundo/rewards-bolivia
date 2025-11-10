# AI Task: Foundational Setup for Transactions Module

> **Purpose**: This document outlines the plan for establishing the database schema and backend module structure for handling all point-based transactions.

---

## 1. Task Overview

### Task Title
**Title:** Foundational Setup for Transactions Module (T5.1 & T5.2)

### Goal Statement
**Goal:** To establish the database schema and backend module structure for handling all point-based transactions, providing a solid foundation for the earn and redeem functionalities.

---

## 2. Strategic Analysis & Solution Options

**Analysis:** This task is foundational and follows established architectural patterns. No strategic analysis is required. Direct implementation is the correct approach.

---

## 3. Project Context & Current State

### Technology Stack & Architecture
This task will be implemented within the existing NestJS backend, using Prisma for database interaction, following the established Modular Monolith and DDD patterns.

### Current State
The API currently has modules for auth and users, but no dedicated module or database tables for managing economic transactions or point ledgers. This task will create those foundational pieces.

---

## 4. Feature Definition

### Problem Statement
Before implementing transaction logic (earn/redeem), we need the core database tables (`Transaction`, `PointLedger`) and the NestJS module structure (`transactions`) to house the new domain, application, and infrastructure code. This setup is a prerequisite for all other tasks in Epic 5.

### Success Criteria (MVP)
- [ ] The `prisma.schema` file is updated with `Transaction` and `PointLedger` models, and the `User` and `Business` models are updated with a `pointsBalance`.
- [ ] A database migration is successfully generated based on the schema changes.
- [ ] A new `transactions` module is created in `packages/api/src/modules/` with the standard DDD directory structure (`domain`, `application`, `infrastructure`).

---

## 5. Technical Requirements

### Functional Requirements
- The system must have data models capable of representing a transaction (earn/redeem) and a double-entry ledger for auditable point movements.
- The `User` and `Business` models must be able to store a point balance.

### Non-Functional Requirements
- **Data Integrity:** Foreign key constraints must be used to link transactions and ledger entries to users and businesses.
- **Maintainability:** The new module structure must follow the existing project conventions.

---

## 6. Data & Database Changes

### Database Schema Changes
A new migration will be created to apply the following changes to the `schema.prisma` file.

### Data Model Updates (Prisma Schema)
```prisma
// In: packages/api/prisma/schema.prisma

// Enum for Transaction Types
enum TransactionType {
  EARN
  REDEEM
  ADJUSTMENT
}

// New Model: Transaction
model Transaction {
  id           String          @id @default(cuid())
  type         TransactionType
  pointsAmount Int
  status       String          // e.g., "COMPLETED", "PENDING", "FAILED"
  auditHash    String?         @unique
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  business   Business @relation(fields: [businessId], references: [id])
  businessId String
  customer   User     @relation(fields: [customerId], references: [id])
  customerId String

  ledgerEntries PointLedger[]

  @@index([businessId])
  @@index([customerId])
}

// New Model: PointLedger
model PointLedger {
  id              String      @id @default(cuid())
  accountId       String      // Can be a userId or businessId
  debit           Int         // Points removed
  credit          Int         // Points added
  balanceAfter    Int
  createdAt       DateTime    @default(now())

  transaction   Transaction @relation(fields: [transactionId], references: [id])
  transactionId String

  @@index([accountId])
}

// Update to User model
model User {
  // ... existing fields
  pointsBalance Int @default(0)
  transactions  Transaction[]
}

// Update to Business model
model Business {
  // ... existing fields
  pointsBalance Int @default(0)
  transactions  Transaction[]
}
```

---

## 7. API & Backend Changes

### Module Structure
Create the following directory structure:
```
/packages/api/src/modules/transactions/
├───application/
│   └───dto/
├───domain/
│   ├───entities/
│   └───repositories/
└───infrastructure/
    ├───controllers/
    └───repositories/
```

---

## 9. Implementation Plan & Tasks

### Milestone 1: Database and Module Setup
- **Task 1.1:** Modify `packages/api/prisma/schema.prisma` to include the new models and fields as defined above.
- **Task 1.2:** Run `pnpm --filter api exec prisma generate` to update the Prisma client.
- **Task 1.3:** Run `pnpm --filter api exec prisma migrate dev --name feat-transactions-module` to create the database migration.
- **Task 1.4:** Create the directory structure for the new `transactions` module inside `packages/api/src/modules/`.
- **Task 1.5:** Create the initial `transactions.module.ts` file and add it to the main `app.module.ts`.

---
## 11. AI Agent Instructions

### Implementation Workflow
1.  **Implement Schema:** Apply the changes to `schema.prisma`.
2.  **Generate & Migrate:** Run the Prisma `generate` and `migrate` commands to update the client and database.
3.  **Create Structure:** Create the new module folders and files.
4.  **Verify:** Ensure the application builds successfully after the changes.
