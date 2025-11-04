# AI Task: Comprehensive Testing for Transactions Module

> **Purpose**: This document outlines the testing strategy for the Transactions Module to ensure its correctness, reliability, and performance.

---

## 1. Task Overview

### Task Title
**Title:** Comprehensive Testing for Transactions Module (Epic 5)

### Goal Statement
**Goal:** To ensure the transactions module is robust, reliable, and secure by implementing a full suite of unit, integration, and E2E tests covering all success and failure scenarios for the earn and redeem flows.

---

## 3. Project Context & Current State

### Current State
The `earn` and `redeem` features are assumed to be implemented. This task focuses solely on verifying their correctness and performance through automated testing.

---

## 4. Feature Definition

### Problem Statement
The economic core of the application handles real value (points). It requires the highest level of testing to prevent bugs that could lead to financial inconsistencies, data corruption, or loss of user trust. A comprehensive test suite is non-negotiable.

### Success Criteria (MVP)
- [ ] Unit test coverage for the `EarnPointsUseCase` and `RedeemPointsUseCase` is above 80%.
- [ ] Integration tests validate the atomicity of database transactions for both `earn` and `redeem` flows.
- [ ] Integration tests confirm that all validation rules (e.g., insufficient balance, redemption limits) work correctly at the API level.
- [ ] E2E tests successfully simulate a complete user journey: registration -> earning points -> redeeming points.
- [ ] Performance tests confirm the API endpoints meet their latency requirements under load.

---

## 5. Technical Requirements

### Functional Requirements
- Tests must cover successful `earn` and `redeem` operations.
- Tests must cover failure cases:
    - Insufficient business points to `earn`.
    - Insufficient customer points to `redeem`.
    - Redemption amount violating the 30% rule.
    - Invalid inputs (e.g., negative numbers).

### Non-Functional Requirements
- **Performance:** Load tests should confirm API latency is < 500ms (p95) under a load of 100 requests/second.
- **Reliability:** Tests must verify that failed transactions result in a complete rollback, with no partial data changes left in the database.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Unit & Integration Tests
- **Task 1.1 (Unit):** Write unit tests for `EarnPointsUseCase`. Mock the repository and focus on input validation and correct calls to the repository.
- **Task 1.2 (Unit):** Write unit tests for `RedeemPointsUseCase`. Mock the repository and focus on validating the 30% rule and balance checks.
- **Task 1.3 (Integration):** Write integration tests for the `POST /transactions/earn` endpoint. Use a test database to verify that a successful call correctly updates the `User` and `Business` balances and creates the corresponding `Transaction` and `PointLedger` records.
- **Task 1.4 (Integration):** Write integration tests for the `POST /transactions/redeem` endpoint, covering both success and all validation failure cases. Verify the database state after each test.
- **Task 1.5 (Integration):** Write a specific integration test to simulate a concurrent request scenario to check for race conditions, ensuring the atomic transactions hold.

### Milestone 2: End-to-End (E2E) and Performance Tests
- **Task 2.1 (E2E):** Create a new Playwright test file in `e2e/transactions.spec.ts`.
- **Task 2.2 (E2E):** Write a test script that:
    1. Creates a new Customer and a new Business via API.
    2. Simulates the Business earning points for the Customer.
    3. Simulates the Customer redeeming those points at the Business.
    4. Asserts that the final balances are correct.
- **Task 2.3 (Performance):** Create a k6 script (`scripts/load-testing/transactions.js`) to run load tests against the deployed `earn` and `redeem` endpoints.
- **Task 2.4 (Performance):** Configure the k6 script to run for 100 virtual users for 1 minute and assert that the p95 response time is below 500ms.

---
## 11. AI Agent Instructions

### Implementation Workflow
1.  **Start with Unit Tests:** Ensure all business logic in the application layer is correct.
2.  **Proceed to Integration Tests:** Write tests for the API endpoints using Supertest and a dedicated test database. This is the most critical phase for this module.
3.  **Develop E2E Tests:** Use Playwright to simulate the full user journey.
4.  **Run Performance Tests:** Use k6 to validate the non-functional requirements once the API is deployed to a staging environment.
