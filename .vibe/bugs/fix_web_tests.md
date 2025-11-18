# AI Task: Fix Failing Tests in `packages/web`

> **Purpose**: This document outlines the plan to analyze, diagnose, and fix the failing unit tests in the `packages/web` package, ensuring the frontend codebase is stable and reliable.

---

## 📋 Template Metadata

- **Template Version**: 1.1.0
- **Template Type**: Bug Fixes & Refactoring
- **Last Updated**: 2025-11-18
- **Project Name**: Rewards Bolivia
- **Task ID**: `fix-web-tests-20251118`

---

## 🎯 Task Definition

### Issue Summary
Multiple unit tests in the `packages/web` frontend application are failing. The errors point to two core issues: an incorrect singleton implementation in `ApiService` and improper mocking of the generated SDK in `wallet-api.spec.ts`.

### Reported Symptoms
List all observable problems:
- [x] `ApiService` singleton test fails, indicating multiple instances are being created.
- [x] `ApiService` tests for `axios` instance creation and interceptor attachment fail.
- [x] Multiple tests in `wallet-api.spec.ts` fail with `TypeError: () => ({}) is not a constructor`.
- [x] `getBalance` test in `wallet-api.spec.ts` fails to assert the correct error, instead throwing the constructor TypeError.

### User Impact
- **Severity**: High
- **Affected Users**: Developers
- **Workaround Available**: No
- **Business Impact**: This issue blocks the CI/CD pipeline, prevents developers from verifying the correctness of their changes, and erodes confidence in the test suite. It must be fixed to ensure code quality and development velocity.

---

## 🏗️ Project Context

### Project Information
```yaml
Project Name: Rewards Bolivia
Architecture: Monorepo (pnpm workspaces) with a modular monolith backend and a separate frontend.
Technology Stack:
  Frontend:
    - Framework: React (TypeScript)
    - Build Tool: Vite
    - Styling: Tailwind CSS
    - Components: shadcn/ui, lucide-react
  Testing:
    - Frontend: Vitest, React Testing Library
```

### Project Paths & Commands
```yaml
Project Paths:
  Root: /Users/edmundo.figueroaherbas@medirect.com.mt/projects/personal/rewards-bolivia
  Web (Frontend): packages/web
  SDK: packages/sdk

Key Commands:
  - Run Web Tests: `pnpm --filter web test`
  - Lint Web: `pnpm --filter web lint`
```

---

## 🔍 PHASE 1: Initial Analysis

### Step 1.1: Understand the Request

#### Problem Understanding
**What**: Unit tests for `api.ts` and `wallet-api.ts` are failing due to a broken singleton pattern and incorrect mocking of a dependency (`Configuration` from the SDK).
**Expected**: All unit tests in the `packages/web` package should pass successfully.
**Actual**: 12 tests are failing across `api.test.ts` and `wallet-api.spec.ts`.
**Type**: Bug / Code Quality

### Step 1.2: Identify Affected Areas

#### Analysis Checklist:
- [x] **Modules Affected**: `api`, `wallet-api`
- [x] **Layers Involved**: Frontend Service Layer, Testing Mocks

#### Files to Investigate:
1.  **Primary Files**:
    - `packages/web/src/lib/api.ts`: Source of the incorrect singleton implementation.
    - `packages/web/src/lib/wallet-api.ts`: Uses the SDK `Configuration` class.
    - `packages/web/src/lib/api.test.ts`: Contains failing tests for `ApiService`.
    - `packages/web/src/lib/wallet-api.spec.ts`: Contains failing tests due to mocking issues.
2.  **Secondary Files**:
    - `packages/sdk/src/configuration.ts`: The `Configuration` class that is being mocked.
    - `packages/web/test/setup.ts`: To check for global mock configurations.

### Step 1.4: Root Cause Analysis

