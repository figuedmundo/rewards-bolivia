# AI Task Template: Align Transaction Logic with Business Model

> **Purpose**: This document outlines the plan to refactor the transaction processing logic to fully align with the documented business and monetization model, specifically by implementing the "Starter Pack" and "Blocked Points" features.

---

## 1. Task Overview

### Task Title
**Title:** Refactor Transaction Repository to Support Blocked Points and Business Plans

### Goal Statement
**Goal:** To accurately implement the "Starter Pack" business rules within the transaction engine, ensuring that points redeemed by customers of "Starter" businesses are correctly allocated to a `blockedPointsBalance`. This change is critical for enforcing the monetization strategy and creating a natural incentive for businesses to upgrade to a paid plan.

---

## 2. Strategic Analysis & Solution Options

> **AI Agent Note:** Strategic analysis is not required for this task. The necessary changes are dictated by pre-defined business rules in the project documentation. The task is a direct implementation of these rules into the existing architecture.

---

## 3. Project Context & Current State

### Technology Stack
This feature will be built within the established Rewards Bolivia technical environment.

```yaml
Project Name: Rewards Bolivia
Technology Stack:
  Backend: NestJS (Node.js + TypeScript)
  Web App (Dashboard): React (Vite + Tailwind CSS + shadcn/ui)
  Database (Primary): PostgreSQL
  ORM / DB Toolkit: Prisma
  Caching: Redis
  Blockchain (Audit): Polygon (PoS)
  Infrastructure: Docker & Kubernetes (K8s)
  CI/CD: GitHub Actions
  Testing: Jest (Unit), Playwright (E2E), k6 (Load)
```

### Architecture
```yaml
Key Architectural Patterns:
  - Modular Monolith
  - Domain-Driven Design (DDD)
  - Clean Architecture
  - Hybrid Off-chain/On-chain (Proof-of-Audit)
  - Event-driven (for asynchronous tasks)
```
For more details, see the [Architecture Guide](../../docs/ARCHITECTURE.md).

### Project Structure
The project is a monorepo organized as follows:
```
/rewards-bolivia
├───e2e/
├───infra/
├───packages/
│   ├───api/
│   ├───web/
│   ├───worker/
│   ├───sdk/
│   ├───shared-types/
│   ├───libs/
│   ├───test-utils/
│   └───infra-scripts/
├───.github/
└───docs/
```
For more details, see the [Architecture Guide](../../docs/ARCHITECTURE.md).

### Naming Conventions
-   **Files:** `name.type.ts` (e.g., `create-user.use-case.ts`). `kebab-case` for multi-word names.
-   **Classes:** `PascalCase` with suffixes (e.g., `AuthService`, `UsersController`).
-   **Methods & Variables:** `camelCase`.
-   **Interfaces:** `PascalCase` with `I` prefix (e.g., `IUserRepository`).

For more details, see the [Architecture Guide](../../docs/ARCHITECTURE.md).

### Testing Guidelines
-   **Unit Tests:** Colocated with source files (`.spec.ts`).
-   **Integration Tests:** In `test/integration` folder within each package.
-   **E2E Tests:** In top-level `e2e/` or package-level `e2e/` folders.
-   **Test Utilities:** In `packages/test-utils`.

For a complete guide, refer to the [Testing Documentation](../../docs/TESTING.md).

### Best Practices
-   Follow DDD principles for backend development.
-   Enforce separation of concerns (Domain, Application, Infrastructure).
-   Write tests for all new features.
-   Follow the established migration policy for database changes.
-   Keep documentation up-to-date.

### Current State
The `PrismaTransactionRepository` currently processes `EARN` and `REDEEM` transactions with correct atomic, double-entry accounting. However, it treats all businesses identically. It does not differentiate between business plans (e.g., "Starter" vs. "Pro") and lacks the concept of a "blocked" points balance. All redeemed points are credited to a single `pointsBalance` field, which violates the core monetization strategy outlined in the project documentation.

---

## 4. Feature Definition

### Problem Statement
The current transaction system does not support the "Starter Pack" freemium model, which is a cornerstone of the business strategy. When a customer redeems points at a business on the free "Starter" plan, the system incorrectly credits these points to the business's active balance. According to the business model, these points should be held in a "blocked" state, creating a tangible reason for the business owner to upgrade to a paid plan to unlock and reuse them. This gap prevents the monetization funnel from working as designed.

### Success Criteria (MVP)
- [ ] The `Business` data model is updated to include `plan` and `blockedPointsBalance` fields.
- [ ] When a `REDEEM` transaction is processed for a business on the `STARTER` plan, the points are credited to its `blockedPointsBalance`.
- [ ] When a `REDEEM` transaction is processed for a business on a paid plan (e.g., `BASIC`, `PRO`), the points are credited to its regular `pointsBalance`.
- [ ] The `EARN` transaction logic remains unchanged, always debiting from the regular `pointsBalance`.
- [ ] All existing and new unit/integration tests for the transaction repository pass successfully.
- [ ] A new integration test is created to specifically verify the correct crediting of blocked points for a `STARTER` plan business.

---

## 5. Technical Requirements

### Functional Requirements
- **System Requirement 1:** The system must differentiate transaction handling based on the business's subscription plan (`plan` field).
- **System Requirement 2:** For `REDEEM` transactions, if `Business.plan` is `STARTER`, the system must increment the `Business.blockedPointsBalance`.
- **System Requirement 3:** For `REDEEM` transactions, if `Business.plan` is not `STARTER`, the system must increment the `Business.pointsBalance`.
- **System Requirement 4:** The `PointLedger` entry for the business credit must correctly reflect the `balanceAfter` of the appropriate balance (either `pointsBalance` or `blockedPointsBalance`).

