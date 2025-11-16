# Epic 7: Component Design Specification

**Sprint:** Sprint 2
**Epic ID:** Epic 7 - Frontend Puntos y Transacciones
**Document Type:** Technical Design Specification
**Version:** 1.0
**Created:** 2025-11-15
**Status:** 📋 Ready for Implementation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Component Specifications](#component-specifications)
   - [Pages](#pages)
   - [Feature Components](#feature-components)
   - [UI Components](#ui-components)
4. [API Hooks Specification](#api-hooks-specification)
5. [Type Definitions](#type-definitions)
6. [Component Props Reference](#component-props-reference)
7. [State Management Patterns](#state-management-patterns)
8. [Responsive Design Breakpoints](#responsive-design-breakpoints)
9. [Animation Specifications](#animation-specifications)
10. [Accessibility Requirements](#accessibility-requirements)

---

## 🎯 Overview

This document provides detailed technical specifications for all UI components in Epic 7. Each component includes:

- Component purpose and behavior
- Props interface with TypeScript definitions
- State management approach
- Example implementation code
- Styling requirements (Tailwind classes)
- Accessibility attributes
- Test cases to cover

### Component Hierarchy

```
App
└── QueryClientProvider (TanStack Query)
    └── AuthProvider
        └── Router
            ├── WalletPage (Protected Route)
            │   ├── WalletBalance
            │   │   └── ExpiringPointsBadge
            │   ├── ExpirationWarning
            │   └── TransactionHistory
            │       └── TransactionItem[]
            │           └── ExpiringPointsBadge
            └── CheckoutPage (Protected Route)
                ├── RedeemPointsForm
                │   ├── DiscountPreview
                │   └── ConfirmRedemptionDialog
                └── Toaster (global)
```

---

## 🎨 Design Principles

### 1. Composition Over Inheritance
- Build complex UIs from small, reusable components
- Use children props for flexible layouts
- Leverage shadcn/ui's composable primitives

### 2. Data Fetching Strategy
- **Server State:** TanStack Query hooks (`useWalletBalance`, `useTransactionHistory`)
- **UI State:** Local `useState` (modals, form inputs)
- **Form State:** `react-hook-form` (validation, submission)

### 3. Error Handling
- Always show user-friendly error messages
- Provide retry mechanisms for failed requests
- Log errors to console (development) or error tracking (production)

### 4. Loading States
- Use skeleton loaders for content areas
- Use spinners for actions (button loading)
- Never show blank screens during loading

### 5. Responsive Design
- Mobile-first approach
- Test on: 375px (mobile), 768px (tablet), 1024px (desktop)
- Use Tailwind responsive utilities (`sm:`, `md:`, `lg:`)

---

## 📦 Component Specifications

---

## Pages

### WalletPage

**File:** `packages/web/src/pages/WalletPage.tsx`

**Purpose:** Main dashboard for viewing points balance, transaction history, and expiration warnings.

**Route:** `/wallet` (protected, requires authentication)

#### Implementation

```typescript
import { Card } from '@/components/ui/card';
import { WalletBalance } from '@/components/wallet/WalletBalance';
import { ExpirationWarning } from '@/components/wallet/ExpirationWarning';
import { TransactionHistory } from '@/components/wallet/TransactionHistory';

export const WalletPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          My Wallet
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your points and transaction history
        </p>
      </div>

      {/* Balance Card */}
      <div className="mb-6">
        <WalletBalance />
      </div>

      {/* Expiration Warning Banner */}
      <div className="mb-6">
        <ExpirationWarning />
      </div>

      {/* Transaction History */}
      <Card>
        <TransactionHistory />
      </Card>
    </div>
  );
};
```

#### Layout Structure

```
┌─────────────────────────────────────────────┐
│ My Wallet                                   │
│ Track your points and transaction history   │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ WalletBalance Component                 │ │
│ │ - Current balance                       │ │
│ │ - Expiring points badge                 │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ ExpirationWarning (if applicable)       │ │
│ │ - Yellow/red banner                     │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ TransactionHistory                      │ │
│ │ - Table/list of transactions            │ │
│ │ - Pagination controls                   │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

#### Responsive Behavior

- **Mobile (<768px):** Stack all cards vertically, full width
- **Tablet (768px-1023px):** Stack vertically, max-width 720px
- **Desktop (≥1024px):** Max-width 1200px, center aligned

#### Test Cases

```typescript
describe('WalletPage', () => {
  it('renders page title and description', () => {});
  it('renders WalletBalance component', () => {});
  it('renders ExpirationWarning when points expiring', () => {});
  it('renders TransactionHistory component', () => {});
  it('redirects to login if not authenticated', () => {});
  it('is responsive on mobile, tablet, desktop', () => {});
});
```

---

### CheckoutPage

**File:** `packages/web/src/pages/CheckoutPage.tsx`

**Purpose:** Checkout flow where users can redeem points for discounts.

**Route:** `/checkout` (protected, requires authentication)

#### Implementation

```typescript
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RedeemPointsForm } from '@/components/wallet/RedeemPointsForm';
import { useWalletBalance } from '@/hooks/useWallet';
import { Skeleton } from '@/components/ui/skeleton';

export const CheckoutPage = () => {
  const { data: balance, isLoading } = useWalletBalance();
  const [purchaseAmount] = useState(1000); // Example: could come from cart

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Checkout
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Redeem your points for instant discounts
        </p>
      </div>

      {/* Purchase Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Purchase Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-lg">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold">${purchaseAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Available Points */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Available Points</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <div className="text-2xl font-bold text-green-600">
              {balance?.toLocaleString()} points
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redemption Form */}
      <Card>
        <CardHeader>
          <CardTitle>Redeem Points</CardTitle>
        </CardHeader>
        <CardContent>
          <RedeemPointsForm
            purchaseAmount={purchaseAmount}
            availableBalance={balance || 0}
          />
        </CardContent>
      </Card>
    </div>
  );
};
```

#### Layout Structure

```
┌─────────────────────────────────────────────┐
│ Checkout                                    │
│ Redeem your points for instant discounts    │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Purchase Summary                        │ │
│ │ Total Amount:              $1,000.00    │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Available Points                        │ │
│ │ 1,500 points                            │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Redeem Points                           │ │
│ │ - Input field (points to redeem)        │ │
│ │ - Discount preview                      │ │
│ │ - Submit button                         │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

#### Test Cases

```typescript
describe('CheckoutPage', () => {
  it('renders purchase summary', () => {});
  it('displays available points balance', () => {});
  it('renders RedeemPointsForm component', () => {});
  it('shows loading skeleton while fetching balance', () => {});
  it('redirects to login if not authenticated', () => {});
});
```

---

## Feature Components

### WalletBalance

**File:** `packages/web/src/components/wallet/WalletBalance.tsx`

**Purpose:** Display current points balance with expiration badge.

#### Props Interface

```typescript
interface WalletBalanceProps {
  // No props - uses useWalletBalance hook internally
}
```

#### Implementation

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWalletBalance } from '@/hooks/useWallet';
import { ExpiringPointsBadge } from './ExpiringPointsBadge';
import { Coins } from 'lucide-react';

export const WalletBalance = () => {
  const { data: balance, isLoading, error, refetch } = useWalletBalance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-48" data-testid="balance-skeleton" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600">
            Failed to load balance.{' '}
            <button
              onClick={() => refetch()}
              className="underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Points Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div
              className="text-4xl font-bold text-green-600 dark:text-green-400"
              data-testid="wallet-balance"
            >
              {balance?.toLocaleString()}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              points available
            </p>
          </div>
          <ExpiringPointsBadge />
        </div>
      </CardContent>
    </Card>
  );
};
```

#### Visual Design

```
┌─────────────────────────────────────────────┐
│ 🪙 Points Balance                           │
├─────────────────────────────────────────────┤
│                                             │
│  1,500                    [⚠️ 200 expiring] │
│  points available         in 5 days        │
│                                             │
└─────────────────────────────────────────────┘
```

#### States

1. **Loading:** Show skeleton loader
2. **Error:** Show error message with retry button
3. **Success:** Show balance with animated number
4. **With Expiration:** Show balance + ExpiringPointsBadge

#### Accessibility

- `data-testid="wallet-balance"` for testing
- `aria-live="polite"` for balance updates (screen readers)
- Error messages announced to screen readers

#### Test Cases

```typescript
describe('WalletBalance', () => {
  it('displays loading skeleton when fetching', () => {});
  it('displays balance when loaded', () => {});
  it('formats balance with commas (1,500)', () => {});
  it('displays error message when query fails', () => {});
  it('allows retry on error', () => {});
  it('shows ExpiringPointsBadge when points expiring', () => {});
});
```

---

### TransactionHistory

**File:** `packages/web/src/components/wallet/TransactionHistory.tsx`

**Purpose:** Display paginated list of ledger entries (transaction history).

#### Props Interface

```typescript
interface TransactionHistoryProps {
  pageSize?: number; // Default: 10
  showPagination?: boolean; // Default: true
}
```

#### Implementation

```typescript
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTransactionHistory } from '@/hooks/useWallet';
import { TransactionItem } from './TransactionItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const TransactionHistory = ({
  pageSize = 10,
  showPagination = true
}: TransactionHistoryProps) => {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useTransactionHistory({
    page,
    pageSize,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: pageSize }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Failed to load transaction history.
      </div>
    );
  }

  if (!data?.entries || data.entries.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg">No transactions yet</p>
        <p className="text-sm mt-2">
          Your transaction history will appear here
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil((data.total || 0) / pageSize);

  return (
    <div>
      <Table>
        <TableCaption>
          Showing {data.entries.length} of {data.total} transactions
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Balance After</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.entries.map((entry) => (
            <TransactionItem key={entry.id} entry={entry} />
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### Visual Design (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ Date        Type     Amount     Balance After    Expiration │
├─────────────────────────────────────────────────────────────┤
│ 2025-11-15  EARN     +100       1,500            [30 days]  │
│ 2025-11-14  REDEEM   -50        1,400                       │
│ 2025-11-13  EARN     +200       1,450            [31 days]  │
│ ...                                                          │
├─────────────────────────────────────────────────────────────┤
│ Page 1 of 5                     [< Previous] [Next >]       │
└─────────────────────────────────────────────────────────────┘
```

#### States

1. **Loading:** Show skeleton rows
2. **Empty:** Show empty state message
3. **Error:** Show error message
4. **Success:** Show table with pagination

#### Responsive Behavior

- **Mobile:** Convert table to card-based list
- **Tablet/Desktop:** Show full table

#### Test Cases

```typescript
describe('TransactionHistory', () => {
  it('displays loading skeletons when fetching', () => {});
  it('displays empty state when no transactions', () => {});
  it('displays error message when query fails', () => {});
  it('renders transaction items in table', () => {});
  it('shows pagination controls when multiple pages', () => {});
  it('disables Previous button on first page', () => {});
  it('disables Next button on last page', () => {});
  it('navigates to next page when clicking Next', () => {});
});
```

---

### TransactionItem

**File:** `packages/web/src/components/wallet/TransactionItem.tsx`

**Purpose:** Single row in transaction history table.

#### Props Interface

```typescript
import type { LedgerEntryDto } from '@rewards-bolivia/shared-types';

interface TransactionItemProps {
  entry: LedgerEntryDto;
}
```

#### Implementation

```typescript
import { TableCell, TableRow } from '@/components/ui/table';
import { ExpiringPointsBadge } from './ExpiringPointsBadge';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export const TransactionItem = ({ entry }: TransactionItemProps) => {
  const isDebit = entry.debit > 0;
  const amount = isDebit ? entry.debit : entry.credit;
  const sign = isDebit ? '+' : '-';

  // Determine transaction type color
  const typeColor = {
    EARN: 'bg-green-100 text-green-800',
    REDEEM: 'bg-blue-100 text-blue-800',
    BURN: 'bg-orange-100 text-orange-800',
    ADJUSTMENT: 'bg-purple-100 text-purple-800',
    EXPIRE: 'bg-red-100 text-red-800',
  }[entry.type] || 'bg-gray-100 text-gray-800';

  return (
    <TableRow>
      {/* Date */}
      <TableCell className="font-medium">
        {formatDate(entry.createdAt)}
      </TableCell>

      {/* Type Badge */}
      <TableCell>
        <Badge className={typeColor} variant="secondary">
          {entry.type}
        </Badge>
      </TableCell>

      {/* Amount */}
      <TableCell className="text-right">
        <span className={isDebit ? 'text-green-600' : 'text-red-600'}>
          {sign}{amount.toLocaleString()}
        </span>
      </TableCell>

      {/* Balance After */}
      <TableCell className="text-right font-medium">
        {entry.balanceAfter.toLocaleString()}
      </TableCell>

      {/* Expiration Badge (only for EARN) */}
      <TableCell>
        {entry.type === 'EARN' && (
          <ExpiringPointsBadge entryId={entry.id} />
        )}
      </TableCell>
    </TableRow>
  );
};
```

#### Visual Examples

**EARN Transaction:**
```
| 2025-11-15 | [EARN] | +100 | 1,500 | [⚠️ 30 days] |
```

**REDEEM Transaction:**
```
| 2025-11-14 | [REDEEM] | -50 | 1,400 |              |
```

#### Test Cases

```typescript
describe('TransactionItem', () => {
  it('renders EARN transaction with green amount', () => {});
  it('renders REDEEM transaction with red amount', () => {});
  it('formats date correctly', () => {});
  it('displays balance after transaction', () => {});
  it('shows expiration badge only for EARN', () => {});
  it('displays correct type badge color', () => {});
});
```

---

### RedeemPointsForm

**File:** `packages/web/src/components/wallet/RedeemPointsForm.tsx`

**Purpose:** Form for redeeming points with validation and confirmation.

#### Props Interface

```typescript
interface RedeemPointsFormProps {
  purchaseAmount: number;
  availableBalance: number;
  onSuccess?: () => void;
}
```

#### Implementation

```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRedeemPoints } from '@/hooks/useWallet';
import { ConfirmRedemptionDialog } from './ConfirmRedemptionDialog';
import { Loader2 } from 'lucide-react';

interface FormData {
  pointsToRedeem: number;
}

export const RedeemPointsForm = ({
  purchaseAmount,
  availableBalance,
  onSuccess
}: RedeemPointsFormProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { mutate: redeemPoints, isPending } = useRedeemPoints();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: { pointsToRedeem: 0 },
  });

  const pointsToRedeem = watch('pointsToRedeem');

  // Calculate max redeemable points (30% of purchase)
  const maxRedeemable = Math.min(
    Math.floor(purchaseAmount * 0.3),
    availableBalance
  );

  // Calculate discount preview
  const discountAmount = (pointsToRedeem || 0) * 0.01; // 1 point = $0.01

  const onSubmit = (data: FormData) => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    redeemPoints(
      {
        points: pointsToRedeem,
        businessId: 'business-id', // TODO: Get from context
        purchaseAmount,
      },
      {
        onSuccess: () => {
          reset();
          setShowConfirmation(false);
          onSuccess?.();
        },
      }
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Points Input */}
        <div>
          <Label htmlFor="pointsToRedeem">Points to Redeem</Label>
          <Input
            id="pointsToRedeem"
            type="number"
            min={0}
            max={maxRedeemable}
            {...register('pointsToRedeem', {
              required: 'Please enter points to redeem',
              min: {
                value: 1,
                message: 'Must redeem at least 1 point',
              },
              max: {
                value: maxRedeemable,
                message: `Maximum ${maxRedeemable} points (30% of purchase)`,
              },
              validate: {
                available: (value) =>
                  value <= availableBalance ||
                  `Insufficient balance (${availableBalance} available)`,
              },
            })}
            className={errors.pointsToRedeem ? 'border-red-500' : ''}
          />
          {errors.pointsToRedeem && (
            <p
              className="text-sm text-red-600 mt-1"
              data-testid="error-message"
            >
              {errors.pointsToRedeem.message}
            </p>
          )}
          <p className="text-sm text-gray-600 mt-1">
            Maximum: {maxRedeemable.toLocaleString()} points (30% of purchase)
          </p>
        </div>

        {/* Discount Preview */}
        {pointsToRedeem > 0 && (
          <div
            className="p-4 bg-green-50 border border-green-200 rounded-lg"
            data-testid="discount-preview"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">Discount:</span>
              <span className="text-2xl font-bold text-green-600">
                -${discountAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
              <span>New Total:</span>
              <span className="font-medium">
                ${(purchaseAmount - discountAmount).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !pointsToRedeem || !!errors.pointsToRedeem}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Redeem Points'
          )}
        </Button>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmRedemptionDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        pointsToRedeem={pointsToRedeem}
        discountAmount={discountAmount}
        isLoading={isPending}
      />
    </>
  );
};
```

#### Visual Design

```
┌─────────────────────────────────────────────┐
│ Points to Redeem                            │
│ ┌─────────────────────────────────────────┐ │
│ │ [        300        ]                   │ │
│ └─────────────────────────────────────────┘ │
│ Maximum: 300 points (30% of purchase)       │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Discount:                     -$3.00    │ │
│ │ New Total:                    $997.00   │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ [     Redeem Points     ]                   │
└─────────────────────────────────────────────┘
```

#### Validation Rules

1. **Required:** Must enter a value
2. **Min:** At least 1 point
3. **Max (30% Rule):** Cannot exceed 30% of purchase amount
4. **Max (Balance):** Cannot exceed available balance
5. **Type:** Must be a positive integer

#### Test Cases

```typescript
describe('RedeemPointsForm', () => {
  it('calculates max redeemable as 30% of purchase', () => {});
  it('shows validation error when exceeding 30% limit', () => {});
  it('shows validation error when exceeding balance', () => {});
  it('displays discount preview when points entered', () => {});
  it('disables submit button when form invalid', () => {});
  it('shows confirmation dialog on submit', () => {});
  it('resets form after successful redemption', () => {});
  it('shows loading state during mutation', () => {});
});
```

---

### ConfirmRedemptionDialog

**File:** `packages/web/src/components/wallet/ConfirmRedemptionDialog.tsx`

**Purpose:** Confirmation dialog before finalizing redemption.

#### Props Interface

```typescript
interface ConfirmRedemptionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pointsToRedeem: number;
  discountAmount: number;
  isLoading?: boolean;
}
```

#### Implementation

```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const ConfirmRedemptionDialog = ({
  open,
  onClose,
  onConfirm,
  pointsToRedeem,
  discountAmount,
  isLoading = false,
}: ConfirmRedemptionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Redemption</DialogTitle>
          <DialogDescription>
            Please confirm you want to redeem your points for this discount.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Points to redeem:</span>
            <span className="font-bold text-lg">
              {pointsToRedeem.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Discount amount:</span>
            <span className="font-bold text-lg text-green-600">
              ${discountAmount.toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Redemption'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

#### Visual Design

```
┌─────────────────────────────────────────────┐
│ Confirm Redemption                      [X] │
├─────────────────────────────────────────────┤
│ Please confirm you want to redeem your      │
│ points for this discount.                   │
│                                             │
│ Points to redeem:                    300    │
│ Discount amount:                   $3.00    │
│                                             │
├─────────────────────────────────────────────┤
│               [Cancel] [Confirm Redemption] │
└─────────────────────────────────────────────┘
```

#### Test Cases

```typescript
describe('ConfirmRedemptionDialog', () => {
  it('displays points to redeem', () => {});
  it('displays discount amount', () => {});
  it('calls onConfirm when Confirm clicked', () => {});
  it('calls onClose when Cancel clicked', () => {});
  it('disables buttons when loading', () => {});
  it('shows loading state on Confirm button', () => {});
});
```

---

### ExpirationWarning

**File:** `packages/web/src/components/wallet/ExpirationWarning.tsx`

**Purpose:** Banner warning when points are expiring soon.

#### Props Interface

```typescript
interface ExpirationWarningProps {
  threshold?: number; // Days threshold (default: 7)
}
```

#### Implementation

```typescript
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTransactionHistory } from '@/hooks/useWallet';
import { AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

export const ExpirationWarning = ({ threshold = 7 }: ExpirationWarningProps) => {
  const { data } = useTransactionHistory({ pageSize: 100 });

  // Calculate expiring points
  const expiringPoints = useMemo(() => {
    if (!data?.entries) return null;

    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + threshold);

    const expiring = data.entries.filter(entry => {
      if (entry.type !== 'EARN') return false;
      if (!entry.expiresAt) return false;

      const expiryDate = new Date(entry.expiresAt);
      return expiryDate >= now && expiryDate <= thresholdDate;
    });

    if (expiring.length === 0) return null;

    const totalPoints = expiring.reduce((sum, e) => sum + e.debit, 0);
    const earliestExpiry = new Date(
      Math.min(...expiring.map(e => new Date(e.expiresAt!).getTime()))
    );

    return {
      points: totalPoints,
      expiryDate: earliestExpiry,
      daysUntil: Math.ceil(
        (earliestExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
    };
  }, [data, threshold]);

  if (!expiringPoints) return null;

  const variant = expiringPoints.daysUntil <= 3 ? 'destructive' : 'default';

  return (
    <Alert variant={variant} className="border-yellow-500 bg-yellow-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Points Expiring Soon</AlertTitle>
      <AlertDescription>
        <strong>{expiringPoints.points.toLocaleString()} points</strong> will
        expire in <strong>{expiringPoints.daysUntil} days</strong> (
        {expiringPoints.expiryDate.toLocaleDateString()}). Use them before they
        expire!
      </AlertDescription>
    </Alert>
  );
};
```

#### Visual Design

**Warning (7-3 days):**
```
┌─────────────────────────────────────────────┐
│ ⚠️  Points Expiring Soon                    │
│ 200 points will expire in 5 days            │
│ (2025-11-20). Use them before they expire!  │
└─────────────────────────────────────────────┘
Yellow background, orange border
```

**Urgent (<3 days):**
```
┌─────────────────────────────────────────────┐
│ 🚨 Points Expiring Soon                     │
│ 200 points will expire in 2 days            │
│ (2025-11-17). Use them before they expire!  │
└─────────────────────────────────────────────┘
Red background, red border
```

#### Test Cases

```typescript
describe('ExpirationWarning', () => {
  it('does not render when no points expiring', () => {});
  it('renders warning when points expiring within threshold', () => {});
  it('displays correct point count', () => {});
  it('displays correct days until expiration', () => {});
  it('shows yellow variant for 7-3 days', () => {});
  it('shows red variant for <3 days', () => {});
});
```

---

### ExpiringPointsBadge

**File:** `packages/web/src/components/wallet/ExpiringPointsBadge.tsx`

**Purpose:** Small badge showing days until expiration.

#### Props Interface

```typescript
interface ExpiringPointsBadgeProps {
  entryId?: string; // Optional: if provided, fetch entry details
  expiresAt?: Date; // Optional: if provided, use directly
  points?: number; // Optional: display point count
}
```

#### Implementation

```typescript
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMemo } from 'react';

export const ExpiringPointsBadge = ({
  entryId,
  expiresAt,
  points,
}: ExpiringPointsBadgeProps) => {
  const expiryInfo = useMemo(() => {
    if (!expiresAt) return null;

    const now = new Date();
    const expiry = new Date(expiresAt);
    const daysUntil = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil <= 0) return null; // Already expired

    return {
      daysUntil,
      expiryDate: expiry,
      variant: daysUntil <= 7 ? 'destructive' : 'secondary',
    };
  }, [expiresAt]);

  if (!expiryInfo) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={expiryInfo.variant as any}>
            {points && `${points} pts · `}
            {expiryInfo.daysUntil}d
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {points && `${points} points `}
            expiring on {expiryInfo.expiryDate.toLocaleDateString()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
```

#### Visual Examples

**Far from expiration (>7 days):**
```
[200 pts · 30d]  (gray badge)
```

**Expiring soon (≤7 days):**
```
[200 pts · 5d]  (red badge)
```

**Tooltip on hover:**
```
┌────────────────────────────────┐
│ 200 points expiring on         │
│ 2025-11-20                     │
└────────────────────────────────┘
```

#### Test Cases

```typescript
describe('ExpiringPointsBadge', () => {
  it('does not render when no expiration date', () => {});
  it('does not render when already expired', () => {});
  it('displays days until expiration', () => {});
  it('displays point count when provided', () => {});
  it('shows gray variant when >7 days', () => {});
  it('shows red variant when ≤7 days', () => {});
  it('shows tooltip with full date on hover', () => {});
});
```

---

## 🔗 API Hooks Specification

### useWalletBalance

**File:** `packages/web/src/hooks/useWallet.ts`

**Purpose:** Query hook for fetching user's points balance.

#### Signature

```typescript
export const useWalletBalance = (): UseQueryResult<number, Error>
```

#### Implementation Details

```typescript
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
```

#### Return Value

```typescript
{
  data: number | undefined;       // Points balance
  isLoading: boolean;              // Loading state
  error: Error | null;             // Error object
  refetch: () => Promise<void>;    // Manual refetch function
  isRefetching: boolean;           // Refetch in progress
}
```

#### Usage Example

```typescript
const { data: balance, isLoading, error } = useWalletBalance();

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
return <div>{balance} points</div>;
```

---

### useTransactionHistory

**File:** `packages/web/src/hooks/useWallet.ts`

**Purpose:** Query hook for fetching paginated transaction history.

#### Signature

```typescript
export const useTransactionHistory = (
  params?: LedgerQueryParams
): UseQueryResult<PaginatedLedgerResponse, Error>
```

#### Parameters

```typescript
interface LedgerQueryParams {
  accountId?: string;      // Auto-filled from auth
  transactionId?: string;  // Filter by transaction
  startDate?: string;      // ISO date string
  endDate?: string;        // ISO date string
  page?: number;           // Page number (1-indexed)
  pageSize?: number;       // Items per page
}
```

#### Return Value

```typescript
{
  data: {
    entries: LedgerEntryDto[];
    total: number;
    page: number;
    pageSize: number;
  } | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

#### Usage Example

```typescript
const { data, isLoading } = useTransactionHistory({
  page: 1,
  pageSize: 10,
});

if (isLoading) return <Skeleton />;
return (
  <Table>
    {data?.entries.map(entry => (
      <TransactionItem key={entry.id} entry={entry} />
    ))}
  </Table>
);
```

---

### useRedeemPoints

**File:** `packages/web/src/hooks/useWallet.ts`

**Purpose:** Mutation hook for redeeming points.

#### Signature

```typescript
export const useRedeemPoints = (): UseMutationResult<
  TransactionDto,
  Error,
  RedeemPointsDto
>
```

#### Parameters (mutation function)

```typescript
interface RedeemPointsDto {
  points: number;          // Points to redeem
  businessId: string;      // Business receiving payment
  purchaseAmount: number;  // Total purchase amount
}
```

#### Return Value

```typescript
{
  mutate: (dto: RedeemPointsDto) => void;
  mutateAsync: (dto: RedeemPointsDto) => Promise<TransactionDto>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  data: TransactionDto | undefined;
  reset: () => void;
}
```

#### Usage Example

```typescript
const { mutate: redeemPoints, isPending } = useRedeemPoints();

const handleSubmit = (data: FormData) => {
  redeemPoints(
    {
      points: data.pointsToRedeem,
      businessId: 'biz-123',
      purchaseAmount: 1000,
    },
    {
      onSuccess: (transaction) => {
        toast({ title: 'Points redeemed!' });
        navigate('/wallet');
      },
      onError: (error) => {
        toast({ title: 'Failed', description: error.message });
      },
    }
  );
};
```

---

## 📘 Type Definitions

### Shared Types (from @rewards-bolivia/shared-types)

```typescript
// Already defined in shared-types package
export interface UserDto {
  id: string;
  email: string;
  pointsBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LedgerEntryDto {
  id: string;
  accountId: string;
  type: 'EARN' | 'REDEEM' | 'BURN' | 'ADJUSTMENT' | 'EXPIRE';
  debit: number;
  credit: number;
  balanceAfter: number;
  transactionId?: string;
  description?: string;
  hash?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface TransactionDto {
  id: string;
  type: 'EARN' | 'REDEEM';
  points: number;
  userId: string;
  businessId: string;
  balanceAfter: number;
  createdAt: Date;
}

export interface RedeemPointsDto {
  points: number;
  businessId: string;
  purchaseAmount: number;
}

export interface EarnPointsDto {
  points: number;
  userId: string;
  businessId: string;
  purchaseAmount: number;
}
```

### Frontend-Specific Types

**File:** `packages/web/src/lib/wallet-api.ts`

```typescript
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

export interface ExpirationInfo {
  points: number;
  expiryDate: Date;
  daysUntil: number;
}
```

---

## 🎨 Component Props Reference

### Quick Reference Table

| Component | Required Props | Optional Props |
|-----------|---------------|----------------|
| `WalletPage` | None | None |
| `CheckoutPage` | None | None |
| `WalletBalance` | None | None |
| `TransactionHistory` | None | `pageSize`, `showPagination` |
| `TransactionItem` | `entry` | None |
| `RedeemPointsForm` | `purchaseAmount`, `availableBalance` | `onSuccess` |
| `ConfirmRedemptionDialog` | `open`, `onClose`, `onConfirm`, `pointsToRedeem`, `discountAmount` | `isLoading` |
| `ExpirationWarning` | None | `threshold` |
| `ExpiringPointsBadge` | None | `entryId`, `expiresAt`, `points` |

---

## 🔄 State Management Patterns

### Pattern 1: Server State (TanStack Query)

**Use for:** Data from backend APIs (balance, transactions, ledger)

```typescript
// ✅ Correct
const { data: balance, isLoading } = useWalletBalance();

// ❌ Wrong - don't manage server state in useState
const [balance, setBalance] = useState(null);
useEffect(() => {
  fetchBalance().then(setBalance);
}, []);
```

### Pattern 2: UI State (useState)

**Use for:** Local component state (modals, dropdowns, form inputs)

```typescript
// ✅ Correct
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedFilter, setSelectedFilter] = useState('all');

// ❌ Wrong - don't use TanStack Query for UI state
const { data: isModalOpen } = useQuery(['modalOpen'], () => false);
```

### Pattern 3: Form State (react-hook-form)

**Use for:** Form validation and submission

```typescript
// ✅ Correct
const { register, handleSubmit, formState: { errors } } = useForm();

// ❌ Wrong - managing form state manually
const [values, setValues] = useState({});
const [errors, setErrors] = useState({});
```

### Pattern 4: Optimistic Updates

**Use for:** Instant UI feedback before API confirmation

```typescript
// ✅ Correct - in mutation
onMutate: async (variables) => {
  await queryClient.cancelQueries(['balance']);
  const previous = queryClient.getQueryData(['balance']);
  queryClient.setQueryData(['balance'], old => old - variables.points);
  return { previous };
},
onError: (err, variables, context) => {
  queryClient.setQueryData(['balance'], context.previous);
},
```

---

## 📱 Responsive Design Breakpoints

### Tailwind Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Small devices (landscape phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // 2X large devices
};
```

### Component-Specific Responsive Behavior

#### WalletPage

```css
/* Mobile (< 768px) */
- Stack all cards vertically
- Full width with padding: px-4
- Font size: text-2xl for headings

/* Tablet (768px - 1023px) */
- Stack vertically
- Max width: 720px
- Center aligned: mx-auto

/* Desktop (≥ 1024px) */
- Max width: 1200px
- Center aligned: mx-auto
```

#### TransactionHistory

```css
/* Mobile */
- Convert table to card-based list
- Stack transaction details vertically
- Hide less important columns

/* Tablet & Desktop */
- Show full table layout
- All columns visible
```

**Mobile Layout Example:**
```
┌─────────────────────────────┐
│ [EARN] +100                 │
│ 2025-11-15                  │
│ Balance: 1,500              │
│ [⚠️ Expiring in 30 days]    │
└─────────────────────────────┘
```

#### RedeemPointsForm

```css
/* All sizes */
- Full width form fields
- Stack elements vertically
- Adjust font sizes responsively
```

---

## ✨ Animation Specifications

### 1. Balance Count-Up Animation

**When:** Balance changes after redemption

**Library:** `react-countup` or CSS transitions

**Implementation:**

```typescript
import CountUp from 'react-countup';

<CountUp
  start={previousBalance}
  end={currentBalance}
  duration={1}
  separator=","
  decimals={0}
/>
```

**Alternative (CSS):**

```css
.balance {
  transition: all 0.3s ease-in-out;
}
```

### 2. Toast Animations

**Enter:** Slide in from top, fade in
**Exit:** Fade out, slide up

**Duration:**
- Enter: 300ms
- Stay: 3s (success), 5s (error)
- Exit: 200ms

### 3. Skeleton Loading

**Animation:** Pulse effect

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### 4. Button Loading Spinner

**Animation:** Rotate spinner icon

```typescript
<Loader2 className="mr-2 h-4 w-4 animate-spin" />
```

### 5. Page Transitions

**When:** Navigating between Wallet ↔ Checkout

**Animation:** Fade in (optional, via Framer Motion if needed)

```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>
```

---

## ♿ Accessibility Requirements

### 1. Keyboard Navigation

**Requirements:**
- All interactive elements focusable via Tab
- Logical tab order (top to bottom, left to right)
- Escape key closes modals/dialogs
- Enter key submits forms

**Implementation:**
```typescript
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
/>
```

### 2. Screen Reader Support

**Requirements:**
- Use semantic HTML (`<button>`, `<nav>`, `<table>`)
- Provide `aria-label` for icon-only buttons
- Use `aria-live` for dynamic content updates
- Provide `role` attributes where needed

**Example:**
```typescript
<button aria-label="Redeem points">
  <Coins className="w-4 h-4" />
</button>

<div aria-live="polite" aria-atomic="true">
  {balance} points available
</div>
```

### 3. Color Contrast

**Requirements:**
- WCAG AA minimum: 4.5:1 for normal text
- WCAG AA minimum: 3:1 for large text
- Don't rely on color alone (use icons + text)

**Implementation:**
- Green for success: `text-green-600` (sufficient contrast)
- Red for errors: `text-red-600` (sufficient contrast)
- Use badges with both color AND text

### 4. Focus Indicators

**Requirements:**
- Visible focus ring on all interactive elements
- Use Tailwind's `focus:ring` utilities

**Example:**
```typescript
className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
```

### 5. Error Announcements

**Requirements:**
- Form errors announced to screen readers
- Use `aria-describedby` to link errors to inputs

**Example:**
```typescript
<Input
  id="pointsToRedeem"
  aria-invalid={!!errors.pointsToRedeem}
  aria-describedby={errors.pointsToRedeem ? 'points-error' : undefined}
/>
{errors.pointsToRedeem && (
  <p id="points-error" role="alert">
    {errors.pointsToRedeem.message}
  </p>
)}
```

### 6. Loading States

**Requirements:**
- Announce loading states to screen readers
- Use `aria-busy="true"` during async operations

**Example:**
```typescript
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? 'Loading...' : content}
</div>
```

---

## 📋 Component Checklist

Use this checklist when implementing each component:

### Before Implementation
- [ ] Read component specification
- [ ] Understand props interface
- [ ] Review design mockup (if available)
- [ ] Identify required shadcn/ui components

### During Implementation
- [ ] Create component file with TypeScript
- [ ] Define props interface
- [ ] Implement loading state
- [ ] Implement error state
- [ ] Implement success state
- [ ] Add responsive styles (mobile, tablet, desktop)
- [ ] Add accessibility attributes (ARIA, keyboard support)
- [ ] Add data-testid for testing

### After Implementation
- [ ] Write unit tests (target 60% coverage)
- [ ] Test on mobile viewport
- [ ] Test on tablet viewport
- [ ] Test on desktop viewport
- [ ] Test keyboard navigation
- [ ] Test with screen reader (optional but recommended)
- [ ] Verify no console errors/warnings
- [ ] Code review with team

---

## 🔗 Related Documents

- [Epic 7 Implementation Plan](./epic_7_implementation_plan.md) - Overall implementation strategy
- [Sprint 2 Backlog](./sprint_2_módulos_de_transacciones_y_economía.md) - Sprint status
- [CLAUDE.md](../../../../../CLAUDE.md) - Project conventions
- [Ledger API Guide](../../../../../docs/api/ledger-endpoints.md) - Backend API reference

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-15 | 1.0 | Initial component design spec created | Claude |

---

## 🎯 Next Steps

1. **Review this spec** with the team
2. **Set up shadcn/ui** components (run installation commands)
3. **Start with WalletBalance** component (simplest, no dependencies)
4. **Follow the timeline** in Implementation Plan
5. **Use this spec** as reference during development

---

> 💡 **Tip:** Keep this document open while coding. Each component specification includes everything you need: props, implementation, styling, and tests.

> 🎨 **Design Note:** All components use shadcn/ui for consistency. Customize theme colors in `tailwind.config.js` if needed.
