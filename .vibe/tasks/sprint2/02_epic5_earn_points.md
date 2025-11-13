# AI Task: Implement "Earn Points" Transaction Flow

> **Purpose**: This document outlines the plan for implementing the "Earn Points" feature, allowing businesses to issue points to customers.

---

## 1. Task Overview

### Task Title
**Title:** Implement "Earn Points" Transaction Flow (T5.3)

### Goal Statement
**Goal:** To allow businesses to issue points to customers for their purchases, initiating the core loyalty loop and providing immediate value to the customer.

---

## 3. Project Context & Current State

### Current State
The foundational data models (`Transaction`, `PointLedger`) and the `transactions` module structure are assumed to be in place as per the `epic5_task1_foundations.md` task. No API endpoint or business logic for issuing points exists yet.

---

## 4. Feature Definition

### Problem Statement
Businesses need a mechanism to reward customers. This requires a secure and reliable API endpoint that atomically handles the transfer of points from a business to a customer, records the event for auditing, and updates all relevant balances.

### Success Criteria (MVP)
- [ ] A `POST /transactions/earn` endpoint is created and functional.
- [ ] A successful call to the endpoint correctly decrements the business's `pointsBalance` and increments the customer's `pointsBalance`.
- [ ] The entire operation is atomic (all changes succeed or all fail).
- [ ] The transaction is correctly recorded in the `Transaction` and `PointLedger` tables.
- [ ] A SHA256 audit hash is generated and stored with the transaction.
- [ ] Redis caches for the affected user and business balances are correctly invalidated.

---

## 5. Technical Requirements

### Functional Requirements
- **System Requirement 1:** The system must validate that the business has a sufficient `pointsBalance` before allowing them to issue new points.
- **System Requirement 2:** The number of points to earn should be calculated based on a configurable ratio (e.g., 1 point per 1 Bs spent), which can be defined at the business or system level. For MVP, a 1:1 ratio can be assumed.

### Non-Functional Requirements
- **Performance:** API response time for the earn request must be < 500ms (p95).
- **Security:** The endpoint must be authenticated and authorized, ensuring only a valid business can initiate a transaction for a customer.
- **Reliability:** The use of database transactions (`prisma.$transaction`) is mandatory to ensure atomicity.

---

## 7. API & Backend Changes

### API Endpoints Design
```markdown
#### POST /api/v1/transactions/earn
**Description**: Initiates a points-earning transaction.

**Authentication**: Required (Business Bearer token)

**Request Body**:
```json
{
  "customerId": "user_id_from_qr_scan",
  "purchaseAmount": 100.50
}
```

**Success Response (200 OK)**:
```json
{
  "transactionId": "clxkj123...",
  "status": "COMPLETED",
  "pointsEarned": 100,
  "customerName": "John Doe",
  "newCustomerBalance": 550
}
```

**Error Response (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Insufficient business points balance."
}
```

---

## 9. Implementation Plan & Tasks

### Milestone 1: Backend Logic
- **Task 1.1 (Domain):** Define the `Transaction` and `PointLedger` entities/interfaces in the `transactions/domain` directory. Define the `ITransactionRepository` interface.
- **Task 1.2 (Application):** Create the `EarnPointsUseCase` in `transactions/application`. This service will contain the core business logic: validation, balance updates, and orchestration of repository calls.
- **Task 1.3 (Application):** Create the `EarnPointsDto` to define the shape of the data coming into the use case.
- **Task 1.4 (Infrastructure):** Implement the `PrismaTransactionRepository` in `transactions/infrastructure/repositories`. This class will implement `ITransactionRepository` and handle all Prisma-related database logic, including the use of `prisma.$transaction`.
- **Task 1.5 (Infrastructure):** Implement the `TransactionsController` with the `POST /earn` endpoint, which will call the `EarnPointsUseCase`.
- **Task 1.6 (Cross-Cutting):** Implement the SHA256 audit hash generation within the use case.
- **Task 1.7 (Cross-Cutting):** Implement Redis cache invalidation logic within the repository implementation after a successful transaction.

---
## 11. AI Agent Instructions

### Implementation Workflow
1.  **Start with the Domain:** Define entities and repository interfaces.
2.  **Build the Application Layer:** Create the `EarnPointsUseCase` and implement the core logic.
3.  **Implement Infrastructure:** Build the controller and the Prisma repository.
4.  **Integrate & Test:** Write unit tests for the use case and integration tests for the controller-to-database flow.
5.  **Verify:** Manually test the endpoint to confirm the entire flow works as expected.
