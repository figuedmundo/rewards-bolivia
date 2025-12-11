# Epic 7 Implementation Plan: Frontend - Puntos y Transacciones

**Sprint:** Sprint 2
**Epic ID:** Epic 7
**Status:** ✅ Ready to Start Implementation
**Scope:** Tasks T7.1 - T7.5 (Admin dashboard T7.6 deferred)
**Estimated Duration:** 3.5 days
**Created:** 2025-11-15

> 🚀 **NEW TO THIS EPIC?** Start with `EPIC_7_READY_TO_START.md` for a quick orientation and step-by-step getting started guide!

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Prerequisites & Setup](#prerequisites--setup)
3. [Architecture Decision](#architecture-decision)
4. [Task Breakdown](#task-breakdown)
5. [Component Architecture](#component-architecture)
6. [API Integration Strategy](#api-integration-strategy)
7. [State Management Strategy](#state-management-strategy)
8. [Testing Strategy](#testing-strategy)
9. [File Structure](#file-structure)
10. [Implementation Timeline](#implementation-timeline)
11. [Risk Assessment](#risk-assessment)
12. [Acceptance Criteria](#acceptance-criteria)
13. [Future Enhancements](#future-enhancements)

---

## 📊 Executive Summary

### Objective

Implement user-facing interfaces for the Rewards Bolivia points system, enabling customers to:
- View their points balance and transaction history
- Redeem points during checkout
- See point expiration information
- Receive instant visual feedback on transactions

### Current State

**Backend (API):**
- ✅ Fully functional transactions module (Epic 5)
- ✅ Complete ledger and audit system (Epic 6)
- ✅ Endpoints for earn, redeem, and ledger queries
- ✅ Shared TypeScript DTOs in `@rewards-bolivia/shared-types`

**Frontend (Web):**
- ✅ Basic React + Vite setup with Tailwind CSS
- ✅ Authentication system (AuthContext)
- ✅ API client singleton (Axios-based)
- ⚠️ No state management beyond auth
- ⚠️ No SDK generated yet (blocked by Java requirement)
- ❌ No wallet or transaction UI

### Target State (End of Epic 7)

- ✅ Points wallet page with balance and history
- ✅ Checkout integration with point redemption
- ✅ Real-time balance updates
- ✅ Point expiration warnings
- ✅ Toast notifications and animations
- ✅ Comprehensive test coverage (Unit/Integration/E2E)

---

## 🔧 Prerequisites & Setup

### 1. Environment Setup

**Required Services:**
```bash
# Start infrastructure
docker-compose -f infra/local/docker-compose.yml up -d postgres redis

# Install dependencies (if not done)
pnpm install

# Run migrations
pnpm --filter api exec prisma migrate dev

# Start API
pnpm --filter api start:dev

# Start web app (in another terminal)
pnpm --filter web dev
```

### 2. SDK Generation (REQUIRED for Epic 7)

**Status:** ✅ REQUIRED - Essential part of API integration strategy

**Current Approach: Generated TypeScript-Axios SDK** ✅

We use **SDK generation** for Epic 7 because:
- ✅ Auto-generated types always in sync with backend OpenAPI spec
- ✅ Eliminates manual type maintenance and drift risk
- ✅ Type safety is critical for financial transactions (points/redemptions)
- ✅ Generated client includes validation and error handling
- ✅ OpenAPI contract enforced automatically
- ✅ Single source of truth (backend spec → SDK)

**SDK Generation Setup:**

```bash
# Prerequisites (all already met):
# - Java Runtime (17+) ✅ installed
# - Docker daemon running ✅ (for Redis)
# - Backend API running ✅ (pnpm --filter api start:dev)
# - Redis running ✅ (docker-compose up redis)

# Generate SDK from backend OpenAPI spec
pnpm generate:sdk

# Output location:
# packages/sdk/
# ├── api.ts                # Auto-generated API client with all methods & types
# ├── configuration.ts      # Configuration setup
# ├── common.ts             # Common utilities
# ├── base.ts               # Base API class
# ├── index.ts              # Barrel export (exports api + configuration)
# └── package.json          # SDK package definition

# The SDK is available as @rewards-bolivia/sdk workspace package
```

**SDK Generation Requirements:**

| Component | Status | Notes |
|-----------|--------|-------|
| Java 17+ | ✅ Installed | Required for OpenAPI generator |
| Docker daemon | ✅ Running | Required to run generator in container |
| Backend API | ✅ Running | Must be accessible on http://localhost:3001 |
| Redis | ✅ Running | Required by backend |
| OpenAPI spec | ✅ Generated | Exposed at http://localhost:3001/api/spec |

**Generated SDK Structure:**

The SDK is generated as a workspace package (`@rewards-bolivia/sdk`) containing all API types and client methods in a single `api.ts` file:

```typescript
// Import types and API methods from generated SDK
import type {
  UserDto,
  LedgerEntryDto,
  TransactionDto,
  EarnPointsDto,
  RegisterUserDto,
  LoginDto
} from '@rewards-bolivia/sdk';

// Import API client factory/methods
// Note: The SDK exports factory functions for creating API clients
import {
  AdminAuditApi,
  LedgerApi,
  TransactionsApi,
  UsersApi,
  AuthApi
} from '@rewards-bolivia/sdk';

// SDK client instances (initialized in wallet-api.ts)
const usersApi = new UsersApi();
const transactionsApi = new TransactionsApi();
const ledgerApi = new LedgerApi();

// Usage in hooks
export const useWalletBalance = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['balance', user?.id],
    queryFn: () => usersApi.getUser(user!.id).then(r => r.pointsBalance),
  });
};
```

**SDK Key Features:**
- ✅ All types auto-generated in `api.ts`
- ✅ All API client classes exported (UsersApi, TransactionsApi, LedgerApi, etc.)
- ✅ Configuration management in `configuration.ts`
- ✅ No manual type maintenance needed
- ✅ Changes to backend → regenerate SDK → no manual updates

**Why SDK Over Manual Types:**

| Issue | Manual Types | SDK |
|-------|--------------|-----|
| Type accuracy | 🟡 Manual (error-prone) | 🟢 Auto-generated |
| API changes | 🟡 Manual update needed | 🟢 Regenerate SDK |
| Validation | 🟡 None | 🟢 Built-in |
| Contract enforcement | 🟡 Manual | 🟢 Automatic |
| Financial accuracy | 🟡 Risk of mismatch | 🟢 Guaranteed sync |

**Implementation:**

The API layer will be generated and exposed through wrapper hooks. See "API Integration with SDK" section below.

---

## 🏗️ Architecture Decision

### State Management Approach: **TanStack Query + AuthContext (Hybrid)**

**✅ APPROVED ARCHITECTURE:**

#### **Pattern: Context (Auth) + TanStack Query (Domain Data)**

**Rationale:**
1. **Minimal disruption** - Keep existing `AuthContext` unchanged
2. **Best tool for each job** - TanStack Query designed for server state
3. **Future-proof** - Scales well for Epic 8 (admin audit) and beyond
4. **Industry standard** - Battle-tested solution with minimal bundle size (~13 KB gzipped)
5. **Developer experience** - Less boilerplate than custom solutions
6. **Built-in features needed**: Caching, pagination, optimistic updates, retry logic

**Installation:**
```bash
pnpm --filter web add @tanstack/react-query
pnpm --filter web add -D @tanstack/react-query-devtools
```

**Architecture Diagram:**

```
┌─────────────────────────────────────────────────────────┐
│                   Application State                      │
└─────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌─────────┐      ┌──────────┐    ┌──────────┐
    │  Auth   │      │  Server  │    │    UI    │
    │  State  │      │  State   │    │  State   │
    └─────────┘      └──────────┘    └──────────┘
         │                │                │
         ▼                ▼                ▼
   AuthContext     TanStack Query    useState
   (existing)         (NEW)          (existing)
         │                │                │
         ▼                ▼                ▼
   - user           - balance        - modal open
   - isAuth         - transactions   - form input
   - login()        - ledger         - filters
   - logout()       - mutations
```

**State Ownership:**

| State Type | Owner | Pattern | Example |
|------------|-------|---------|---------|
| **Auth State** | AuthContext | Context API | user, isAuthenticated |
| **Server State** | TanStack Query | Cache with queries/mutations | balance, ledger entries |
| **UI State** | Component useState | Local state | modal open, form input |
| **Form State** | react-hook-form | Controlled forms | redemption form |
| **Router State** | React Router | URL params | page number, filters |

---

## 📝 Task Breakdown

### T7.1: Crear vista "Wallet de Puntos" (1 day)

**Objective:** Create main wallet page showing balance, transaction history, and expiration info.

**Subtasks:**
1. ✅ Setup TanStack Query in `main.tsx`
2. Create `wallet-api.ts` service layer
3. Create `useWallet.ts` custom hooks
4. Create `WalletPage.tsx` with route configuration
5. Implement `WalletBalance` component (display current points)
6. Implement `TransactionHistory` component (paginated ledger entries)
7. Implement `ExpirationWarning` component (points expiring soon)
8. Add loading skeletons and error states
9. Write unit tests for components and hooks

**Acceptance Criteria:**
- [ ] User can see current points balance
- [ ] User can view paginated transaction history
- [ ] Transactions display: date, type (EARN/REDEEM), amount, balance after
- [ ] Expiration warnings show when points expire <30 days
- [ ] Loading states display during data fetch
- [ ] Error messages display for failed requests
- [ ] Page is responsive (mobile, tablet, desktop)
- [ ] Unit tests pass with >80% coverage

**Dependencies:**
- TanStack Query installed
- `@rewards-bolivia/shared-types` types imported
- API client configured
- Backend API running

**Estimated Time:** 1 day

---

### T7.2: Crear vista "Transacción" (pago con puntos) (1 day)

**Objective:** Create checkout flow with point redemption interface.

**Subtasks:**
1. Create `CheckoutPage.tsx` or modal component
2. Install `react-hook-form` for form management
3. Implement `RedeemPointsForm` component
4. Add real-time validation (30% limit, balance check)
5. Calculate discount preview in real-time
6. Add confirmation dialog before redemption
7. Integrate `useRedeemPoints` mutation
8. Handle success/error states
9. Write integration tests for redemption flow

**Acceptance Criteria:**
- [ ] User can enter purchase amount
- [ ] System suggests maximum redeemable points (30% of ticket)
- [ ] Form validates available balance
- [ ] User sees discount preview before confirmation
- [ ] Redemption triggers API call with optimistic update
- [ ] Success state shows updated balance
- [ ] Error state displays clear message (insufficient balance, server error)
- [ ] Form validation prevents invalid submissions

**Dependencies:**
- T7.1 completed (wallet balance hook reusable)
- react-hook-form installed
- shadcn/ui dialog component

**Estimated Time:** 1 day

---

### T7.3: Integrar API `/earn` y `/redeem` (0.5 day)

**Objective:** Create API service layer and React hooks for transactions.

**Subtasks:**
1. Create `packages/web/src/lib/wallet-api.ts` service
2. Define TypeScript interfaces for API responses
3. Implement typed methods for `/ledger/entries`, `/transactions/redeem`
4. Create custom hooks in `useWallet.ts`:
   - `useWalletBalance` (query)
   - `useTransactionHistory` (query with pagination)
   - `useRedeemPoints` (mutation)
5. Configure TanStack Query cache invalidation strategy
6. Add error handling and retry logic
7. Write unit tests for API service and hooks

**Acceptance Criteria:**
- [ ] API service has typed methods matching backend DTOs
- [ ] Hooks provide loading/error/data states
- [ ] Mutations invalidate relevant queries on success
- [ ] Network errors handled gracefully
- [ ] No prop drilling - hooks consumable anywhere
- [ ] Query keys centralized for cache management
- [ ] Unit tests cover all API methods and hooks

**Dependencies:**
- Backend API running and accessible
- Shared types package imported
- TanStack Query installed

**Estimated Time:** 0.5 day

---

### T7.4: Feedback visual instantáneo (toast + animación) (0.5 day)

**Objective:** Add visual feedback for user actions using toast notifications and animations.

**Subtasks:**
1. Install shadcn/ui toast component (`npx shadcn@latest add toast`)
2. Create `useToast` hook wrapper (comes with shadcn)
3. Add success animations for point redemption
4. Add loading spinners during API calls
5. Implement optimistic UI updates (instant balance change before API confirm)
6. Add smooth transitions between states
7. Add number count-up animation for balance changes
8. Test animations on different devices

**Acceptance Criteria:**
- [ ] Toast appears on successful redemption (green, "Points redeemed!")
- [ ] Toast appears on error (red, error message)
- [ ] Balance animates when updated (number count-up effect)
- [ ] Loading spinners display during async operations
- [ ] Optimistic update: balance updates instantly, reverts if API fails
- [ ] Animations are smooth (60fps) and accessible
- [ ] Toast auto-dismisses after appropriate time
- [ ] Multiple toasts stack properly

**Dependencies:**
- shadcn/ui setup complete
- T7.2 completed (redemption flow)
- T7.3 completed (mutations)

**Estimated Time:** 0.5 day

---

### T7.5: Mostrar expiración de puntos en UI (0.5 day)

**Objective:** Display point expiration dates and warnings.

**Subtasks:**
1. Extend ledger query to include expiration metadata
2. Create `ExpiringPoints` component
3. Calculate days until expiration
4. Show badge/warning for points expiring <30 days
5. Add tooltip with expiration breakdown
6. Integrate into wallet balance display
7. Add to transaction history items
8. Write unit tests for expiration logic

**Acceptance Criteria:**
- [ ] Expiring points highlighted in transaction history
- [ ] Warning badge shows: "X points expiring in Y days"
- [ ] Tooltip shows expiration date on hover
- [ ] No expiration info for REDEEM/BURN transactions
- [ ] Visual distinction (yellow badge) for 7-30 days, red for <7 days
- [ ] Expiration banner on wallet page if points expiring soon
- [ ] Calculations accurate based on backend expiration logic

**Dependencies:**
- T7.1 completed (transaction history)
- Backend expiration logic (Epic 5 includes expiration)
- shadcn/ui badge and tooltip components

**Estimated Time:** 0.5 day

---

## 🏛️ Component Architecture

### Page-Level Components

```
packages/web/src/pages/
├── WalletPage.tsx           # Main wallet dashboard (T7.1)
└── CheckoutPage.tsx         # Checkout with redemption (T7.2)
```

### Feature Components

```
packages/web/src/components/wallet/
├── WalletBalance.tsx        # Balance display with animation
├── TransactionHistory.tsx   # Paginated ledger table
├── TransactionItem.tsx      # Single ledger entry row
├── RedeemPointsForm.tsx     # Redemption form with validation
├── ExpirationWarning.tsx    # Banner for expiring points
├── ExpiringPointsBadge.tsx  # Inline badge for expiration
└── ConfirmRedemptionDialog.tsx  # Confirmation modal
```

### Shared UI Components (shadcn/ui)

**To Install:**
```bash
npx shadcn@latest add toast
npx shadcn@latest add card
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add badge
npx shadcn@latest add skeleton
npx shadcn@latest add tooltip
npx shadcn@latest add table
```

```
packages/web/src/components/ui/
├── toast.tsx       # Toast notifications (T7.4)
├── card.tsx        # Card wrapper for sections
├── button.tsx      # Primary action buttons
├── input.tsx       # Form inputs
├── dialog.tsx      # Modal dialogs
├── badge.tsx       # Status badges
├── skeleton.tsx    # Loading skeletons
├── tooltip.tsx     # Tooltips for expiration (T7.5)
└── table.tsx       # Transaction history table
```

### Component Hierarchy

```
WalletPage
├── WalletBalance (queries balance via useWalletBalance)
│   └── ExpiringPointsBadge (conditionally rendered)
├── ExpirationWarning (queries expiring entries)
└── TransactionHistory (queries paginated ledger via useTransactionHistory)
    └── TransactionItem[] (renders each entry)
        └── ExpiringPointsBadge (for EARN transactions)

CheckoutPage
├── PurchaseSummary (displays total)
├── RedeemPointsForm (queries balance, mutates via useRedeemPoints)
│   ├── DiscountPreview (calculated from input)
│   └── ConfirmRedemptionDialog (confirmation before submit)
└── Toaster (global, shows success/error)
```

---

## 🔌 API Integration Strategy

### SDK-Based API Service Layer

**File:** `packages/web/src/lib/wallet-api.ts`

This layer wraps the auto-generated SDK clients from `@rewards-bolivia/sdk` and exposes wallet-specific methods to the rest of the application.

```typescript
// Generated SDK imports from workspace package
import {
  UsersApi,
  TransactionsApi,
  LedgerApi,
} from '@rewards-bolivia/sdk';
import type {
  UserDto,
  TransactionDto,
  LedgerEntryDto,
} from '@rewards-bolivia/sdk';

// Initialize SDK clients with default configuration
const usersApi = new UsersApi();
const transactionsApi = new TransactionsApi();
const ledgerApi = new LedgerApi();

// Types for API responses
export interface PaginatedLedgerResponse {
  entries: LedgerEntryDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LedgerQueryParams {
  accountId?: string;
  transactionId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// Wallet API client wrapping SDK
export const walletApi = {
  // Get user balance (from user profile)
  // Uses auto-generated UsersApi.getUser() method
  getBalance: async (userId: string): Promise<number> => {
    const user = await usersApi.getUser(userId);
    return user.pointsBalance;
  },

  // Get user full profile
  // Uses auto-generated UsersApi.getUser() method
  getUser: async (userId: string): Promise<UserDto> => {
    return await usersApi.getUser(userId);
  },

  // Get paginated ledger entries
  // Uses auto-generated LedgerApi.getLedgerEntries() method
  getLedgerEntries: async (params: LedgerQueryParams): Promise<PaginatedLedgerResponse> => {
    return await ledgerApi.getLedgerEntries({
      accountId: params.accountId,
      transactionId: params.transactionId,
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    });
  },

  // Get single ledger entry
  // Uses auto-generated LedgerApi.getLedgerEntry() method
  getLedgerEntry: async (id: string): Promise<LedgerEntryDto> => {
    return await ledgerApi.getLedgerEntry(id);
  },

  // Verify ledger entry hash
  // Uses auto-generated LedgerApi.verifyLedgerEntry() method
  verifyLedgerEntry: async (id: string): Promise<{ valid: boolean; message: string }> => {
    return await ledgerApi.verifyLedgerEntry(id);
  },

  // Redeem points
  // Uses auto-generated TransactionsApi.redeemPoints() method
  redeemPoints: async (payload: {
    points: number;
    businessId: string;
    purchaseAmount: number;
  }): Promise<TransactionDto> => {
    return await transactionsApi.redeemPoints(payload);
  },

  // Earn points (for business flow - optional for Epic 7)
  // Uses auto-generated TransactionsApi.earnPoints() method
  earnPoints: async (payload: {
    points: number;
    userId: string;
    businessId: string;
    purchaseAmount: number;
  }): Promise<TransactionDto> => {
    return await transactionsApi.earnPoints(payload);
  },
};
```

**Benefits of SDK-Based Approach:**

1. **Type Safety:** All types auto-generated from OpenAPI spec
2. **Consistency:** Types always match backend implementation
3. **Validation:** SDK includes built-in validation
4. **Maintainability:** Update backend → regenerate SDK → no manual changes needed
5. **Error Handling:** Standardized error responses from SDK
6. **Documentation:** Auto-generated API documentation in types

### Custom React Hooks (TanStack Query)

**File:** `packages/web/src/hooks/useWallet.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi, type LedgerQueryParams } from '../lib/wallet-api';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { RedeemPointsDto } from '@rewards-bolivia/shared-types';

// Query keys (centralized for cache management)
export const walletKeys = {
  all: ['wallet'] as const,
  balance: (userId: string) => [...walletKeys.all, 'balance', userId] as const,
  user: (userId: string) => [...walletKeys.all, 'user', userId] as const,
  ledger: (params: LedgerQueryParams) => [...walletKeys.all, 'ledger', params] as const,
  entry: (id: string) => [...walletKeys.all, 'entry', id] as const,
};

// Hook: Get wallet balance
export const useWalletBalance = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: walletKeys.balance(user?.id || ''),
    queryFn: () => walletApi.getBalance(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Hook: Get user profile (includes balance + other data)
export const useUserProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: walletKeys.user(user?.id || ''),
    queryFn: () => walletApi.getUser(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook: Get transaction history (paginated)
export const useTransactionHistory = (params: LedgerQueryParams = {}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: walletKeys.ledger({ accountId: user?.id, ...params }),
    queryFn: () => walletApi.getLedgerEntries({ accountId: user?.id, ...params }),
    enabled: !!user,
    keepPreviousData: true, // For smooth pagination
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook: Get single ledger entry
export const useLedgerEntry = (id: string) => {
  return useQuery({
    queryKey: walletKeys.entry(id),
    queryFn: () => walletApi.getLedgerEntry(id),
    enabled: !!id,
  });
};

// Hook: Redeem points mutation
export const useRedeemPoints = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: RedeemPointsDto) => walletApi.redeemPoints(payload),

    // Optimistic update
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: walletKeys.balance(user!.id) });

      // Snapshot current balance
      const previousBalance = queryClient.getQueryData<number>(walletKeys.balance(user!.id));

      // Optimistically update balance
      if (previousBalance !== undefined) {
        queryClient.setQueryData<number>(
          walletKeys.balance(user!.id),
          previousBalance - variables.points
        );
      }

      return { previousBalance };
    },

    // On success
    onSuccess: (data) => {
      toast({
        title: 'Points redeemed!',
        description: `You saved ${data.points} points on your purchase.`,
        variant: 'default',
      });

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: walletKeys.balance(user!.id) });
      queryClient.invalidateQueries({ queryKey: walletKeys.user(user!.id) });
      queryClient.invalidateQueries({ queryKey: walletKeys.ledger({ accountId: user?.id }) });
    },

    // On error (rollback)
    onError: (error: any, variables, context) => {
      // Restore previous balance
      if (context?.previousBalance !== undefined) {
        queryClient.setQueryData(walletKeys.balance(user!.id), context.previousBalance);
      }

      toast({
        title: 'Redemption failed',
        description: error.response?.data?.message || 'Unable to redeem points. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
```

### Query Client Setup

**File:** `packages/web/src/main.tsx` (update)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './components/providers/AuthProvider';
import { router } from './App';
import './index.css';

// Configure TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on window focus by default
      staleTime: 1000 * 30, // 30 seconds default
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      {/* DevTools only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
);
```

---

## 🗂️ State Management Strategy

### State Types & Ownership

| State Type | Owner | Pattern | Example |
|------------|-------|---------|---------|
| **Server State** | TanStack Query | Cache with queries/mutations | Balance, ledger entries |
| **Auth State** | AuthContext | Context API | User, isAuthenticated |
| **UI State** | Component useState | Local state | Modal open, form input |
| **Form State** | react-hook-form | Controlled forms | Redemption form |
| **Router State** | React Router | URL params | Page number, filters |

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     User Action                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Component (UI State) │
         └───────────┬───────────┘
                     │ Calls hook
                     ▼
         ┌───────────────────────┐
         │ Custom Hook           │
         │ (useRedeemPoints)     │
         └───────────┬───────────┘
                     │ useMutation
                     ▼
         ┌───────────────────────┐
         │ TanStack Query        │
         │ (manages cache)       │
         └───────────┬───────────┘
                     │ Calls API
                     ▼
         ┌───────────────────────┐
         │ walletApi service     │
         │ (typed axios calls)   │
         └───────────┬───────────┘
                     │ HTTP request
                     ▼
         ┌───────────────────────┐
         │ Backend API           │
         │ (NestJS)              │
         └───────────┬───────────┘
                     │ Response
                     ▼
         ┌───────────────────────┐
         │ TanStack Query        │
         │ - Updates cache       │
         │ - Invalidates queries │
         └───────────┬───────────┘
                     │ Re-renders
                     ▼
         ┌───────────────────────┐
         │ Component (Updated)   │
         └───────────────────────┘
```

### Cache Invalidation Strategy

**After Mutations:**
- ✅ Redeem points → Invalidate balance + user + ledger queries
- ✅ Earn points → Invalidate balance + user + ledger queries

**Background Refetch:**
- Balance: Refetch on window focus, stale after 1 minute
- Ledger: Keep previous data during pagination, stale after 5 minutes
- User profile: Stale after 5 minutes

**Manual Refetch:**
- Pull-to-refresh on mobile (future enhancement)
- "Refresh" button on error state

---

## 🧪 Testing Strategy

### Test Pyramid Distribution

| Type | Target Coverage | Tools | Focus |
|------|----------------|-------|-------|
| **Unit** | 60% | Vitest + RTL | Component logic, hooks |
| **Integration** | 30% | RTL + MSW | API integration, state updates |
| **E2E** | 10% | Playwright | User flows |

### Unit Tests (60%)

**Scope:**
- Component rendering and props
- Hook logic (custom hooks)
- Utility functions
- Form validation

**Example Test:**
```typescript
// packages/web/src/components/wallet/WalletBalance.spec.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletBalance } from './WalletBalance';
import { useWalletBalance } from '../../hooks/useWallet';

vi.mock('../../hooks/useWallet');

describe('WalletBalance', () => {
  it('displays loading skeleton when fetching balance', () => {
    vi.mocked(useWalletBalance).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<WalletBalance />);
    expect(screen.getByTestId('balance-skeleton')).toBeInTheDocument();
  });

  it('displays balance when data is loaded', () => {
    vi.mocked(useWalletBalance).mockReturnValue({
      data: 1500,
      isLoading: false,
      error: null,
    } as any);

    render(<WalletBalance />);
    expect(screen.getByText(/1,500/)).toBeInTheDocument();
  });

  it('displays error message when query fails', () => {
    vi.mocked(useWalletBalance).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    } as any);

    render(<WalletBalance />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

**Files to Test:**
- `WalletBalance.spec.tsx`
- `TransactionHistory.spec.tsx`
- `RedeemPointsForm.spec.tsx`
- `ExpirationWarning.spec.tsx`
- `useWallet.spec.ts` (hook tests)
- `wallet-api.spec.ts` (API service tests)

### Integration Tests (30%)

**Scope:**
- API integration with mocked responses (MSW)
- State updates across components
- Query cache invalidation
- Optimistic updates

**Setup MSW (Mock Service Worker):**

```bash
pnpm --filter web add -D msw
```

**Example Test:**
```typescript
// packages/web/src/test/msw-handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users/:id', () => {
    return HttpResponse.json({
      id: 'user1',
      email: 'test@example.com',
      pointsBalance: 1000,
    });
  }),

  http.get('/api/ledger/entries', () => {
    return HttpResponse.json({
      entries: [
        { id: '1', type: 'EARN', debit: 100, credit: 0, balanceAfter: 1000, createdAt: new Date() },
        { id: '2', type: 'REDEEM', debit: 0, credit: 50, balanceAfter: 950, createdAt: new Date() },
      ],
      total: 2,
      page: 1,
      pageSize: 10,
    });
  }),

  http.post('/api/transactions/redeem', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'tx1',
      type: 'REDEEM',
      points: body.points,
      balanceAfter: 700,
    });
  }),
];
```

```typescript
// packages/web/src/features/wallet/__tests__/redeem-flow.integration.spec.tsx
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { handlers } from '../../../test/msw-handlers';
import { WalletPage } from '../../../pages/WalletPage';
import { AllTheProviders } from '../../../test/test-utils';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Redeem Points Flow', () => {
  it('updates balance after successful redemption', async () => {
    const user = userEvent.setup();
    render(<WalletPage />, { wrapper: AllTheProviders });

    // Wait for initial balance
    await waitFor(() => {
      expect(screen.getByText(/1,000/)).toBeInTheDocument();
    });

    // Open redeem form
    await user.click(screen.getByRole('button', { name: /redeem/i }));

    // Enter redemption amount
    await user.type(screen.getByLabelText(/points to redeem/i), '300');

    // Submit
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    // Optimistic update should show immediately
    await waitFor(() => {
      expect(screen.getByText(/700/)).toBeInTheDocument();
    });

    // Success toast appears
    await waitFor(() => {
      expect(screen.getByText(/points redeemed/i)).toBeInTheDocument();
    });
  });
});
```

**Files to Test:**
- `redeem-flow.integration.spec.tsx`
- `transaction-history-pagination.integration.spec.tsx`
- `expiration-warnings.integration.spec.tsx`

### E2E Tests (10%)

**Scope:**
- Full user journeys across pages
- Real API interactions (against test database)
- Visual regression (screenshots)

**Example Test:**
```typescript
// e2e/tests/wallet/redeem-points.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Points Redemption E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('customer can redeem points at checkout', async ({ page }) => {
    // Navigate to wallet
    await page.goto('/wallet');

    // Verify initial balance
    const balanceBefore = await page.locator('[data-testid="wallet-balance"]').textContent();
    expect(balanceBefore).toContain('1,000');

    // Go to checkout
    await page.click('text=Redeem Points');

    // Enter purchase details
    await page.fill('[name="purchaseAmount"]', '1000');
    await page.fill('[name="pointsToRedeem"]', '300');

    // Verify discount preview
    await expect(page.locator('[data-testid="discount-preview"]')).toContainText('Discount: $3.00');

    // Submit redemption
    await page.click('button:has-text("Confirm Redemption")');

    // Verify success toast
    await expect(page.locator('.toast')).toContainText('Points redeemed');

    // Verify balance updated
    await expect(page.locator('[data-testid="wallet-balance"]')).toContainText('700');

    // Verify transaction appears in history
    await page.click('text=Transaction History');
    await expect(page.locator('table tbody tr:first-child')).toContainText('REDEEM');
    await expect(page.locator('table tbody tr:first-child')).toContainText('-300');
  });

  test('prevents redemption exceeding 30% limit', async ({ page }) => {
    await page.goto('/checkout');
    await page.fill('[name="purchaseAmount"]', '100');
    await page.fill('[name="pointsToRedeem"]', '50'); // 50% of ticket

    // Verify validation error
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Maximum 30 points (30% of purchase)'
    );

    // Submit button should be disabled
    await expect(page.locator('button:has-text("Confirm")')).toBeDisabled();
  });
});
```

**Files to Create:**
- `e2e/tests/wallet/redeem-points.spec.ts`
- `e2e/tests/wallet/transaction-history.spec.ts`
- `e2e/tests/wallet/expiration-warnings.spec.ts`

### Test Utilities

**File:** `packages/web/src/test/test-utils.tsx` (update)

```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../components/providers/AuthProvider';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Silence errors in tests
    },
  });

export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

---

## 📁 File Structure

### Final Directory Tree

```
packages/web/src/
├── components/
│   ├── ui/                              # shadcn/ui components
│   │   ├── toast.tsx                    # ✨ NEW (T7.4)
│   │   ├── toaster.tsx                  # ✨ NEW (T7.4)
│   │   ├── card.tsx                     # ✨ NEW (T7.1)
│   │   ├── button.tsx                   # existing
│   │   ├── input.tsx                    # existing
│   │   ├── dialog.tsx                   # ✨ NEW (T7.2)
│   │   ├── badge.tsx                    # ✨ NEW (T7.5)
│   │   ├── skeleton.tsx                 # ✨ NEW (T7.1)
│   │   ├── tooltip.tsx                  # ✨ NEW (T7.5)
│   │   └── table.tsx                    # ✨ NEW (T7.1)
│   ├── wallet/                          # ✨ NEW (feature folder)
│   │   ├── WalletBalance.tsx            # ✨ NEW (T7.1)
│   │   ├── WalletBalance.spec.tsx       # ✨ NEW (T7.1)
│   │   ├── TransactionHistory.tsx       # ✨ NEW (T7.1)
│   │   ├── TransactionHistory.spec.tsx  # ✨ NEW (T7.1)
│   │   ├── TransactionItem.tsx          # ✨ NEW (T7.1)
│   │   ├── RedeemPointsForm.tsx         # ✨ NEW (T7.2)
│   │   ├── RedeemPointsForm.spec.tsx    # ✨ NEW (T7.2)
│   │   ├── ExpirationWarning.tsx        # ✨ NEW (T7.5)
│   │   ├── ExpiringPointsBadge.tsx      # ✨ NEW (T7.5)
│   │   └── ConfirmRedemptionDialog.tsx  # ✨ NEW (T7.2)
│   ├── providers/
│   │   └── AuthProvider.tsx             # existing
│   ├── GoogleSignInButton.tsx           # existing
│   └── ProtectedRoute.tsx               # existing
├── pages/
│   ├── WalletPage.tsx                   # ✨ NEW (T7.1)
│   ├── CheckoutPage.tsx                 # ✨ NEW (T7.2)
│   ├── HomePage.tsx                     # existing
│   ├── DashboardPage.tsx                # existing
│   ├── LoginPage.tsx                    # existing
│   ├── RegisterPage.tsx                 # existing
│   └── AuthCallbackPage.tsx             # existing
├── hooks/
│   ├── useAuth.ts                       # existing
│   ├── useWallet.ts                     # ✨ NEW (T7.3)
│   ├── useWallet.spec.ts                # ✨ NEW (T7.3)
│   └── use-toast.ts                     # ✨ NEW (T7.4, from shadcn)
├── lib/
│   ├── api.ts                           # existing
│   ├── wallet-api.ts                    # ✨ NEW (T7.3)
│   ├── wallet-api.spec.ts               # ✨ NEW (T7.3)
│   └── utils.ts                         # existing
├── contexts/
│   └── AuthContext.tsx                  # existing
├── test/
│   ├── test-utils.tsx                   # ✨ UPDATED (add QueryClient)
│   └── msw-handlers.ts                  # ✨ NEW (MSW mocks)
├── App.tsx                              # ✨ UPDATED (add routes)
└── main.tsx                             # ✨ UPDATED (add QueryClientProvider)

e2e/tests/
└── wallet/                              # ✨ NEW
    ├── redeem-points.spec.ts            # ✨ NEW (T7.2)
    ├── transaction-history.spec.ts      # ✨ NEW (T7.1)
    └── expiration-warnings.spec.ts      # ✨ NEW (T7.5)
```

### Files to Create/Update Summary

**New Components (9 files):**
1. `WalletBalance.tsx` + `.spec.tsx`
2. `TransactionHistory.tsx` + `.spec.tsx`
3. `TransactionItem.tsx`
4. `RedeemPointsForm.tsx` + `.spec.tsx`
5. `ExpirationWarning.tsx`
6. `ExpiringPointsBadge.tsx`
7. `ConfirmRedemptionDialog.tsx`

**New Pages (2 files):**
8. `WalletPage.tsx`
9. `CheckoutPage.tsx`

**New Hooks & Services (4 files):**
10. `useWallet.ts` + `.spec.ts`
11. `wallet-api.ts` + `.spec.ts`

**New Test Utilities (2 files):**
12. `test/test-utils.tsx` (update)
13. `test/msw-handlers.ts` (new)

**New E2E Tests (3 files):**
14. `e2e/tests/wallet/redeem-points.spec.ts`
15. `e2e/tests/wallet/transaction-history.spec.ts`
16. `e2e/tests/wallet/expiration-warnings.spec.ts`

**Config Updates (2 files):**
17. `main.tsx` (add QueryClientProvider)
18. `App.tsx` (add wallet/checkout routes)

**shadcn/ui Components to Install (8 components):**
19. toast, card, dialog, badge, skeleton, tooltip, table, (button/input already exist)

**Total: ~20 new files + 8 shadcn components + 2 config updates**

---

## 📅 Implementation Timeline

### Day 1: Foundation & Wallet Page (T7.1 + T7.3)

**Morning (4-5 hours):**

**Step 1: SDK Generation (30 minutes)**
- [ ] Ensure infrastructure is running:
  ```bash
  # Terminal 1: Database and Redis
  docker-compose -f infra/local/docker-compose.yml up -d postgres redis

  # Terminal 2: Backend API
  pnpm --filter api start:dev
  ```
- [ ] Generate SDK from OpenAPI spec:
  ```bash
  pnpm generate:sdk
  ```
- [ ] Verify SDK generated:
  ```bash
  ls packages/sdk/
  # Should contain: api.ts, configuration.ts, common.ts, base.ts, index.ts, package.json
  ```
- [ ] Verify SDK is available as workspace package:
  ```bash
  # The SDK is automatically available as @rewards-bolivia/sdk in the monorepo
  cat packages/sdk/package.json
  # Should show: "name": "@rewards-bolivia/sdk"
  ```

**Step 2: Install Frontend Dependencies (20 minutes)**
- [ ] Install TanStack Query and form handling:
  ```bash
  pnpm --filter web add @tanstack/react-query
  pnpm --filter web add -D @tanstack/react-query-devtools
  pnpm --filter web add react-hook-form
  pnpm --filter web add -D msw
  ```
- [ ] Install shadcn/ui components:
  ```bash
  npx shadcn@latest add card skeleton table
  ```

**Step 3: Setup API Layer with SDK (1.5 hours)**
- [ ] Create `packages/web/src/lib/wallet-api.ts` service wrapping generated SDK
  - Import SDK clients from `@rewards-bolivia/sdk` (UsersApi, TransactionsApi, LedgerApi)
  - Initialize SDK client instances
  - Wrap SDK methods with wallet-specific methods
  - See "API Integration Strategy" section above for full code
- [ ] Create `packages/web/src/hooks/useWallet.ts` hooks using TanStack Query
  - `useWalletBalance()` → calls `walletApi.getBalance()`
  - `useTransactionHistory()` → calls `walletApi.getLedgerEntries()`
  - `useRedeemPoints()` → calls `walletApi.redeemPoints()`
- [ ] Write unit tests for wallet-api.ts and useWallet.ts
- [ ] Setup QueryClientProvider in `main.tsx`
- [ ] Update `test-utils.tsx` to include QueryClient

**Afternoon (4 hours):**
- [ ] Create `packages/web/src/pages/WalletPage.tsx` with route in `App.tsx`
- [ ] Implement `WalletBalance` component
- [ ] Implement `TransactionHistory` component with pagination
- [ ] Implement `TransactionItem` component
- [ ] Add loading skeletons
- [ ] Write component unit tests
- [ ] Manual testing: verify data displays correctly and API calls succeed

**End of Day 1 Deliverables:**
- ✅ SDK generated and integrated
- ✅ TanStack Query configured
- ✅ API integration layer (wallet-api.ts) complete with SDK
- ✅ Wallet page displaying balance and history
- ✅ Basic tests passing
- ✅ No console errors

---

### Day 2: Redemption Flow (T7.2 + T7.4)

**Morning (4 hours):**
- [ ] Install shadcn/ui components:
  ```bash
  npx shadcn@latest add dialog toast input button
  ```
- [ ] Create `CheckoutPage.tsx` with route
- [ ] Create `RedeemPointsForm` with react-hook-form
- [ ] Implement 30% limit validation logic
- [ ] Implement balance validation
- [ ] Add real-time discount preview calculation
- [ ] Create `ConfirmRedemptionDialog` component
- [ ] Write form validation tests

**Afternoon (4 hours):**
- [ ] Integrate `useRedeemPoints` mutation hook
- [ ] Add toast notifications (success/error)
- [ ] Implement optimistic UI updates in mutation
- [ ] Add loading spinners during mutation
- [ ] Add balance count-up animation (optional library or CSS)
- [ ] Test rollback on API error
- [ ] Write integration tests for redemption flow
- [ ] Manual testing: test happy path + error cases

**End of Day 2 Deliverables:**
- ✅ Checkout page with redemption form
- ✅ Visual feedback system (toasts, animations)
- ✅ Optimistic updates working correctly
- ✅ Form validation preventing invalid submissions
- ✅ Integration tests passing

---

### Day 3: Expiration + Polish (T7.5)

**Morning (3 hours):**
- [ ] Install shadcn/ui components:
  ```bash
  npx shadcn@latest add badge tooltip
  ```
- [ ] Create `ExpirationWarning` component (banner)
- [ ] Create `ExpiringPointsBadge` component (inline badge)
- [ ] Calculate days until expiration utility function
- [ ] Integrate expiration data into `TransactionHistory`
- [ ] Integrate expiration warning into `WalletBalance`
- [ ] Add tooltips with full expiration dates
- [ ] Color coding (yellow 7-30 days, red <7 days)
- [ ] Write unit tests for expiration components

**Afternoon (2 hours):**
- [ ] Setup MSW handlers in `test/msw-handlers.ts`
- [ ] Write E2E tests with Playwright:
  - Redeem points flow
  - Transaction history pagination
  - Expiration warnings display
- [ ] Run full test suite and fix failures
- [ ] Manual QA testing:
  - Mobile responsive (375px, 768px, 1024px)
  - Tablet responsive
  - Desktop responsive
  - Keyboard navigation
  - Screen reader compatibility (basic)
- [ ] Fix any UI/UX issues found

**End of Day 3 Deliverables:**
- ✅ Expiration warnings functional
- ✅ All E2E tests passing
- ✅ Responsive design verified on all breakpoints
- ✅ No accessibility blockers

---

### Day 4: Testing, Performance & Documentation (Buffer)

**Morning (2 hours):**
- [ ] Run coverage report:
  ```bash
  pnpm --filter web test -- --coverage
  ```
- [ ] Review coverage gaps and add missing tests
- [ ] Fix flaky tests (if any)
- [ ] Performance testing:
  - Lighthouse audit (target >90 score)
  - Bundle size check (should be <50 KB increase)
  - Network throttling test (slow 3G)
- [ ] Optimize if needed (lazy loading, code splitting)

**Afternoon (2 hours):**
- [ ] Code review and refactoring:
  - Remove console.logs
  - Check for TypeScript `any` types
  - Verify error handling completeness
  - Check for accessibility issues
- [ ] Update documentation:
  - Update `CLAUDE.md` with wallet patterns
  - Create `packages/web/src/components/wallet/README.md`
  - Document TanStack Query patterns used
- [ ] Create user-facing documentation (if needed)
- [ ] Sprint 2 Epic 7 retrospective notes
- [ ] Update Sprint 2 backlog (mark T7.1-T7.5 complete)

**End of Day 4 Deliverables:**
- ✅ Epic 7 complete (T7.1-T7.5)
- ✅ Test coverage ≥75%
- ✅ Documentation updated
- ✅ Performance benchmarks met
- ✅ Ready for production

---

## ⚠️ Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **SDK generation blocked (Java dependency)** | High | Low | ✅ RESOLVED: Use typed API client instead |
| **TanStack Query learning curve** | Medium | Low | Use simple patterns first, leverage official docs |
| **Backend API changes during Epic 7** | Low | Medium | Rely on `shared-types` package for contracts |
| **State sync issues (optimistic updates)** | Medium | Medium | Comprehensive error handling + rollback logic |
| **Performance issues (large ledger)** | Low | Medium | Implement pagination early, limit query size |
| **Mobile responsiveness challenges** | Low | Low | Use Tailwind responsive utilities from start |
| **Redis not running (API startup)** | Medium | Low | Document in setup, use `docker-compose up redis` |

### Process Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Scope creep (admin dashboard)** | Medium | Low | ✅ T7.6 explicitly deferred to future sprint |
| **Testing time underestimated** | Medium | Medium | Allocate Day 4 as buffer for testing |
| **Dependency on Epic 5/6 stability** | Low | High | ✅ Epic 5 & 6 complete and tested (100%) |
| **Shared types out of sync with API** | Low | Medium | Verify DTO alignment before starting T7.3 |

### Blockers Identified & Resolutions

| Blocker | Status | Resolution |
|---------|--------|------------|
| Java not installed (SDK generation) | ⚠️ Active | ✅ Use typed API client approach (no SDK needed) |
| Redis not running (API startup) | ⚠️ Active | Start with `docker-compose up redis` before dev |
| Backend TypeScript errors in Docker | ⚠️ Known | Run API locally for development (`pnpm --filter api start:dev`) |
| No expiration field in LedgerEntry | 🔍 Needs verification | Verify with backend team or check Prisma schema |

---

## ✅ Acceptance Criteria

### Epic-Level Success Criteria

**Functional:**
- [ ] Users can view current points balance
- [ ] Users can view paginated transaction history (10 entries per page)
- [ ] Users can redeem points at checkout (with 30% limit enforced)
- [ ] Users see expiration warnings for points <30 days
- [ ] All API integrations functional (ledger queries, redeem mutation)
- [ ] Optimistic updates work correctly (instant feedback + rollback on error)

**User Experience:**
- [ ] Instant visual feedback (toasts appear within 100ms of action)
- [ ] Loading states prevent user confusion
- [ ] Clear error messages (no generic "Error occurred")
- [ ] Responsive design works on mobile (375px), tablet (768px), desktop (1024px+)
- [ ] Animations are smooth (no jank, 60fps)
- [ ] Keyboard navigation works (Tab, Enter, Escape)

**Technical:**
- [ ] Test coverage ≥75% (Unit 60%, Integration 30%, E2E 10%)
- [ ] No console errors or warnings in development
- [ ] Lighthouse score >90 (performance, accessibility, best practices)
- [ ] Type-safe API calls (no `any` types except where necessary)
- [ ] Bundle size increase <50 KB gzipped
- [ ] Build completes without errors

**Documentation:**
- [ ] CLAUDE.md updated with wallet patterns section
- [ ] Component README created for wallet feature
- [ ] E2E test suite documented and runnable in CI
- [ ] Sprint 2 backlog updated (T7.1-T7.5 marked complete)

### Per-Task Acceptance Criteria

**T7.1 (Wallet Page):**
- [ ] Balance displays correctly formatted (e.g., "1,500 points")
- [ ] Transaction history shows all types (EARN, REDEEM, BURN, ADJUSTMENT)
- [ ] Pagination works (next/prev buttons, page numbers)
- [ ] Empty state displays when no transactions ("No transactions yet")
- [ ] Loading skeletons display during initial fetch
- [ ] Error state with retry button on API failure
- [ ] Route `/wallet` accessible only when authenticated

**T7.2 (Redemption Form):**
- [ ] Form validates 30% limit (shows error if exceeded)
- [ ] Form validates available balance (shows error if insufficient)
- [ ] Discount preview updates in real-time as user types
- [ ] Confirmation dialog appears before final submission
- [ ] Success redirects to wallet page or shows success message
- [ ] Form fields reset after successful redemption
- [ ] Disabled state during submission (prevent double-submit)

**T7.3 (API Integration):**
- [ ] All API methods typed with shared DTOs (UserDto, TransactionDto, etc.)
- [ ] Hooks return `{ data, isLoading, error, refetch }` consistently
- [ ] Mutations invalidate cache on success (balance, ledger queries)
- [ ] Network errors handled gracefully (toast notification)
- [ ] Query keys centralized in `walletKeys` object
- [ ] No duplicate API calls (request deduplication works)

**T7.4 (Visual Feedback):**
- [ ] Success toast appears on redemption (green, 3s duration, auto-dismiss)
- [ ] Error toast appears on failure (red, 5s duration, manual dismiss)
- [ ] Balance animates on update (count-up effect or smooth transition)
- [ ] Loading spinner displays during mutation (button disabled)
- [ ] Optimistic update: balance changes instantly
- [ ] Rollback on error: balance reverts if API fails
- [ ] Toast stacking works (multiple toasts don't overlap)

**T7.5 (Expiration UI):**
- [ ] Badge shows "X points expiring in Y days" on wallet page
- [ ] Yellow badge for 7-30 days until expiration
- [ ] Red badge for <7 days until expiration
- [ ] Tooltip shows full expiration date on hover
- [ ] Only EARN transactions show expiration in history
- [ ] Banner appears on wallet page if any points expiring <7 days
- [ ] Calculations accurate (days until expiration correct)

---

## 🚀 Future Enhancements (Post-Epic 7)

### Short-Term (Sprint 3)

1. **Admin Dashboard (T7.6 - Deferred)**
   - Audit log visualization
   - Economic metrics dashboard (burn rate, redemption rate)
   - Daily hash verification UI
   - System alerts display

2. **Performance Optimizations**
   - Virtual scrolling for large ledgers (1000+ entries)
   - Infinite scroll instead of traditional pagination
   - Service worker for offline support
   - Image optimization (if avatars added)

3. **Advanced Filtering**
   - Date range picker for transaction history
   - Transaction type filters (EARN, REDEEM, BURN)
   - Search by transaction ID or amount
   - Export to CSV functionality

### Medium-Term (Future Sprints)

4. **Real-Time Updates**
   - WebSocket integration for live balance updates
   - Push notifications for expiring points (7 days before)
   - Real-time transaction feed (live updates in history)
   - Presence indicators (show other users' activity if multi-tenant)

5. **Analytics & Insights**
   - Spending patterns visualization (charts)
   - Redemption trends over time
   - Points earned vs redeemed comparison
   - Monthly summaries

6. **Gamification**
   - Point streak bonuses (daily login rewards)
   - Achievement badges (milestones)
   - Leaderboard (if multi-tenant or competitive features)
   - Referral program integration

### Long-Term (Roadmap)

7. **Mobile App**
   - React Native version (code sharing with web)
   - QR code scanning for in-store redemption
   - Biometric authentication (Face ID, Touch ID)
   - Offline mode with sync

8. **Blockchain Integration**
   - Display blockchain transaction hashes in UI
   - Verify ledger entries on-chain (Polygon)
   - Public audit explorer (transparency page)
   - NFT rewards for milestones

9. **Advanced Features**
   - Points transfer between users
   - Gift cards purchase with points
   - Partner rewards integration
   - Multi-currency support

---

## 📖 References

### Internal Documentation

- **Project Docs:**
  - [CLAUDE.md](../../../../../CLAUDE.md) - Project overview and conventions
  - [Sprint 2 Backlog](./sprint_2_módulos_de_transacciones_y_economía.md) - Current sprint status
  - [Ledger API Guide](../../../../../docs/api/ledger-endpoints.md) - Backend API reference
  - [Epic 5 Documentation](./sprint_2_módulos_de_transacciones_y_economía.md#epic-5) - Transactions & Economy
  - [Epic 6 Documentation](./sprint_2_módulos_de_transacciones_y_economía.md#epic-6) - Ledger & Audit

- **API Endpoints:**
  - `GET /api/users/:id` - User profile with balance
  - `GET /api/ledger/entries` - Paginated ledger (user-scoped)
  - `GET /api/ledger/entries/:id` - Single entry detail
  - `GET /api/ledger/entries/:id/verify` - Verify entry hash
  - `POST /api/transactions/redeem` - Redeem points
  - `POST /api/transactions/earn` - Earn points (business flow)

### External Documentation

- **Core Libraries:**
  - [TanStack Query v5](https://tanstack.com/query/latest/docs/react/overview)
  - [React Hook Form](https://react-hook-form.com/get-started)
  - [shadcn/ui](https://ui.shadcn.com/docs)
  - [Tailwind CSS](https://tailwindcss.com/docs)

- **Testing:**
  - [Vitest](https://vitest.dev/guide/)
  - [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  - [MSW (Mock Service Worker)](https://mswjs.io/docs/)
  - [Playwright](https://playwright.dev/docs/intro)

- **TypeScript:**
  - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
  - [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Related Epics

- ✅ [Epic 5: Transactions & Economy](./sprint_2_módulos_de_transacciones_y_economía.md#epic-5) - Backend foundation (100% complete)
- ✅ [Epic 6: Ledger & Audit](./sprint_2_módulos_de_transacciones_y_economía.md#epic-6) - Audit system (100% complete)
- 📋 [Epic 8: QA & Performance](./sprint_2_módulos_de_transacciones_y_economía.md#epic-8) - Testing infrastructure (50% complete)

---

## 🎯 Success Metrics

### Development Metrics

| Metric | Target | Measurement Method | Status |
|--------|--------|-------------------|--------|
| Tasks completed | 5/5 (100%) | TodoWrite tool tracking | 📋 Not started |
| Test coverage | ≥75% | `pnpm run --filter=web test -- --coverage` | 📋 Not started |
| Unit test coverage | ≥60% | Coverage report | 📋 Not started |
| Integration test coverage | ≥30% | Coverage report | 📋 Not started |
| E2E tests passing | 100% | `pnpm --filter e2e test` | 📋 Not started |
| Bundle size increase | <50 KB gzipped | `pnpm build && du -sh packages/web/dist` | 📋 Not started |
| Build time | <30s | CI pipeline | 📋 Not started |
| Zero console errors | 100% | Manual QA + CI | 📋 Not started |
| TypeScript errors | 0 | `pnpm build` | 📋 Not started |

### User Experience Metrics

| Metric | Target | Measurement Method | Status |
|--------|--------|-------------------|--------|
| Time to Interactive | <3s | Lighthouse | 📋 Not started |
| First Contentful Paint | <1.5s | Lighthouse | 📋 Not started |
| Largest Contentful Paint | <2.5s | Lighthouse | 📋 Not started |
| Cumulative Layout Shift | <0.1 | Lighthouse | 📋 Not started |
| Accessibility score | >95 | Lighthouse | 📋 Not started |
| Performance score | >90 | Lighthouse | 📋 Not started |
| Redemption flow completion time | <30s | User testing | 📋 Post-launch |
| Mobile usability score | >95 | Lighthouse mobile | 📋 Not started |

### Business Metrics (Post-Launch)

| Metric | Target | Measurement Method | Status |
|--------|--------|-------------------|--------|
| Redemption conversion rate | >15% | Analytics (GA4 or similar) | 📋 Post-launch |
| Average points redeemed per transaction | 200-300 | Backend metrics endpoint | 📋 Post-launch |
| Wallet page engagement (daily views) | >40% of users | Analytics | 📋 Post-launch |
| Error rate (failed redemptions) | <2% | Backend logs + Sentry | 📋 Post-launch |
| User retention (7-day) | >60% | Analytics cohort analysis | 📋 Post-launch |

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-15 | 1.0 | Initial plan created with TanStack Query architecture | Claude |
| | | Defined all 5 tasks (T7.1-T7.5) with acceptance criteria | |
| | | Resolved SDK generation blocker (use typed API client) | |
| | | Created 4-day implementation timeline | |

---

## 🤝 Sign-Off & Next Steps

### Plan Review Checklist

- [ ] Product Owner reviewed and approved scope
- [ ] Tech Lead reviewed and approved architecture
- [ ] QA Lead reviewed and approved testing strategy
- [ ] Dependencies verified (Backend APIs available)
- [ ] Resources allocated (developer availability)

### Sign-Off

**Plan Approved By:**
- [ ] Product Owner: ___________________ Date: ___________
- [ ] Tech Lead: _______________________ Date: ___________
- [ ] QA Lead: _________________________ Date: ___________

**Implementation Details:**
- **Start Date:** _________________
- **Target Completion Date:** _________________ (3.5 days from start)
- **Assigned Developer:** _________________

### Pre-Implementation Checklist

**Before starting T7.1:**
- [ ] Backend API is running and accessible
- [ ] Redis is running (`docker-compose up redis`)
- [ ] Database migrations applied
- [ ] Test user account created for manual testing
- [ ] Development environment setup complete

**Kick-off Meeting Topics:**
1. Review architecture decision (TanStack Query)
2. Align on component naming conventions
3. Discuss any backend API changes needed
4. Set up daily standups (if not already scheduled)
5. Agree on code review process

---

## 🎬 Ready to Start?

Once sign-off is complete and the pre-implementation checklist is done, we're ready to begin development!

**First steps:**
```bash
# 1. Create feature branch
git checkout -b feat/epic-7-wallet-ui

# 2. Install dependencies
pnpm --filter web add @tanstack/react-query
pnpm --filter web add -D @tanstack/react-query-devtools
pnpm --filter web add react-hook-form
pnpm --filter web add -D msw

# 3. Start services
docker-compose -f infra/local/docker-compose.yml up -d postgres redis
pnpm --filter api start:dev  # Terminal 1
pnpm --filter web dev         # Terminal 2

# 4. Begin T7.1 (Day 1)
# See Implementation Timeline section for detailed steps
```

---

> 💡 **Note:** This plan is a living document. Update it as implementation progresses and new insights emerge. Track progress in the Sprint 2 backlog and communicate blockers early.

> 🧠 **Philosophy:** Build incrementally, test continuously, ship confidently. Epic 7 builds on the solid foundation of Epics 5 & 6. Let's create an exceptional user experience!
