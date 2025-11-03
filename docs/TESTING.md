# Testing Conventions and Strategy

> **Purpose**: This document provides a comprehensive guide to the testing strategy, conventions, and best practices for the Rewards Bolivia project. Its goal is to ensure a high level of quality, maintainability, and confidence in our codebase.

---

## 1. Testing Philosophy

Our testing philosophy is based on the "Testing Trophy" model, which prioritizes a balanced mix of different types of tests to maximize return on investment. We focus on:

-   **Static Analysis:** Catching errors before the code is even run, using TypeScript and ESLint.
-   **Unit Tests:** Forming a solid base for our testing pyramid.
-   **Integration Tests:** Ensuring that different parts of our system work together correctly.
-   **End-to-End (E2E) Tests:** Verifying that our application works as expected from a user's perspective.

## 2. Types of Tests and Their Placement

This section outlines the different types of tests we use, where they are located in the monorepo, and their primary purpose.

### Unit Tests

*   **Purpose:** To test individual units of code (functions, classes, components) in isolation from their dependencies.
*   **Placement:** Colocated with the code they test, primarily using a `.spec.ts` or `.test.ts` suffix next to the implementation file. For large modules, a dedicated `__tests__` subfolder can be used to reduce visual noise and improve readability, but consistency within that module's boundary is crucial.
*   **Benefit:** Provides fast feedback during development and ensures code correctness at a granular level. They are cheap to write and fast to run.
*   **Example:** `packages/api/src/modules/transactions/transactions.service.spec.ts` for `transactions.service.ts`.

### Integration Tests

*   **Purpose:** To verify interactions between multiple units or components, often involving external dependencies like databases or other services (mocked or real ephemeral instances).
*   **Placement:** Live in a package-level `test/integration` folder (e.g., `packages/api/test/integration`).
*   **Benefit:** Ensures that different parts of a module work correctly together. They provide more confidence than unit tests but are slower to run.
*   **Example:** `packages/api/test/integration/transactions.integration.spec.ts` to test a service interacting with its repository and a database.

### End-to-End (E2E) Tests

*   **Purpose:** To validate complete user journeys and system behavior across all integrated components (frontend, backend, database, worker).
*   **Placement:** Can be at the top-level `e2e/` directory for cross-package user flows, or within specific packages like `packages/web/e2e` and `packages/api/test/e2e` for more focused E2E scenarios.
*   **Benefit:** Provides the highest level of confidence that the entire application works as expected from a user's perspective. They are the most expensive to write and maintain, and the slowest to run.
*   **Example:** `e2e/user-journey.spec.ts` for a full login and transaction flow.

### Contract / API Contract Tests

*   **Purpose:** To ensure that the API (backend) adheres to its defined contract (e.g., OpenAPI specification) and that consumers (frontend, mobile, SDK) are compatible with it.
*   **Placement:** Alongside `packages/shared-types` or within `packages/api/test/contracts`.
*   **Benefit:** Prevents breaking changes between API producers and consumers.
*   **Example:** `packages/shared-types/test/contracts.spec.ts` to validate DTOs against the OpenAPI spec.

## 3. Shared Test Utilities

*   **Purpose:** To provide reusable deterministic test data, helper functions, mock implementations, and setup/teardown scripts for all test types across the monorepo.
*   **Placement:** Centralized in a shared package like `packages/test-utils`.
*   **Benefit:** Promotes consistency, reduces duplication, and simplifies test setup.

## 4. Naming and File Conventions

*   **Unit Tests:** Use `.spec.ts` or `.test.ts` suffix for colocated tests. If a `__tests__` subfolder is used within a large module, ensure consistency in its usage.
*   **Integration Tests:** Use `*.integration.spec.ts` suffix within `test/integration` folders.
*   **E2E Tests:** Use `*.e2e-spec.ts` suffix within `test/e2e` folders or `*.cy.ts` / `*.spec.ts` for UI E2E frameworks.
*   **Snapshot Files:** Store in `__snapshots__` directories adjacent to the test files that generate them.
*   **Test Data/Fixtures:** Located in `packages/test-utils/src/fixtures/*`.

## 5. What Makes a Good Test?

A good test should be:

*   **Trustworthy:** It should fail only when there is a real bug. Flaky tests erode trust in the test suite.
*   **Readable:** A test should be easy to understand. It should clearly describe what it is testing and why. Use clear and descriptive names for your tests.
*   **Maintainable:** When a feature changes, the corresponding tests should be easy to update. Avoid complex logic in tests.
*   **Fast:** Tests should run as quickly as possible to provide rapid feedback. This is especially true for unit tests.

### Example: A Good Unit Test

'''typescript
// packages/api/src/domain/services/points.service.ts
export class PointsService {
  calculateBonus(points: number): number {
    if (points > 1000) {
      return Math.floor(points * 0.1);
    }
    return 0;
  }
}

// packages/api/src/domain/services/points.service.spec.ts
import { PointsService } from './points.service';

describe('PointsService', () => {
  let service: PointsService;

  beforeEach(() => {
    service = new PointsService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateBonus', () => {
    it('should return 10% bonus for points over 1000', () => {
      // Arrange
      const points = 1200;
      const expectedBonus = 120;

      // Act
      const bonus = service.calculateBonus(points);

      // Assert
      expect(bonus).toBe(expectedBonus);
    });

    it('should return 0 bonus for points equal to 1000', () => {
      // Arrange
      const points = 1000;
      const expectedBonus = 0;

      // Act
      const bonus = service.calculateBonus(points);

      // Assert
      expect(bonus).toBe(expectedBonus);
    });

    it('should return 0 bonus for points under 1000', () => {
      // Arrange
      const points = 500;
      const expectedBonus = 0;

      // Act
      const bonus = service.calculateBonus(points);

      // Assert
      expect(bonus).toBe(expectedBonus);
    });
  });
});
'''

### Example: What to Avoid

*   **Testing implementation details:** Don't test private methods. Test the public API of your modules.
*   **Complex logic in tests:** Tests should be simple and straightforward. If a test is hard to understand, it's a sign that it's too complex.
*   **Multiple assertions for different concepts:** A single test should ideally test a single concept.
*   **Relying on external services:** Unit tests should not rely on external services like databases or APIs. Use mocks or stubs instead.

---
