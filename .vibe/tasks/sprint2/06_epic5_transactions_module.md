### **Plan: Epic 5 - Transactions Module**

This plan breaks down the development of the core transactions module, integrating business logic from the economic model into the existing architectural framework.

**1. Foundational Setup (T5.1 & T5.2)**

*   **Action:** Create the module structure within `packages/api/src/modules/transactions/`, including `domain`, `application`, and `infrastructure` subdirectories.
*   **Action:** Update the Prisma schema (`packages/api/prisma/schema.prisma`) to define the core data models.
    *   **`Transaction` Model:** Will store details of each operation (`EARN`, `REDEEM`), including `id`, `type`, `pointsAmount`, `status`, `businessId`, `customerId`, and `auditHash`.
    *   **`PointLedger` Model:** The double-entry accounting table. Each transaction will generate at least two entries here (a debit and a credit) to ensure the books are always balanced. Fields will include `id`, `accountId` (for customer/business), `transactionId`, `debit`, `credit`, and `balanceAfter`.
    *   **Update `Business` & `Customer` Models:** Add a `pointsBalance` field to both models to store their current point totals.

**2. Implement "Earn Points" Use Case (T5.3)**

*   **Layer:** `application`
*   **Action:** Create an `EarnPointsUseCase` service.
*   **Logic:**
    1.  Accept a DTO with `businessId`, `customerId`, and `purchaseAmount`.
    2.  **Validate:** Check if the `Business` has sufficient points in its own balance to issue the reward.
    3.  **Execute Atomically (T5.6):** Use Prisma's `$transaction` to perform the following in a single, atomic operation:
        *   Create a `Transaction` record with type `EARN`.
        *   Decrement the `Business` `pointsBalance`.
        *   Increment the `Customer` `pointsBalance`.
        *   Create two `PointLedger` entries: a debit for the business, a credit for the customer.
    4.  **Audit (T5.7):** Generate a SHA256 hash of the transaction details and save it in the `Transaction` record.
    5.  **Cache (T5.8):** Invalidate the Redis cache for the balances of the involved business and customer.

**3. Implement "Redeem Points" Use Case (T5.4 & T5.5)**

*   **Layer:** `application`
*   **Action:** Create a `RedeemPointsUseCase` service.
*   **Logic:**
    1.  Accept a DTO with `businessId`, `customerId`, `pointsToRedeem`, and `ticketTotal`.
    2.  **Validate (T5.5):**
        *   Ensure the `Customer` has enough `pointsBalance`.
        *   Verify that the value of `pointsToRedeem` does not exceed 30% of the `ticketTotal`.
    3.  **Execute Atomically (T5.6):** Use Prisma's `$transaction` for the following:
        *   Create a `Transaction` record with type `REDEEM`.
        *   Decrement the `Customer` `pointsBalance`.
        *   Increment the `Business` `pointsBalance` (as points return to the business).
        *   Create two `PointLedger` entries: a debit for the customer, a credit for the business.
    4.  **Audit (T5.7):** Generate and store the SHA256 audit hash.
    5.  **Cache (T5.8):** Invalidate the Redis cache for both balances.

**4. Expose Endpoints (Infrastructure Layer)**

*   **Layer:** `infrastructure`
*   **Action:** Create a `TransactionsController` with two endpoints:
    *   `POST /transactions/earn`: Protected endpoint that executes the `EarnPointsUseCase`.
    *   `POST /transactions/redeem`: Protected endpoint that executes the `RedeemPointsUseCase`.
*   **Action:** Implement the `TransactionRepository` using Prisma, including logic to interact with Redis for caching balances.

**5. Testing Strategy**

*   **Unit Tests:** Validate the business rules in the Use Cases (e.g., redemption limit calculation, hash generation) without touching the database.
*   **Integration Tests:** Verify the complete flow for `earn` and `redeem`, ensuring the Prisma `$transaction` works correctly and the database state (balances and ledger) is consistent.
*   **E2E Tests:** Create a test scenario simulating a user making a purchase, earning points, and then redeeming them at another business.
