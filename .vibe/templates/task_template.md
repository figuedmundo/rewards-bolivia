# AI Task Template: Rewards Bolivia Feature Development

> **Purpose**: This template provides a systematic framework for planning and executing new features for the Rewards Bolivia project. It ensures consistency, quality, and alignment with the project's architectural and product goals.

---

## 1. Task Overview

### Task Title
**Title:** [Brief, descriptive title - e.g., "Implement Points Redemption Flow" or "Build Business Analytics Dashboard"]

### Goal Statement
**Goal:** [Clear statement of the end result you want and the business/user value it provides. e.g., "To allow customers to seamlessly redeem their points for discounts at any partner business, reinforcing the value of the ecosystem and driving repeat business."]

---

## 2. Strategic Analysis & Solution Options

> **AI Agent Note:** Use your judgment to determine when this strategic analysis is needed vs. when direct implementation is appropriate.
>
> **Conduct Strategic Analysis When:**
> - Multiple viable technical approaches exist.
> - Trade-offs between different solutions are significant (e.g., performance vs. complexity).
> - The feature could be implemented with different architectural patterns.
> - The decision will have a long-term impact on maintainability or scalability.
>
> **Skip Strategic Analysis When:**
> - The task is a straightforward bug fix or minor enhancement.
> - A clear implementation pattern is already established in the surrounding codebase.
> - The change is small, isolated, and has minimal architectural impact.
>
> **Default Behavior:** When in doubt, provide a brief analysis. It's better to document a decision than to make an unstated assumption.

### Problem Context
[Restate the problem and why it needs a strategic decision. What are the core tensions or trade-offs to consider?]

### Solution Options Analysis

