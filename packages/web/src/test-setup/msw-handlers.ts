import { http, HttpResponse } from 'msw';
import type { UserDto, EarnPointsDto } from '@rewards-bolivia/sdk';
import type { LedgerEntryDto, TransactionDto } from '@rewards-bolivia/shared-types';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Mock handlers for wallet-related API endpoints
 * Used by MSW (Mock Service Worker) in tests
 */

// Mock user data
const mockUser: UserDto = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'client',
  pointsBalance: 1000,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

// Mock ledger entries
const mockLedgerEntries: LedgerEntryDto[] = [
  {
    id: 'entry-1',
    type: 'EARN',
    accountId: 'test-user-1',
    debit: 500,
    credit: 0,
    balanceAfter: 1000,
    hash: 'hash-1',
    createdAt: '2025-01-10T10:00:00Z',
    transactionId: 'tx-1',
  },
  {
    id: 'entry-2',
    type: 'REDEEM',
    accountId: 'test-user-1',
    debit: 0,
    credit: 300,
    balanceAfter: 500,
    hash: 'hash-2',
    createdAt: '2025-01-15T14:30:00Z',
    transactionId: 'tx-2',
  },
];

/**
 * MSW handlers for wallet API endpoints
 * Provides mock responses for testing without hitting real API
 */
export const walletHandlers = [
  // GET /api/users/:id - Get user by ID
  http.get(`${API_BASE_URL}/users/:id`, () => {
    return HttpResponse.json(mockUser, { status: 200 });
  }),

  // GET /api/users/profile - Get current user profile
  http.get(`${API_BASE_URL}/users/profile`, () => {
    return HttpResponse.json(mockUser, { status: 200 });
  }),

  // GET /api/ledger/entries - Query ledger entries
  http.get(`${API_BASE_URL}/ledger/entries`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Return paginated response
    return HttpResponse.json(
      {
        entries: mockLedgerEntries.slice(offset, offset + limit),
        total: mockLedgerEntries.length,
        limit,
        offset,
      },
      { status: 200 }
    );
  }),

  // GET /api/ledger/entries/:id - Get single ledger entry
  http.get(`${API_BASE_URL}/ledger/entries/:id`, ({ params }) => {
    const entry = mockLedgerEntries.find((e) => e.id === params.id);
    if (entry) {
      return HttpResponse.json(entry, { status: 200 });
    }
    return HttpResponse.json({ message: 'Entry not found' }, { status: 404 });
  }),

  // GET /api/ledger/entries/:id/verify - Verify ledger entry
  http.get(`${API_BASE_URL}/ledger/entries/:id/verify`, ({ params }) => {
    const entry = mockLedgerEntries.find((e) => e.id === params.id);
    if (entry) {
      return HttpResponse.json(
        {
          valid: true,
          message: 'Hash verified',
          storedHash: entry.hash,
          computedHash: entry.hash,
          entry,
        },
        { status: 200 }
      );
    }
    return HttpResponse.json({ message: 'Entry not found' }, { status: 404 });
  }),

  // POST /api/transactions/redeem - Redeem points
  http.post(`${API_BASE_URL}/transactions/redeem`, async ({ request }) => {
    const body = (await request.json()) as {
      points: number;
      businessId: string;
      purchaseAmount: number;
    };

    const transaction: TransactionDto = {
      id: 'tx-redeem-new',
      type: 'REDEEM',
      amount: body.points,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      details: {
        businessId: body.businessId,
        purchaseAmount: body.purchaseAmount,
      },
    };

    return HttpResponse.json(transaction, { status: 200 });
  }),

  // POST /api/transactions/earn - Earn points
  http.post(`${API_BASE_URL}/transactions/earn`, async ({ request }) => {
    const body = (await request.json()) as EarnPointsDto;

    const transaction: TransactionDto = {
      id: 'tx-earn-new',
      type: 'EARN',
      amount: Math.floor(body.purchaseAmount * 0.1), // Mock: 10% of purchase
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      details: {
        customerId: body.customerId,
        purchaseAmount: body.purchaseAmount,
      },
    };

    return HttpResponse.json(transaction, { status: 200 });
  }),
];

/**
 * Handlers for error scenarios in wallet API
 * Use these in specific tests that require error conditions
 */
export const walletErrorHandlers = [
  // Simulate user not found error
  http.get(`${API_BASE_URL}/users/:id`, () => {
    return HttpResponse.json({ message: 'User not found' }, { status: 404 });
  }),

  // Simulate redeem failure
  http.post(`${API_BASE_URL}/transactions/redeem`, () => {
    return HttpResponse.json(
      { message: 'Insufficient balance to redeem points' },
      { status: 400 }
    );
  }),
];
