# AI Task: Implement Transaction Fee (Point Burn)

> **Purpose**: This document outlines the plan for implementing a transaction fee on redemptions, which acts as a deflationary mechanism by "burning" a small percentage of points.

---

## 1. Task Overview

### Task Title
**Title:** Implement Transaction Fee (Burn) on Redemptions (T5.10)

### Goal Statement
**Goal:** To introduce a small, configurable transaction fee (burn) on all point redemptions, which will be removed from circulation to help control the total supply of points and ensure the long-term health of the economy.

---

## 2. Strategic Analysis & Solution Options

> **AI Agent Note:** Strategic analysis is not required. This is a direct implementation of a pre-defined economic rule. The logic will be integrated into the existing `redeem` transaction flow.

---

## 3. Project Context & Current State

### Current State
The `RedeemPointsUseCase` and `PrismaTransactionRepository` handle the redemption of points, moving them from a customer's balance to a business's balance. However, the deflationary "burn" mechanism, a key part of the economic model, is not yet implemented. All redeemed points are currently credited back to the business.

---

## 4. Feature Definition

### Problem Statement
To ensure the long-term stability of the points economy, a deflationary mechanism is needed to counteract the continuous issuance of new points. Without a "burn" mechanism, the total supply of points could grow indefinitely, leading to potential inflation and devaluation. A small fee on redemptions is the chosen method to systematically remove a small number of points from circulation.

### Success Criteria (MVP)
- [x] When a `redeem` transaction is processed, a `burnAmount` is calculated based on a configurable `feeRate`.
- [x] The `burnAmount` is deducted from the points credited to the business.
- [x] A new `PointLedger` entry with the type `BURN` is created to record the burned points.
- [x] The `feeRate` is managed in a central place (`EconomicControlService`) with a default of 0.5%.
- [x] Existing integration tests for the redeem flow are updated to assert the correct burn calculation and ledger entries.

---

## 5. Technical Requirements

### Functional Requirements
- **System Requirement 1:** The system must calculate `burnAmount = floor(pointsUsed * feeRate)`.
- **System Requirement 2:** The amount credited to the business during a redemption must be `pointsAmount - burnAmount`.
- **System Requirement 3:** A `PointLedger` entry of type `BURN` must be created for every redemption transaction that results in a `burnAmount` greater than 0.

---

## 7. API & Backend Changes

### `RedeemPointsUseCase` Changes
- **File:** `packages/api/src/modules/transactions/application/redeem-points.use-case.ts`
- **Logic:**
    - Inject `EconomicControlService`.
    - Call `economicControlService.getBurnFeeRate()` to get the current rate.
    - Calculate the `burnAmount`.
    - Pass the `burnAmount` to the `transactionRepository.redeem()` method.

### `PrismaTransactionRepository` Changes
- **File:** `packages/api/src/modules/transactions/infrastructure/repositories/prisma-transaction.repository.ts`
- **Logic:**
    - The `create` and `redeem` methods will accept an optional `burnAmount`.
    - The amount credited to the business will be `pointsAmount - burnAmount`.
    - A `BURN` type entry will be added to the `PointLedger` creation logic within the database transaction.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Implementation
- **Task 1.1:** Add `getBurnFeeRate()` method to `EconomicControlService` (defaulting to 0.005).
- **Task 1.2:** Modify `ITransactionRepository` to accept an optional `burnAmount` in its `redeem` and `create` methods.
- **Task 1.3:** Update `RedeemPointsUseCase` to calculate the `burnAmount` and pass it to the repository.
- **Task 1.4:** Update `PrismaTransactionRepository` to use the passed `burnAmount`, adjust the credited points, and create the `BURN` ledger entry.

### Milestone 2: Testing
- **Task 2.1:** Update the integration tests in `transactions.controller.integration.spec.ts` to verify:
    - The business receives `pointsRedeemed - burnAmount`.
    - A `BURN` entry is present in the `PointLedger`.
    - The final balances are correct.

---

## 11. AI Agent Instructions

### Implementation Workflow
1.  **Implement Logic:** Apply the changes to the `EconomicControlService`, Use Case, and Repository.
2.  **Update Tests:** Modify existing tests to assert the new burn logic is working correctly.
3.  **Verify:** Run all tests to ensure no regressions have been introduced.

---

## Progress Report

### Milestone 1: Implementation - ✅ DONE
- **Task 1.1:** `getBurnFeeRate()` method added to `EconomicControlService`.
- **Task 1.2:** `ITransactionRepository` modified to accept `burnAmount`.
- **Task 1.3:** `RedeemPointsUseCase` updated to calculate and pass `burnAmount`.
- **Task 1.4:** `PrismaTransactionRepository` updated to use `burnAmount` and create `BURN` ledger entry.

### Milestone 2: Testing - ✅ DONE
- **Task 2.1:** Integration tests in `transactions.controller.integration.spec.ts` updated to verify burn logic, ledger entries, and final balances.
