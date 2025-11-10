# Verification Guide for Recent Changes

This document provides instructions on how to test and verify the recent changes made to the project's documentation, testing setup, and QA pipeline.

## Summary of Changes

1.  **Documentation Overhaul:**
    *   Updated `docs/ARCHITECTURE.md`, `docs/DB_MIGRATIONS.md`, `docs/TSDR.md`, and `docs/RUNBOOKS/DEPLOYMENT.md`.
    *   Created a new, comprehensive `docs/TESTING.md` with detailed testing conventions.
    *   Updated the `.vibe/templates/task_template.md` and `.vibe/templates/bugfix_refactor_template.md` with the latest project context.
    *   Created a new root `README.md` file with best practices.

2.  **Frontend Test Refactoring (`packages/web`):**
    *   Moved unit tests to be colocated with the source files in `src/` to align with our primary testing strategy.
    *   Created a new `test/integration` directory for frontend integration tests.
    *   Updated the `vite.config.ts` to recognize the new test file locations.

3.  **QA Pipeline Automation:**
    *   **Code Coverage:** Configured both frontend (Vitest) and backend (Jest) test runners to generate code coverage reports. The CI pipeline is now set up to upload these reports to Codecov.
    *   **E2E Tests:** Rewrote the `e2e/user-journey.spec.ts` to provide a stable and focused test for the user login flow.
    *   **Pre-commit Hooks:** Set up `husky` and `lint-staged` to automatically run `eslint --fix` and `prettier --write` on staged files before each commit.
    *   **Commit Message Linting:** Configured `commitlint` to ensure all commit messages follow the Conventional Commits standard.

## How to Verify the Changes

### 1. Install Dependencies

First, ensure you have all the necessary dependencies installed, including the newly added tools (`turbo`, `husky`, `commitlint`, etc.).

```bash
pnpm install
```

### 2. Run All Tests

Run all unit, integration, and E2E tests to confirm that everything is working correctly after the refactoring.

**A. Run Unit & Integration Tests:**

This command will run all tests in the `api` and `web` packages and generate coverage reports in their respective `coverage/` directories.

```bash
pnpm test
```
*   **Expected Outcome:** All tests should pass. You should see new `coverage` folders inside `packages/api` and `packages/web`.

**B. Run End-to-End (E2E) Tests:**

This command will start the development servers and run the Playwright E2E test for the login flow.

```bash
npx playwright test
```
*   **Expected Outcome:** The Playwright test should pass, successfully simulating a user login.

### 3. Verify Pre-commit Hooks

To test the `pre-commit` hook, you can intentionally introduce a formatting error in a file.

1.  **Modify a file:** Open a file like `packages/web/src/App.tsx` and add extra spaces or mess up the indentation.
2.  **Stage the file:**
    ```bash
    git add packages/web/src/App.tsx
    ```
3.  **Try to commit:**
    ```bash
    git commit -m "test: pre-commit hook"
    ```
*   **Expected Outcome:** The commit should **fail**. `lint-staged` will run `eslint` and `prettier`, which will automatically fix the formatting issues. You will then need to `git add` the file again to commit the corrected version.

### 4. Verify Commit Message Linting

To test the `commit-msg` hook, try to create a commit with a non-conventional message.

```bash
# Make sure you have a file staged to commit
git add .

# Attempt to commit with an invalid message
git commit -m "this is a bad commit message"
```
*   **Expected Outcome:** The commit should be **aborted**. `commitlint` will show an error indicating that the message does not follow the Conventional Commits format (e.g., `feat: ...`, `fix: ...`, `docs: ...`).

---
