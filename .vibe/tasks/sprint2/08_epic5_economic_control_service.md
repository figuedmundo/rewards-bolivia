# AI Task: Implement Economic Control Service

> **Purpose**: This document outlines the plan for creating a centralized service to monitor and manage the health of the points economy, as defined in the project's business and economic models.

---

## 1. Task Overview

### Task Title
**Title:** Implement EconomicControlService (T5.9)

### Goal Statement
**Goal:** To create a centralized `EconomicControlService` within the `transactions` module that encapsulates key economic calculations, provides metrics for system health monitoring, and exposes functions for future dynamic adjustments, ensuring the long-term stability and sustainability of the points economy.

---

## 2. Strategic Analysis & Solution Options

> **AI Agent Note:** Strategic analysis is not required. This task involves creating a new service that follows the established architectural pattern of the project (DDD, services in the application layer). The implementation is a direct translation of the economic rules defined in the project documentation into a dedicated service.

---

## 3. Project Context & Current State

### Technology Stack & Architecture
This feature will be built within the established Rewards Bolivia technical environment, following the Modular Monolith, DDD, and Clean Architecture patterns.

### Current State
The `transactions` module currently handles `EARN` and `REDEEM` operations. A basic `burn` fee is calculated within the `PrismaTransactionRepository`. However, economic logic and metric calculations are scattered or non-existent. There is no central service responsible for monitoring the overall health of the points economy, such as calculating the burn ratio or the percentage of active points. This makes it difficult to assess the system's stability or implement automated economic adjustments.

---

## 4. Feature Definition

### Problem Statement
The long-term health of the Rewards Bolivia ecosystem depends on maintaining a stable and predictable points economy. The system currently lacks a centralized authority to monitor key economic indicators, such as the ratio of active points to issued points, the overall burn rate, and redemption velocity. Without this, the platform cannot proactively identify potential economic imbalances (e.g., hyper-inflation of points) or implement automated control mechanisms as described in the economic model.

### Success Criteria (MVP)
- [x] A new `EconomicControlService` is created within the `transactions/application/services` directory.
- [x] The service is injectable and integrated into the `transactions` module.
- [x] The service exposes methods to calculate and retrieve key economic metrics:
    - `getBurnRatio()`: (Points Burned / Points Redeemed)
    - `getActivePointsPercentage()`: (Active Points / Issued Points)
    - `getRedemptionRate()`: (Points Redeemed / Points Issued)
- [x] The service includes a placeholder method `checkAndAdjustEmissionRates()` that can be used in the future to implement dynamic rule adjustments.
- [x] The `GET /transactions/economy-stats` endpoint in `TransactionsController` is refactored to use the new `EconomicControlService` as its single source of truth for economic data.
- [x] Unit tests are created for the `EconomicControlService` to validate the correctness of its calculations.

---

## 5. Technical Requirements

### Functional Requirements
- **System Requirement 1:** The `EconomicControlService` must be able to query the `PointLedger` to aggregate data for points issued (`EARN`), redeemed (`REDEEM`), and burned (`BURN`).
- **System Requirement 2:** The service must provide public methods to calculate the key economic indicators as defined in the "Economía de Puntos y Reglas" document.
- **System Requirement 3:** The calculations must handle division-by-zero errors gracefully (e.g., if no points have been redeemed, the burn ratio should be 0).
- **System Requirement 4:** The service must be designed to be stateless, performing calculations on demand based on data from the repository layer.

### Non-Functional Requirements
- **Performance:** Metric calculations should be efficient. If they become slow, they should be designed to be cacheable or moved to a background worker process in the future. For MVP, direct calculation is acceptable.
- **Maintainability:** The service should be the single source of truth for economic calculations. Any future economic rules or metrics should be added to this service.
- **Testability:** The service must be easily testable in isolation, with dependencies (like repositories) mocked.

---

## 7. API & Backend Changes