#### Option 1: [Solution Name]
**Approach:** [Brief description of this solution's architecture and logic.]

**Pros:**
- [Advantage 1: e.g., "Fastest to implement."]
- [Advantage 2: e.g., "Best performance under load."]
- [Advantage 3: e.g., "Aligns with existing patterns."]

**Cons:**
- [Disadvantage 1: e.g., "Higher technical debt."]
- [Disadvantage 2: e.g., "Less scalable for future requirements."]
- [Disadvantage 3: e.g., "More complex to maintain."]

**Implementation Complexity:** [Low/Medium/High] - [Justification]
**Risk Level:** [Low/Medium/High] - [Primary risk factors]

#### Option 2: [Solution Name]
**Approach:** [Brief description of this solution's architecture and logic.]

**Pros:**
- [Advantage 1]
- [Advantage 2]
- [Advantage 3]

**Cons:**
- [Disadvantage 1]
- [Disadvantage 2]
- [Disadvantage 3]

**Implementation Complexity:** [Low/Medium/High] - [Justification]
**Risk Level:** [Low/Medium/High] - [Primary risk factors]

*(Add more options as needed)*

### Recommendation and Justification

**Recommended Solution:** Option [X] - [Solution Name]

**Why this is the best choice:**
1.  **[Primary Reason]:** [Explain how it best aligns with the project's core goals, like UX speed, scalability, or maintainability.]
2.  **[Secondary Reason]:** [Address the key trade-offs and why this option's compromises are acceptable.]
3.  **[Long-term Consideration]:** [Explain how this choice sets the project up for future success.]

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
│   ├───shared-types/ # Shared TypeScript types and DTOs, organized by domain (e.g., shared-types/src/auth, shared-types/src/user)
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
[Describe what exists today - what's working, what's broken, what's missing relevant to this new feature. e.g., "Currently, users can earn points, but the redemption flow is not implemented. The user wallet UI exists but the 'Redeem' button is disabled."]

---

## 4. Feature Definition

### Problem Statement
[Detailed explanation of the problem, including user impact, pain points, and why it needs to be solved now. e.g., "Users have accumulated points but have no way to use them, which breaks the core loop of the loyalty program and diminishes perceived value. Businesses cannot receive points, hindering the circular economy."]

### Success Criteria (MVP)
- [ ] A customer can successfully redeem points for a discount via a QR code scan at a business.
- [ ] The transaction must be reflected in the customer's and business's balance in < 1.5 seconds.
- [ ] The transaction is correctly recorded in the off-chain database and included in the next daily audit hash.
- [ ] The business dashboard accurately displays the points received from redemptions.

---

## 5. Technical Requirements

### Functional Requirements
- **User Story 1:** As a Customer, I want to select an amount of points to use so that I can get a discount on my purchase.
- **User Story 2:** As a Business Owner, I want to securely accept points as payment so that I can attract more customers.
- **System Requirement 1:** The system must validate that the user has sufficient points before authorizing a redemption.
- **System Requirement 2:** The system must enforce the maximum redemption limit (e.g., 30% of the total ticket value).

### Non-Functional Requirements
- **Performance:** API response time for redemption requests must be < 500ms (p95). The end-to-end user-perceived latency (scan to confirmation) must be < 1.5s.
- **Security:** All redemption transactions must be atomic and logged for auditing. QR codes for redemption must be dynamic and single-use.
- **Reliability:** The system must guarantee that points are debited and credited correctly even in cases of network failure (e.g., through transactional rollbacks).
- **Usability:** The redemption process for both customer and business should require no more than 3 taps.

---

## 6. Data & Database Changes

### Database Schema Changes
```sql
-- Example: Add a 'redemptions' table
CREATE TABLE "redemptions" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "points_redeemed" INTEGER NOT NULL,
    "value_in_bs" DECIMAL(10, 2) NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redemptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "redemptions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Add other necessary indexes and constraints
CREATE INDEX "redemptions_customer_id_idx" ON "redemptions"("customer_id");
CREATE INDEX "redemptions_business_id_idx" ON "redemptions"("business_id");
```

### Data Model Updates (Prisma Schema)
```prisma
// Example: Update to prisma.schema
model Redemption {
  id              String      @id @default(cuid())
  customerId      String
  businessId      String
  pointsRedeemed  Int
  valueInBs       Decimal
  createdAt       DateTime    @default(now())
  transaction     Transaction @relation(fields: [transactionId], references: [id])
  transactionId   String

  @@index([customerId])
  @@index([businessId])
}

model Transaction {
  // ... existing fields
  redemption Redemption?
}
```

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
  "business_qr_code": "dynamic_qr_string_from_business_pos",
  "points_to_redeem": 100
}
```

**Success Response (200 OK)**:
```json
{
  "transaction_id": "clxkj123...",
  "status": "completed",
  "points_redeemed": 100,
  "discount_value_bs": "3.00",
  "new_customer_balance": 450,
  "business_name": "Café Aroma"
}
```

**Error Response (400 Bad Request)**:
```json
{
  "statusCode": 400,
  "message": "Insufficient points balance."
}
```

---

## 8. Frontend Changes

### New Components
- **RedemptionModal (Mobile App):** A modal for the customer to input the number of points to redeem and confirm the transaction.
- **RedemptionSuccessScreen (Mobile App):** A confirmation screen showing the details of the successful redemption.
- **RecentRedemptionsWidget (Business Dashboard):** A widget on the main dashboard showing the last 5 redemptions received.

### Page Updates
- **WalletScreen (Mobile App):** Add a "Redeem Points" button that opens the QR scanner.
- **Dashboard (Web App):** Integrate the `RecentRedemptionsWidget`.

---

## 9. Implementation Plan & Tasks

### Milestone 1: Backend Logic (Sprint X)
- **Task 1.1:** Create database migration for the `Redemption` table.
- **Task 1.2:** Update Prisma schema and generate client.
- **Task 1.3:** Implement the core logic in `transactions.service.ts` for redeeming points, ensuring it's an atomic operation.
- **Task 1.4:** Create the `POST /api/v1/transactions/redeem` endpoint in `transactions.controller.ts`.
- **Task 1.5:** Write unit and integration tests for the redemption service.

### Milestone 2: Mobile App UI/UX (Sprint X+1)
- **Task 2.1:** Build the `RedemptionModal` component in Flutter.
- **Task 2.2:** Integrate the QR scanner to read the business QR code.
- **Task 2.3:** Connect the modal to the backend API.
- **Task 2.4:** Implement the `RedemptionSuccessScreen`.
- **Task 2.5:** Add E2E tests for the redemption flow using Playwright.

### Milestone 3: Business Dashboard Integration (Sprint X+1)
- **Task 3.1:** Create the `RecentRedemptionsWidget` in React.
- **Task 3.2:** Fetch data from a new `/api/v1/business/redemptions` endpoint.
- **Task 3.3:** Add the widget to the main dashboard page.

---

## 10. Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Race Conditions** | Medium | High | Use database-level transactions (`prisma.$transaction`) to ensure atomicity when debiting the customer and crediting the business. Use Redis for distributed locks if needed. |
| **QR Code Spoofing** | Low | High | Implement dynamic, single-use QR codes with a short TTL (Time To Live) that are generated for each specific transaction request from the business POS. |
| **Negative Point Balance** | Low | Medium | Add database constraints (`CHECK (balance >= 0)`) and perform validation at the service layer before initiating the transaction. |

---

## 11. AI Agent Instructions

### Implementation Workflow
🎯 **MANDATORY PROCESS:**
1.  **Analyze & Plan:** Start by reading the entire plan. Ask clarifying questions if any requirements are ambiguous.
2.  **Backend First:** Implement the backend changes first, including database migrations, service logic, and API endpoints. Ensure all backend tests are passing.
3.  **Frontend Implementation:** Once the API is stable, proceed with the frontend changes (Mobile and Web). Use mock data initially if the API is not yet deployed.
4.  **Integration & E2E Testing:** Connect the frontend to the backend and perform end-to-end testing to validate the complete user flow.
5.  **Review & Refactor:** Before finalizing, review the code for adherence to project standards and refactor where necessary.

⚙️ **Quality Assurance Loop:**
- **Lint and Build Incrementally:** After each small, logical change, run the linter and build command for the affected package to catch errors early.
  - `pnpm --filter <package-name> lint`
  - `pnpm --filter <package-name> build`
- **Zero Linting Errors:** Do not consider a task complete until the linter passes without any errors for the modified packages.
- **Prioritize Type Safety:** Avoid using the `any` type. Define clear `interface` or `type` definitions for all data structures.

### Communication Preferences
- Provide a concise summary of the plan before starting.
- Announce the completion of each major milestone (e.g., "Milestone 1: Backend Logic is complete and all tests are passing.").
- If you encounter a blocker or a significant ambiguity, stop and ask for clarification.