#### Root Cause 1: Incorrect Singleton Implementation
**Symptom**: `expect(instance1).toBe(instance2)` fails in `api.test.ts`.
**Immediate Cause**: `ApiService.getInstance()` is creating a new instance on every call.
**Root Cause**: The `ApiService` class does not correctly cache and return the single instance. The static `instance` property is likely being re-assigned or not checked properly before creating a new object.

**Evidence**:
1. The test `should be a singleton` fails with an `Object.is` equality error, which confirms two different object references.
2. Subsequent tests for `axios.create` and interceptor setup also fail, which is consistent with the instance being re-created without the mocks applied during the test setup.

#### Root Cause 2: Improper Mocking in `wallet-api.spec.ts`
**Symptom**: `TypeError: () => ({}) is not a constructor` in `wallet-api.spec.ts`.
**Immediate Cause**: The code is executing `new Configuration(...)`, but `Configuration` is not a constructor function.
**Root Cause**: The mock setup for the `packages/sdk` is incorrect. `vi.mock` is likely providing a factory that returns a plain object for the `Configuration` export, not a class. The mock should return a constructor function (a class).

**Evidence**:
1. The stack trace points directly to `const sdkConfig = new Configuration(...)` in `wallet-api.ts`.
2. The error message confirms that the value being used as `Configuration` is not a constructor, which is a classic sign of a bad mock.

---

## 🎯 PHASE 2: Solution Planning

### Step 2.1: Define Success Criteria

**Functional Requirements**:
- [ ] `ApiService.getInstance()` must always return the same object instance throughout the application's lifecycle.
- [ ] The SDK's `Configuration` class must be correctly mocked in tests to allow for instantiation with `new`.

**Technical Requirements**:
- [ ] All tests in `packages/web/src/lib/api.test.ts` must pass.
- [ ] All tests in `packages/web/src/lib/wallet-api.spec.ts` must pass.
- [ ] The command `pnpm --filter web test --run 2>&1` must complete successfully with no errors.
- [ ] The code changes must pass linting checks (`pnpm --filter web lint`).

**Acceptance Tests**:
1. **Test**: Run `pnpm --filter web test -- --run src/lib/api.test.ts 2>&1`.
   **Expected**: All 3 tests in the suite pass.
2. **Test**: Run `pnpm --filter web test -- --run src/lib/wallet-api.spec.ts 2>&1`.
   **Expected**: All 9 tests in the suite pass.

### Step 2.2: Break Down into Steps

#### Step 1: Fix the `ApiService` Singleton Implementation
**Priority**: Critical
**Package**: `web`
**Objectives**:
- [ ] Modify `packages/web/src/lib/api.ts` to ensure only one instance of `ApiService` is ever created.
**Changes Required**:
- `packages/web/src/lib/api.ts`: Update the `getInstance` method and the static `instance` property to correctly implement the singleton pattern.
**Verification**:
- [ ] The `should be a singleton` test in `api.test.ts` passes.

---

#### Step 2: Correct the Mock for `Configuration`
**Priority**: Critical
**Package**: `web`
**Dependencies**: None
**Objectives**:
- [ ] Update the mock configuration in `packages/web/src/lib/wallet-api.spec.ts` to correctly mock the `Configuration` class from the SDK.
**Changes Required**:
- `packages/web/src/lib/wallet-api.spec.ts`: Change `vi.mock` to provide a mock class for `Configuration` that can be instantiated.
**Verification**:
- [ ] The `TypeError: () => ({}) is not a constructor` is resolved, and tests in `wallet-api.spec.ts` begin to execute their assertions.

---

#### Step 3: Verify All Web Tests Pass
**Priority**: High
**Package**: `web`
**Dependencies**: Step 1, Step 2
**Objectives**:
- [ ] Run the entire test suite for the `web` package and ensure all tests pass.
**Changes Required**:
- No new changes, this is a verification step.
**Verification**:
- [ ] The command `pnpm --filter web test` exits with code 0.

---
