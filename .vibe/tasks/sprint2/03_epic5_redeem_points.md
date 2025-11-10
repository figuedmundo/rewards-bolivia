# AI Task: Implement "Redeem Points" Transaction Flow

> **Purpose**: This document outlines the plan for implementing the "Redeem Points" feature, allowing customers to use points for discounts.

---

## 1. Task Overview

### Task Title
**Title:** Implement "Redeem Points" Transaction Flow (T5.4 & T5.5)

### Goal Statement
**Goal:** To enable customers to use their accumulated points for discounts at checkout, completing the core value cycle of the rewards program and enhancing customer loyalty.

---

## 3. Project Context & Current State

### Current State
The "Earn Points" flow is assumed to be complete. Customers can accumulate points, but the mechanism to spend them does not exist. The foundational data models are in place.

---

## 4. Feature Definition

### Problem Statement
The core value proposition for customers is the ability to use their points. This requires a secure, reliable API endpoint that validates redemption rules (e.g., balance checks, ticket limits) and atomically processes the transaction, moving points from the customer back to the business.

### Success Criteria (MVP)
- [ ] A `POST /transactions/redeem` endpoint is created and functional.
- [ ] The system correctly validates that the customer has sufficient points and that the redemption does not exceed 30% of the ticket value.
- [ ] A successful call atomically decrements the customer's `pointsBalance` and increments the business's `pointsBalance`.
- [ ] The transaction is correctly recorded in the `Transaction` and `PointLedger` tables with a `REDEEM` type.
- [ ] A SHA256 audit hash is generated and stored.
- [ ] Redis caches for the affected user and business balances are correctly invalidated.

---

## 5. Technical Requirements

### Functional Requirements
- **System Requirement 1:** The system must validate that the user has sufficient points before authorizing a redemption.
- **System Requirement 2:** The system must enforce the maximum redemption limit (30% of the total ticket value), as defined in the economic model.

### Non-Functional Requirements
- **Performance:** API response time for redemption requests must be < 500ms (p95).
- **Security:** The endpoint must be authenticated and authorized for the customer. The mechanism to identify the business (e.g., via a dynamic QR code) must be secure.
- **Reliability:** All database operations must be performed within a single atomic transaction using `prisma.$transaction`.

---

## 7. API & Backend Changes

### API Endpoints Design
```markdown
#### POST /api/v1/transactions/redeem
**Description**: Initiates a points redemption transaction.

**Authentication**: Required (Customer Bearer token)

**Request Body**:
```json
{
  "businessId": "business_id_from_qr_scan",
  "pointsToRedeem": 100,
  "ticketTotal": 50.00
}
```

**Success Response (200 OK)**:
```json
{
  "transactionId": "clxkk456...",
  "status": "COMPLETED",
  "pointsRedeemed": 100,
  "discountValueBs": "3.00",
  "newCustomerBalance": 350,
  "businessName": "Café Aroma"
}
```

**Error Response (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Redemption value exceeds 30% of ticket total."
}
```

---

## 9. Implementation Plan & Tasks

### Milestone 1: Backend Logic
- **Task 1.1 (Application):** Create the `RedeemPointsUseCase` in `transactions/application`. This service will contain the core business logic.
- **Task 1.2 (Application):** Implement the validation logic within the use case: check customer balance and the 30% ticket limit.
- **Task 1.3 (Application):** Create the `RedeemPointsDto` for incoming data.
- **Task 1.4 (Infrastructure):** Add the `redeem` method to the `PrismaTransactionRepository`. This method will handle the atomic database operations using `prisma.$transaction`:
    - Create the `Transaction` record.
    - Decrement customer `pointsBalance`.
    - Increment business `pointsBalance`.
    - Create the two `PointLedger` entries (debit customer, credit business).
- **Task 1.5 (Infrastructure):** Add the `POST /redeem` endpoint to the `TransactionsController`.
- **Task 1.6 (Cross-Cutting):** Integrate the audit hash generation and Redis cache invalidation logic within the repository method.

---
## 11. AI Agent Instructions

### Implementation Workflow
1.  **Start with the Application Layer:** Create the `RedeemPointsUseCase` and define the core business and validation logic.
2.  **Update the Repository:** Add the `redeem` method to your `ITransactionRepository` interface and implement it in `PrismaTransactionRepository`, ensuring atomicity.
3.  **Update the Controller:** Add the new endpoint to `TransactionsController`.
4.  **Test Rigorously:** Write unit tests for the validation logic and integration tests for the full database transaction flow.
5.  **Verify:** Manually test the endpoint with various scenarios (success, insufficient funds, over limit) to confirm correctness.