### Non-Functional Requirements
- **Performance:** The added logic must not introduce significant latency. The API response time for transactions should remain < 500ms (p95).
- **Data Integrity:** All balance updates must remain within the existing atomic database transaction to prevent inconsistencies.
- **Maintainability:** The code should be clean and easy to understand, with clear comments explaining the business logic for handling different plans.

---

## 6. Data & Database Changes

### Data Model Updates (Prisma Schema)
File to be modified: `packages/api/prisma/schema.prisma`

```prisma
// In packages/api/prisma/schema.prisma

// Add a new Enum for business plans
enum BusinessPlan {
  STARTER
  BASIC
  PRO
  PREMIUM
}

model Business {
  // ... existing fields like id, name, ownerId, etc.
  pointsBalance       Int          @default(0)
  
  // --- ADDITIONS ---
  plan                BusinessPlan @default(STARTER)
  blockedPointsBalance Int          @default(0)
  // --- END ADDITIONS ---

  owner    User   @relation(fields: [ownerId], references: [id])
  ownerId  String @unique
  // ... other relations
}
```

---

## 7. API & Backend Changes

### `PrismaTransactionRepository` Refactor
File to be modified: `packages/api/src/modules/transactions/infrastructure/repositories/prisma-transaction.repository.ts`

The `create` method needs to be updated. The logic for updating the business balance must be conditional.

**Modified Logic Snippet:**
```typescript
// Inside the this.prisma.$transaction block

// 1. Fetch the business first to check its plan
const businessWithPlan = await tx.business.findUnique({ where: { id: businessId } });

if (!businessWithPlan) {
  throw new Error('Business not found'); // Or a more specific domain error
}

// 2. Update business balance based on plan
const updatedBusiness = await tx.business.update({
  where: { id: businessId },
  data: {
    // EARN logic is unchanged
    ...(type === TransactionType.EARN && {
      pointsBalance: { decrement: pointsAmount },
    }),
    // REDEEM logic is now conditional
    ...(type === TransactionType.REDEEM && {
      pointsBalance: { 
        increment: businessWithPlan.plan === 'STARTER' ? 0 : pointsAmount 
      },
      blockedPointsBalance: { 
        increment: businessWithPlan.plan === 'STARTER' ? pointsAmount : 0 
      },
    }),
  },
});

// ... rest of the transaction logic ...

// 4. Create ledger entries (balanceAfter needs to be adjusted)
// ...
// For the business credit entry:
balanceAfter: businessWithPlan.plan === 'STARTER' 
  ? updatedBusiness.blockedPointsBalance 
  : updatedBusiness.pointsBalance,
// ...
```

---

## 8. Frontend Changes

No frontend changes are required for this specific task, as it is a backend-only refactor of the transaction engine.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Database and Core Logic Update
- **Task 1.1:** Modify `packages/api/prisma/schema.prisma` to add the `BusinessPlan` enum and the `plan` and `blockedPointsBalance` fields to the `Business` model.
- **Task 1.2:** Run `pnpm --filter api exec prisma migrate dev --name add_blocked_points_to_business` to create and apply the database migration.
- **Task 1.3:** Refactor the `create` method in `PrismaTransactionRepository` to implement the conditional logic for crediting `pointsBalance` vs. `blockedPointsBalance` based on the business's plan.
- **Task 1.4:** Adjust the `PointLedger` creation logic to ensure the `balanceAfter` field correctly reflects the state of the balance that was modified.

### Milestone 2: Testing and Validation
- **Task 2.1:** Update existing integration tests in `packages/api/test/integration` to account for the new plan-based logic. Ensure they test the non-`STARTER` plan scenario correctly.
- **Task 2.2:** Create a new integration test file specifically for the "Starter Plan" scenario. This test should:
    - Create a business with the `STARTER` plan.
    - Simulate a `REDEEM` transaction.
    - Assert that the `blockedPointsBalance` is incremented and the `pointsBalance` is unchanged.
- **Task 2.3:** Run all tests for the `api` package (`pnpm --filter api test`) and ensure they all pass.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Incorrect Balance Update** | Medium | High | The primary mitigation is thorough testing. The new integration test for the `STARTER` plan is non-negotiable. Code must be carefully reviewed to ensure the conditional logic is correct. |
| **Migration Failure** | Low | Medium | The Prisma migration will be tested locally first. The changes are additive, so they are unlikely to cause data loss. A backup of the development database can be made before applying. |
| **Scope Creep** | Medium | Medium | This task should not include the logic for *unlocking* points. The focus is strictly on correctly *blocking* them. The unlocking mechanism will be a separate task related to subscription management. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Analyze & Plan:** Start by reading this entire plan.
2.  **Milestone 1 (Backend):** Execute the tasks in Milestone 1 sequentially. Start with the database schema change, then the migration, and finally the repository refactor.
3.  **Milestone 2 (Testing):** After implementing the logic, immediately proceed to update and create the necessary tests. Do not consider the feature complete until all tests are passing.
4.  **Review & Finalize:** Once all tests pass, review the changes for clarity, correctness, and adherence to project standards.

### Communication Preferences
- Announce the completion of each Milestone.
- If any part of the plan is unclear or if an unforeseen technical issue arises, stop and ask for clarification before proceeding.