### New Service: `EconomicControlService`
- **File:** `packages/api/src/modules/transactions/application/services/economic-control.service.ts`
- **Class:** `EconomicControlService`
- **Dependencies:** `ITransactionRepository` (or a more specific ledger-querying repository if one is created).
- **Methods:**
    - `getEconomicStats(): Promise<EconomicStatsDto>`: Returns an object with all key metrics.
    - `checkAndAdjustEmissionRates(): Promise<void>`: Placeholder for future dynamic rule adjustments.
    - Private helper methods for individual metric calculations.

### Controller Refactor: `TransactionsController`
- **File:** `packages/api/src/modules/transactions/infrastructure/controllers/transactions.controller.ts`
- **Change:** The `GET /economy-stats` endpoint will no longer contain any calculation logic. It will inject `EconomicControlService` and call `getEconomicStats()`, returning the result directly.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Service Creation and Integration
- **Task 1.1:** Create the `economic-control.service.ts` file in `packages/api/src/modules/transactions/application/services/`.
- **Task 1.2:** Define the `EconomicControlService` class with an injectable decorator.
- **Task 1.3:** Implement the constructor to inject the repository needed for ledger queries.
- **Task 1.4:** Implement the public `getEconomicStats` method and the private helper methods for calculating `burnRatio`, `activePointsPercentage`, and `redemptionRate`.
- **Task 1.5:** Implement the placeholder `checkAndAdjustEmissionRates` method.
- **Task 1.6:** Add the new service to the `providers` array in `transactions.module.ts`.

### Milestone 2: Controller Refactor and Testing
- **Task 2.1:** Refactor the `TransactionsController` to inject and use `EconomicControlService` for the `/economy-stats` endpoint.
- **Task 2.2:** Create a unit test file `economic-control.service.spec.ts`.
- **Task 2.3:** Write unit tests for `EconomicControlService`, mocking the repository dependency and providing sample ledger data to verify the correctness of each calculation. Test edge cases like division by zero.
- **Task 2.4:** Update the integration tests for the `/economy-stats` endpoint to ensure it continues to work correctly after the refactor.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Incorrect Calculations** | Medium | High | The primary risk is a bug in the calculation logic. This will be mitigated by comprehensive unit tests covering various scenarios and edge cases (e.g., no transactions, no redemptions). |
| **Performance on Large Datasets** | Low (for now) | Medium | As the `PointLedger` table grows, direct aggregation queries could become slow. This is a future concern. The design (centralized service) makes it easy to introduce caching or a materialized view pattern later without changing the rest of the application. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Analyze & Plan:** Start by reading this entire plan.
2.  **Milestone 1 (Service):** Execute the tasks in Milestone 1. Create the service file, define the class and methods, and integrate it into the module.
3.  **Milestone 2 (Testing & Refactor):** Proceed to refactor the controller and write the unit tests for the new service. Ensure all existing and new tests pass.
4.  **Review & Finalize:** Review the changes for clarity, correctness, and adherence to project standards. Ensure the service is the single source of truth for economic stats.

---

## Progress Report

### Milestone 1: Service Creation and Integration - ✅ DONE
- **Task 1.1 - 1.6:**
  - Created `ILedgerRepository` and `PrismaLedgerRepository` to handle ledger queries, avoiding a circular dependency.
  - Created `EconomicControlService` with methods to calculate economic stats.
  - Injected `ILedgerRepository` into `EconomicControlService`.
  - Refactored `PrismaTransactionRepository` to remove the dependency on `EconomicControlService`.
  - Refactored `RedeemPointsUseCase` to calculate the `burnAmount` and pass it to the repository.
  - Updated `transactions.module.ts` with the new providers.

### Milestone 2: Controller Refactor and Testing - ✅ DONE
- **Task 2.1:**
  - Verified that `TransactionsController` uses `EconomicControlService` for the `/economy-stats` endpoint.
- **Task 2.2 & 2.3:**
  - Created `economic-control.service.spec.ts` with unit tests covering all calculations and edge cases.
- **Task 2.4:**
  - Updated `transactions.controller.integration.spec.ts` to align with the new `EconomicStats` interface.
