import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { UserDto } from '@rewards-bolivia/sdk';
import type { LedgerEntryDto } from '@rewards-bolivia/shared-types';

// Mock the SDK before importing wallet-api
vi.mock('@rewards-bolivia/sdk', () => ({
  UsersApi: vi.fn(),
  TransactionsApi: vi.fn(),
  LedgerApi: vi.fn(),
  Configuration: vi.fn(),
}));

// Mock the ApiService
vi.mock('./api', () => ({
  ApiService: {
    getInstance: vi.fn(() => ({
      api: {
        defaults: { baseURL: '/api' },
        interceptors: { response: { use: vi.fn() } },
      },
    })),
  },
}));

// Import after mocks are set up
import { walletApi } from './wallet-api';
import * as sdk from '@rewards-bolivia/sdk';

describe('walletApi Service Layer', () => {
  let mockUsersApi: any;
  let mockTransactionsApi: any;
  let mockLedgerApi: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock instances
    mockUsersApi = {
      usersControllerFindOneById: vi.fn(),
      usersControllerGetProfile: vi.fn(),
    };

    mockTransactionsApi = {
      transactionsControllerRedeemPoints: vi.fn(),
      transactionsControllerEarnPoints: vi.fn(),
    };

    mockLedgerApi = {
      ledgerControllerQueryEntries: vi.fn(),
      ledgerControllerGetEntry: vi.fn(),
      ledgerControllerVerifyEntry: vi.fn(),
    };

    // Mock constructor calls
    (sdk.UsersApi as any).mockImplementation(() => mockUsersApi);
    (sdk.TransactionsApi as any).mockImplementation(() => mockTransactionsApi);
    (sdk.LedgerApi as any).mockImplementation(() => mockLedgerApi);
  });

  describe('getBalance', () => {
    it('should fetch user balance and return points', async () => {
      const mockUserData: UserDto = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'client',
        pointsBalance: 1500,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      mockUsersApi.usersControllerFindOneById.mockResolvedValue({
        data: mockUserData,
      });

      const balance = await walletApi.getBalance('user-1');

      expect(balance).toBe(1500);
      expect(mockUsersApi.usersControllerFindOneById).toHaveBeenCalledWith('user-1');
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      mockUsersApi.usersControllerFindOneById.mockRejectedValue(error);

      await expect(walletApi.getBalance('user-1')).rejects.toThrow('API Error');
    });
  });

  describe('getUser', () => {
    it('should fetch and return complete user profile', async () => {
      const mockUser: UserDto = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'client',
        pointsBalance: 1000,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      };

      mockUsersApi.usersControllerFindOneById.mockResolvedValue({
        data: mockUser,
      });

      const user = await walletApi.getUser('user-1');

      expect(user).toEqual(mockUser);
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('client');
    });
  });

  describe('getLedgerEntries', () => {
    it('should fetch paginated ledger entries', async () => {
      const mockEntries: LedgerEntryDto[] = [
        {
          id: 'entry-1',
          type: 'EARN',
          accountId: 'user-1',
          debit: 500,
          credit: 0,
          balanceAfter: 1000,
          hash: 'hash-1',
          createdAt: '2025-01-10T10:00:00Z',
          transactionId: 'tx-1',
        },
      ];

      mockLedgerApi.ledgerControllerQueryEntries.mockResolvedValue({
        data: {
          entries: mockEntries,
          total: 1,
          limit: 10,
          offset: 0,
        },
      });

      const result = await walletApi.getLedgerEntries({
        accountId: 'user-1',
        page: 1,
        pageSize: 10,
      });

      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].type).toBe('EARN');
      expect(result.total).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      mockLedgerApi.ledgerControllerQueryEntries.mockResolvedValue({
        data: {
          entries: [],
          total: 100,
          limit: 10,
          offset: 20,
        },
      });

      await walletApi.getLedgerEntries({
        page: 3,
        pageSize: 10,
      });

      // Pagination parameters are passed directly
      expect(mockLedgerApi.ledgerControllerQueryEntries).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        10,
        3
      );
    });
  });

  describe('getLedgerEntry', () => {
    it('should fetch single ledger entry by ID', async () => {
      const mockEntry: LedgerEntryDto = {
        id: 'entry-1',
        type: 'REDEEM',
        accountId: 'user-1',
        debit: 0,
        credit: 300,
        balanceAfter: 700,
        hash: 'hash-1',
        createdAt: '2025-01-15T14:30:00Z',
        transactionId: 'tx-1',
      };

      mockLedgerApi.ledgerControllerGetEntry.mockResolvedValue({
        data: mockEntry,
      });

      const entry = await walletApi.getLedgerEntry('entry-1');

      expect(entry.id).toBe('entry-1');
      expect(entry.type).toBe('REDEEM');
      expect(mockLedgerApi.ledgerControllerGetEntry).toHaveBeenCalledWith('entry-1');
    });
  });

  describe('verifyLedgerEntry', () => {
    it('should verify ledger entry hash', async () => {
      const mockVerification = {
        valid: true,
        message: 'Hash verified successfully',
      };

      mockLedgerApi.ledgerControllerVerifyEntry.mockResolvedValue({
        data: mockVerification,
      });

      const result = await walletApi.verifyLedgerEntry('entry-1');

      expect(result.valid).toBe(true);
      expect(result.message).toBe('Hash verified successfully');
    });
  });

  describe('redeemPoints', () => {
    it('should submit redemption request with correct payload', async () => {
      const mockTransaction = {
        id: 'tx-redeem-1',
        type: 'REDEEM',
        amount: 300,
        timestamp: '2025-01-16T10:00:00Z',
        status: 'COMPLETED',
      };

      mockTransactionsApi.transactionsControllerRedeemPoints.mockResolvedValue({
        data: mockTransaction,
      });

      const payload = {
        points: 300,
        businessId: 'biz-123',
        purchaseAmount: 1000,
      };

      const result = await walletApi.redeemPoints(payload);

      expect(result.type).toBe('REDEEM');
      expect(mockTransactionsApi.transactionsControllerRedeemPoints).toHaveBeenCalledWith(
        payload
      );
    });
  });

  describe('earnPoints', () => {
    it('should submit earn points request', async () => {
      const mockTransaction = {
        id: 'tx-earn-1',
        type: 'EARN',
        amount: 150,
        timestamp: '2025-01-16T11:00:00Z',
        status: 'COMPLETED',
      };

      mockTransactionsApi.transactionsControllerEarnPoints.mockResolvedValue({
        data: mockTransaction,
      });

      const payload = {
        customerId: 'user-1',
        purchaseAmount: 1500,
      };

      const result = await walletApi.earnPoints(payload);

      expect(result.type).toBe('EARN');
      expect(mockTransactionsApi.transactionsControllerEarnPoints).toHaveBeenCalledWith(
        payload
      );
    });
  });
});
